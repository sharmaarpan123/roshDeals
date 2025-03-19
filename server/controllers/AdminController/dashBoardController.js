import Admin from '../../database/models/Admin.js';
import AdminSubAdminLinker from '../../database/models/AdminSubAdminLinker.js';
import Order from '../../database/models/Order.js';
import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';
import { ADMIN_ROLE_TYPE_ENUM } from '../../utilities/commonTypes.js';
import { successResponse } from '../../utilities/Responses.js';
import {
    getAccessorId,
    isSuperAdminAccessingApi,
    MongooseObjectId,
} from '../../utilities/utilitis.js';
import { dashboardReportSchema } from './Schema.js';

const getLastWeekStartDateFromToday = () => {
    const last7thDate = new Date().getDate() - 7;
    const dateOf7thDay = new Date(new Date().setDate(last7thDate));
    return new Date(dateOf7thDay.setHours(0, 0, 0, 0));
};

const getPrevious12thMonthFromToday = () => {
    const previous12thMonthNumber = new Date().getMonth() - 12;
    return new Date(
        new Date(new Date().setMonth(previous12thMonthNumber))
            // set month
            .setHours(0, 0, 0, 0),
    ); // set housrs
};

const getPrevious30ThDateFromToday = () => {
    const previous30Day = new Date().getDate() - 30;
    return new Date(
        new Date(new Date().setDate(previous30Day)).setHours(0, 0, 0, 0), // set house
    );
};

export const dashboardController = catchAsync(async (req, res) => {
    const {
        endDate,
        startDate,
        revenueReportType = 'yearly',
    } = dashboardReportSchema.parse(req.body);

    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);
    const adminId = getAccessorId(req);

    const queryS = [];

    queryS.push(User.find({}).countDocuments()); // total users
    queryS.push(Order.find({}).countDocuments()); // total order
    queryS.push(
        Order.find({
            paymentStatus: 'pending',
        }).countDocuments(),
    ); // upPaid orders
    queryS.push(
        Order.aggregate([
            {
                $group: {
                    _id: '$orderFormStatus',
                    count: { $sum: 1 },
                },
            },
        ]),
    );

    queryS.push(
        Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                },
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealId',
                    foreignField: '_id',
                    as: 'dealsData',
                },
            },
            {
                $unwind: '$dealsData',
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealsData.parentDealId',
                    foreignField: '_id',
                    as: 'dealsData.parentDealId',
                },
            },
            {
                $unwind: {
                    path: '$dealsData.parentDealId',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    revenue: {
                        $toDouble: {
                            $ifNull: [
                                '$dealsData.parentDealId.adminCommission',
                                '$dealsData.adminCommission',
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    revenue: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$revenue' },
                },
            },
        ]),
    ); // total earning

    queryS.push(
        Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    // above check to sure if start date come then revenue report will not calculated on revenueReportType filter
                    ...(!startDate &&
                        revenueReportType === 'yearly' && {
                            paymentDate: {
                                $gte: getPrevious12thMonthFromToday(),
                            },
                        }),
                    ...(!startDate &&
                        revenueReportType === 'monthly' && {
                            paymentDate: {
                                $gte: getPrevious30ThDateFromToday(),
                            },
                        }),
                    ...(!startDate &&
                        revenueReportType === 'weekly' && {
                            paymentDate: {
                                $gte: getLastWeekStartDateFromToday(),
                            },
                        }),
                    ...(startDate && {
                        paymentDate: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        },
                    }),
                },
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealId',
                    foreignField: '_id',
                    as: 'dealsData',
                },
            },
            {
                $unwind: '$dealsData',
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealsData.parentDealId',
                    foreignField: '_id',
                    as: 'dealsData.parentDealId',
                },
            },
            {
                $unwind: {
                    path: '$dealsData.parentDealId',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    revenue: {
                        $toDouble: {
                            $ifNull: [
                                '$dealsData.parentDealId.adminCommission',
                                '$dealsData.adminCommission',
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    revenue: 1,
                    yearMonth: {
                        $dateToString: {
                            format:
                                !startDate && revenueReportType === 'yearly'
                                    ? '%Y-%m'
                                    : '%Y-%m-%d',
                            date: '$createdAt',
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$yearMonth',
                    totalEarnings: { $sum: '$revenue' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]),
    ); // revenue report

    queryS.push(
        Admin.find({
            roles: ADMIN_ROLE_TYPE_ENUM.ADMIN,
        }).countDocuments(),
    ); // total agency
    queryS.push(
        Admin.find({
            roles: ADMIN_ROLE_TYPE_ENUM.SUBADMIN,
        }).countDocuments(),
    ); // total mediators

    const data = await Promise.all(queryS);

    console.log(JSON.stringify(data[4]), 'Data');

    return res.status(200).json(
        successResponse({
            message: 'dashboard Data',
            data: {
                totalUsers: data[0],
                totalOrders: data[1],
                unPaidOrders: data[2],
                totalRevenue: data[4] && data[4][0]?.totalEarnings,
                orderStatus: data[3],
                revenueGraphData: data[5],
                totalAgency: data[6],
                totalMediator: data[7],
            },
        }),
    );
});
