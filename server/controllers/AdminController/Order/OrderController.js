import mongoose from 'mongoose';
import Deal from '../../../database/models/Deal.js';
import Order from '../../../database/models/Order.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ORDER_FORM_STATUS } from '../../../utilities/commonTypes.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    acceptRejectOrderSchema,
    allOrdersListSchema,
    bulkPaymentStatusUpdateSchema,
    paymentStatusUpdateSchema,
} from './Schema.js';
import User from '../../../database/models/User.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import moment from 'moment';

export const acceptRejectOrder = catchAsync(async (req, res) => {
    const { orderId, status, rejectReason } = acceptRejectOrderSchema.parse(
        req.body,
    );

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }

    if (
        (order.orderFormStatus === ORDER_FORM_STATUS.PENDING ||
            order.orderFormStatus === ORDER_FORM_STATUS.REJECTED ||
            order.orderFormStatus === ORDER_FORM_STATUS.ACCEPTED) &&
        (status === ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED ||
            status === ORDER_FORM_STATUS.REVIEW_FORM_REJECTED)
    ) {
        return res.status(400).json(
            errorResponse({
                message:
                    "You can't reject or accept the review Form till user not submitted his review form",
            }),
        );
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { orderFormStatus: status, rejectReason },
        { new: true },
    );

    const user = await User.findOne(
        { _id: updatedOrder.userId },
        { fcmToken: 1 },
    );

    let message = '';

    switch (status) {
        case ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED:
            message = 'Your review form is acFcepted';
            break;
        case ORDER_FORM_STATUS.REJECTED:
            message = 'Your order form is rejected';
            break;
        default:
            message = 'your order is ' + status;
    }

    sendNotification({
        notification: {
            body: 'Order status',
            title: message,
            imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
        },
        android: {
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
        },
        tokens: [user.fcmToken],
    });

    return res.status(200).json(
        successResponse({
            message: `order is ${status} successfully`,
            data: updatedOrder,
        }),
    );
});

export const paymentStatusUpdate = catchAsync(async (req, res) => {
    const { orderId, status } = paymentStatusUpdateSchema.parse(req.body);

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        {
            paymentStatus: status,
            ...(status === 'paid' && {
                paymentDate: moment().utc().toDate(),
            }),
        },
        { new: true },
    );

    return res.status(200).json(
        successResponse({
            message: `order payment status updated successfully`,
            data: updatedOrder,
        }),
    );
});

export const bulkPaymentStatusUpdate = catchAsync(async (req, res) => {
    const { orderIds, status } = bulkPaymentStatusUpdateSchema.parse(req.body);

    const order = await Order.find({ _id: { $in: orderIds } }, { _id: 1 });

    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }

    if (orderIds.length !== order.length) {
        return res.status(400).json(
            errorResponse({
                message: 'some of your ids not valid',
            }),
        );
    }

    const updatedOrder = await Order.updateMany(
        { _id: { $in: orderIds } },
        { paymentStatus: status },
        { new: true },
    );

    return res.status(200).json(
        successResponse({
            message: `orders payment status updated successfully`,
            data: updatedOrder,
        }),
    );
});

export const getAllOrders = catchAsync(async (req, res) => {
    const { offset, limit, dealId, brandId, orderFormStatus } =
        allOrdersListSchema.parse(req.body);

    const aggregateArr = [


        
        
        {
            $match: {
                ...(orderFormStatus && { orderFormStatus: orderFormStatus }),
                ...(dealId?.length > 0 && {
                    dealId: {
                        $in: dealId?.map(
                            (id) => new mongoose.Types.ObjectId(id),
                        ),
                    },
                }),
            },
        },
        {
            $lookup: {
                from: 'deals',
                localField: 'dealId',
                foreignField: '_id',
                as: 'dealId',
            },
        },
        { $unwind: '$dealId' },
        {
            $lookup: {
                from: 'brands',
                localField: 'dealId.brand',
                foreignField: '_id',
                as: 'dealId.brand',
            },
        },
        { $unwind: '$dealId.brand' },
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.dealCategory',
            },
        },
        { $unwind: '$dealId.dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.platForm',
                foreignField: '_id',
                as: 'dealId.platForm',
            },
        },
        { $unwind: '$dealId.platForm' },
        {
            $match: {
                ...(brandId && {
                    'dealId.brand._id': new mongoose.Types.ObjectId(brandId),
                }),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId',
            },
        },
        { $unwind: '$userId' },
        { $sort: { createdAt: -1 } },
    ];

    if (limit || offset) {
        aggregateArr.push({ $skip: offset || 0 });
        aggregateArr.push({ $limit: limit || 20 });
    }

    const orders = Order.aggregate(aggregateArr);

    if (limit || offset) {
        aggregateArr.pop();
        aggregateArr.pop();
    }

    aggregateArr.push({ $count: 'total' });

    const totalCount = Order.aggregate(aggregateArr);

    const data = await Promise.all([orders, totalCount]);

    return res.status(200).json(
        successResponse({
            message: 'orders list!',
            data: data[0],
            total: data[1].length > 0 ? data[1][0].total : 0,
        }),
    );
});

export const getAllOrdersAsMed = catchAsync(async (req, res) => {
    const { offset, limit, dealId, brandId, orderFormStatus } =
        allOrdersListSchema.parse(req.body);

    const aggregateArr = [
        {
            $match: {
                ...(orderFormStatus && { orderFormStatus: orderFormStatus }),
                ...(dealId?.length > 0 && {
                    dealId: {
                        $in: dealId?.map(
                            (id) => new mongoose.Types.ObjectId(id),
                        ),
                    },
                }),
            },
        },
        {
            $lookup: {
                from: 'deals',
                localField: 'dealId',
                foreignField: '_id',
                as: 'dealId',
            },
        },
        { $unwind: '$dealId' },
        {
            $lookup: {
                from: 'brands',
                localField: 'dealId.brand',
                foreignField: '_id',
                as: 'dealId.brand',
            },
        },
        { $unwind: '$dealId.brand' },
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.dealCategory',
            },
        },
        { $unwind: '$dealId.dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.platForm',
                foreignField: '_id',
                as: 'dealId.platForm',
            },
        },
        { $unwind: '$dealId.platForm' },
        {
            $match: {
                ...(brandId && {
                    'dealId.brand._id': new mongoose.Types.ObjectId(brandId),
                }),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId',
            },
        },
        { $unwind: '$userId' },
        { $sort: { createdAt: -1 } },
    ];

    if (limit || offset) {
        aggregateArr.push({ $skip: offset || 0 });
        aggregateArr.push({ $limit: limit || 20 });
    }

    const orders = Order.aggregate(aggregateArr);

    if (limit || offset) {
        aggregateArr.pop();
        aggregateArr.pop();
    }

    aggregateArr.push({ $count: 'total' });

    const totalCount = Order.aggregate(aggregateArr);

    const data = await Promise.all([orders, totalCount]);

    return res.status(200).json(
        successResponse({
            message: 'orders list!',
            data: data[0],
            total: data[1].length > 0 ? data[1][0].total : 0,
        }),
    );
});
