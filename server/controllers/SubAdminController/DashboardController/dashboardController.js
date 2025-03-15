import Order from '../../../database/models/Order.js';
import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import {
    getAccessorId,
    isSuperAdminAccessingApi,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';
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

    queryS.push(
        User.find({
            historyAdminReferences: adminId,
        }).countDocuments(),
    ); // total users
    queryS.push(
        Order.find({
            dealOwner: adminId,
        }).countDocuments(),
    ); // total order
    queryS.push(
        Order.find({
            dealOwner: adminId,
            paymentStatus: 'pending',
        }).countDocuments(),
    ); // upPaid orders
    queryS.push(
        Order.aggregate([
            {
                $match: {
                    dealOwner: MongooseObjectId(adminId),
                },
            },
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
                    dealOwner: MongooseObjectId(adminId),
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
                $addFields: {
                    revenue: {
                        $toDouble: {
                            $ifNull: [
                                {
                                    $cond: {
                                        if: '$dealsData.isCommissionDeal',
                                        then: {
                                            $toDouble: {
                                                $ifNull: [
                                                    '$dealsData.commissionValue',
                                                    '0',
                                                ],
                                            },
                                        },
                                        else: {
                                            $toDouble: {
                                                $ifNull: [
                                                    '$dealsData.lessAmount',
                                                    '0',
                                                ],
                                            },
                                        },
                                    },
                                },
                                0,
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
                    ...(!isSuperAdminAccessing && { dealOwner: adminId }),
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
                $addFields: {
                    revenue: {
                        $toDouble: {
                            $ifNull: [
                                {
                                    $cond: {
                                        if: '$dealsData.isCommissionDeal',
                                        then: {
                                            $toDouble: {
                                                $ifNull: [
                                                    '$dealsData.commissionValue',
                                                    '0',
                                                ],
                                            },
                                        },
                                        else: {
                                            $toDouble: {
                                                $ifNull: [
                                                    '$dealsData.lessAmount',
                                                    '0',
                                                ],
                                            },
                                        },
                                    },
                                },
                                0,
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

    const data = await Promise.all(queryS);

    console.log(data, 'Data');

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
            },
        }),
    );
});
