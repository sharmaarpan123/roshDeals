import Order from '../../database/models/Order.js';
import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';
import { successResponse } from '../../utilities/Responses.js';

export const dashboardController = catchAsync(async (req, res) => {
    const queryS = [];

    queryS.push(User.find({}).countDocuments()); // total users
    queryS.push(Order.find({}).countDocuments()); // total order
    queryS.push(Order.find({ paymentStatus: 'pending' }).countDocuments()); // upPaid orders
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
                $match: { paymentStatus: 'paid' },
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
                    adminCommission: {
                        $toDouble: '$dealsData.adminCommission',
                    },
                },
            },
            {
                $project: {
                    adminCommission: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$adminCommission' },
                },
            },
        ]),
    ); // total earning

    queryS.push(
        Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: {
                        $gte: new Date(
                            new Date().setMonth(new Date().getMonth() - 12),
                        ),
                    },
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
                    adminCommission: {
                        $toDouble: '$dealsData.adminCommission',
                    },
                },
            },
            {
                $project: {
                    adminCommission: 1,
                    yearMonth: {
                        $dateToString: { format: '%Y-%m', date: '$createdAt' },
                    },
                },
            },
            {
                $group: {
                    _id: '$yearMonth',
                    totalEarnings: { $sum: '$adminCommission' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]),
    );

    const data = await Promise.all(queryS);

    return res.status(200).json(
        successResponse({
            message: 'dashboard Data',
            data: {
                totalUsers: data[0],
                totalOrders: data[1],
                unPaidOrders: data[2],
                totalRevenue: data[4] && data[4][0]?.totalEarnings,
                orderStatus: data[3],
                MonthsEarning: data[5],
            },
        }),
    );
});
