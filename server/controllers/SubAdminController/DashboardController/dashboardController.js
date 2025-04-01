import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
import Order from '../../../database/models/Order.js';
import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import {
    getAccessorId,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';

export const dashboardController = catchAsync(async (req, res) => {
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
    ); // order status

    queryS.push(
        AdminSubAdminLinker.find({
            adminId: adminId,
        }).countDocuments(),
    ); // total mediator

    const data = await Promise.all(queryS);

    return res.status(200).json(
        successResponse({
            message: 'dashboard Data',
            data: {
                totalUsers: data[0],
                totalOrders: data[1],
                unPaidOrders: data[2],
                orderStatus: data[3],
                totalMediator: data[4],
            },
        }),
    );
});
