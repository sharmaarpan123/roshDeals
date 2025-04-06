import moment from 'moment';
import mongoose from 'mongoose';
import Order from '../../../database/models/Order.js';
import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ORDER_FORM_STATUS } from '../../../utilities/commonTypes.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import {
    isAdminAccessingApi,
    isSuperAdminAccessingApi,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';
import {
    acceptRejectOrderSchema,
    allOrdersListSchema,
    bulkPaymentStatusUpdateSchema,
    paymentStatusUpdateSchema,
} from './Schema.js';
import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
import Notifications, {
    notificationType,
} from '../../../database/models/Notifications.js';
import { isValidObjectId } from '../../../utilities/utilitis.js';

export const acceptRejectOrder = catchAsync(async (req, res) => {
    const { orderId, status, rejectReason } = acceptRejectOrderSchema.parse(
        req.body,
    );

    const order = await Order.findOne({ _id: orderId }).lean();
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
        case ORDER_FORM_STATUS.ACCEPTED:
            message = `Your order for ${order.orderIdOfPlatForm} is accepted`;
            break;
        case ORDER_FORM_STATUS.REJECTED:
            message = `Your order for ${order.orderIdOfPlatForm} is rejected`;
            break;
        case ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED:
            message = `Your Review form for ${order.orderIdOfPlatForm} is accepted`;
            break;
        case ORDER_FORM_STATUS.REVIEW_FORM_REJECTED:
            message = `Your Review form for ${order.orderIdOfPlatForm} is rejected`;
            break;
        default:
            message = 'your order is ' + status;
    }

    const body = 'Order status';
    const title = message;

    sendNotification({
        notification: {
            imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            body,
            title,
        },
        android: {
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
        },
        data: {
            orderId: order._id.toString(),
        },
        tokens: [user.fcmToken],
    });

    Notifications.create({
        type: notificationType.order,
        orderId: orderId,
        userCurrentAdminReference: order?.dealOwner,
        userId: order?.userId,
        body,
        title,
    }).then((res) => res.save());

    const orderStatusEnumForSuccessMessage = {
        rejected: 'Order Rejected',
        accepted: 'Order Accepted',
        reviewFormRejected: 'Review Rejected',
        reviewFormAccepted: 'Review Accepted',
    };

    return res.status(200).json(
        successResponse({
            message: `${orderStatusEnumForSuccessMessage[status] || ''} successfully`,
            data: updatedOrder,
        }),
    );
});

export const paymentStatusUpdate = catchAsync(async (req, res) => {
    const { orderId, status } = paymentStatusUpdateSchema.parse(req.body);

    const adminId = req?.user?._id;

    const isSuperAccessing = isSuperAdminAccessingApi(req);

    let order = await Order.aggregate([
        {
            $match: {
                _id: MongooseObjectId(orderId),
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
        ...(!isSuperAccessing
            ? [
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
                          from: 'deals',
                          localField: 'dealId.parentDealId',
                          foreignField: '_id',
                          as: 'dealId.parentDealId',
                      },
                  },
                  {
                      $unwind: {
                          path: '$dealId.parentDealId',
                          preserveNullAndEmptyArrays: true,
                      },
                  },
                  {
                      $match: {
                          $or: [
                              {
                                  'dealId.parentDealId.adminId':
                                      MongooseObjectId(adminId),
                              },
                              {
                                  'dealId.adminId': MongooseObjectId(adminId),
                              },
                          ],
                      },
                  },
              ]
            : []),
        {
            $project: {
                userId: { fcmToken: 1, _id: 1 },
                _id: 1,
                paymentStatus: 1,
                orderIdOfPlatForm: 1,
                dealOwner: 1,
                orderFormStatus: 1,
            },
        },
    ]);

    order = order && order[0];

    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: orderId,
            ...(status === 'paid' && {
                // if user want to change the status to paid
                // and make sure order review form is accepted
                orderFormStatus: ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED,
            }),
        },
        {
            paymentStatus: status,
            ...(status === 'paid' && {
                paymentDate: moment().utc().toDate(),
            }),
        },
        { new: true },
    );

    if (!updatedOrder) {
        return res.status(400).json(
            successResponse({
                message: `Order Review Form should be Accepted`,
                data: updatedOrder,
            }),
        );
    }

    const body = 'Order payment';
    const title =
        'Your payment for  order ' + order.orderIdOfPlatForm + ' is ' + status;

    sendNotification({
        notification: {
            imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            body,
            title,
        },
        android: {
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
        },
        data: {
            orderId: order?._id?.toString(),
        },
        tokens: [order?.userId?.fcmToken],
    });

    Notifications.create({
        type: notificationType.order,
        orderId: orderId,
        userCurrentAdminReference: order?.dealOwner,
        userId: order?.userId?._id,
        body,
        title,
    }).then((res) => res.save());

    return res.status(200).json(
        successResponse({
            message: `order payment status updated successfully`,
            data: updatedOrder,
        }),
    );
});

export const bulkPaymentStatusUpdate = catchAsync(async (req, res) => {
    const { orderIds, status } = bulkPaymentStatusUpdateSchema.parse(req.body);

    const adminId = req?.user?._id;

    console.log(orderIds, 'asdf');

    const isInvalidMongoDb = orderIds.some((item) => {
        return !isValidObjectId(item);
    });

    if (isInvalidMongoDb) {
        return res.status(400).json(
            errorResponse({
                message: 'In Valid Order ids',
            }),
        );
    }

    const isSuperAccessing = isSuperAdminAccessingApi(req);

    let order = await Order.aggregate([
        {
            $match: {
                _id: { $in: orderIds?.map((i) => MongooseObjectId(i)) },
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
        ...(!isSuperAccessing
            ? [
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
                          from: 'deals',
                          localField: 'dealId.parentDealId',
                          foreignField: '_id',
                          as: 'dealId.parentDealId',
                      },
                  },
                  {
                      $unwind: {
                          path: '$dealId.parentDealId',
                          preserveNullAndEmptyArrays: true,
                      },
                  },
                  {
                      $match: {
                          $or: [
                              {
                                  'dealId.parentDealId.adminId':
                                      MongooseObjectId(adminId),
                              },
                              {
                                  'dealId.adminId': MongooseObjectId(adminId),
                              },
                          ],
                      },
                  },
              ]
            : []),
        {
            $project: {
                userId: { fcmToken: 1, _id: 1 },
                _id: 1,
                paymentStatus: 1,
                orderIdOfPlatForm: 1,
                dealOwner: 1,
                orderFormStatus: 1,
            },
        },
    ]);

    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This ids',
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

    if (
        order?.some(
            (i) => i.orderFormStatus !== ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED,
        )
    ) {
        return res.status(400).json(
            errorResponse({
                message: 'some of your orders review Form is not accepted yet!',
            }),
        );
    }

    await Order.updateMany(
        {
            _id: { $in: orderIds },
            ...(status === 'paid' && {
                // if user want to change the status to paid
                // and make sure order review form is accepted
                orderFormStatus: ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED,
            }),
        },
        {
            paymentStatus: status,
            ...(status === 'paid' && {
                paymentDate: moment().utc().toDate(),
            }),
        },
        { new: true },
    );

    const body = 'Order payment';

    order.forEach((order) => {
        const title =
            'Your payment for  order ' +
            order.orderIdOfPlatForm +
            ' is ' +
            status;

        sendNotification({
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
                body,
                title,
            },
            android: {
                notification: {
                    imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
                },
            },
            data: {
                orderId: order?._id?.toString(),
            },
            tokens: [order?.userId?.fcmToken],
        });

        Notifications.create({
            type: notificationType.order,
            orderId: order?._id,
            userCurrentAdminReference: order?.dealOwner,
            userId: order?.userId?._id,
            body,
            title,
        }).then((res) => res.save());
    });

    return res.status(200).json(
        successResponse({
            message: `orders payment status updated successfully`,
        }),
    );
});

// for the super admin and admin only
export const getAllOrders = catchAsync(async (req, res) => {
    const {
        offset,
        limit,
        dealId,
        brandId,
        orderFormStatus,
        selectedPlatformFilter,
        startDate,
        endDate,
    } = allOrdersListSchema.parse(req.body);

    const adminId = isAdminAccessingApi(req);

    const aggregateArr = [
        {
            $match: {
                ...(adminId && {
                    dealOwner: new mongoose.Types.ObjectId(adminId),
                }),
                // ...(startDate && {
                //     orderDate: {
                //         $gte: new Date(
                //             new Date(startDate).setHours(0, 0, 0, 0),
                //         ),
                //         $lte: new Date(
                //             new Date(endDate).setHours(23, 59, 59, 999),
                //         ),
                //     },
                // }),
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
            $match: {
                'dealId.parentDealId': { $exists: false },
            },
        },

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
                ...(selectedPlatformFilter?.length && {
                    'dealId.platForm._id': {
                        $in:
                            selectedPlatformFilter?.map(
                                (i) => new mongoose.Types.ObjectId(i),
                            ) || [],
                    },
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
// for the Agency to see his med orders
export const getAllOrdersOfMedAsAgency = catchAsync(async (req, res) => {
    const {
        offset,
        limit,
        dealId,
        brandId,
        orderFormStatus,
        selectedPlatformFilter,
        mediatorId,
    } = allOrdersListSchema.parse(req.body);

    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);

    let allMed;

    if (!isSuperAdminAccessing) {
        allMed = await AdminSubAdminLinker.find({
            adminId: req?.user?._id,
        }).select('subAdminId');
    }

    const aggregateArr = [
        {
            $match: {
                ...(!isSuperAdminAccessing &&
                    !mediatorId && {
                        dealOwner: {
                            $in: allMed?.map((item) => item.subAdminId) || [],
                        },
                    }),
                ...(mediatorId && {
                    dealOwner: MongooseObjectId(mediatorId),
                }),
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
            $match: {
                'dealId.parentDealId': { $exists: true },
            },
        },

        {
            $lookup: {
                from: 'deals',
                localField: 'dealId.parentDealId',
                foreignField: '_id',
                as: 'dealId.parentDealId',
            },
        },
        { $unwind: '$dealId.parentDealId' },
        {
            $lookup: {
                from: 'admins',
                localField: 'dealId.adminId',
                foreignField: '_id',
                as: 'dealId.adminId',
            },
        },
        { $unwind: '$dealId.adminId' },
        {
            $lookup: {
                from: 'brands',
                localField: 'dealId.parentDealId.brand',
                foreignField: '_id',
                as: 'dealId.parentDealId.brand',
            },
        },
        { $unwind: '$dealId.parentDealId.brand' },
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.parentDealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.parentDealId.dealCategory',
            },
        },
        { $unwind: '$dealId.parentDealId.dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.parentDealId.platForm',
                foreignField: '_id',
                as: 'dealId.parentDealId.platForm',
            },
        },
        { $unwind: '$dealId.parentDealId.platForm' },
        {
            $match: {
                ...(brandId && {
                    'dealId.parentDealId.brand._id':
                        new mongoose.Types.ObjectId(brandId),
                }),
                ...(selectedPlatformFilter?.length && {
                    'dealId.parentDealId.platForm._id': {
                        $in:
                            selectedPlatformFilter?.map(
                                (i) => new mongoose.Types.ObjectId(i),
                            ) || [],
                    },
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
// for the  med to see his  orders as Orders
export const getAllOrdersOfMedAsMed = catchAsync(async (req, res) => {
    const {
        offset,
        limit,
        dealId,
        brandId,
        orderFormStatus,
        selectedPlatformFilter,
    } = allOrdersListSchema.parse(req.body);

    const aggregateArr = [
        {
            $match: {
                dealOwner: new mongoose.Types.ObjectId(req?.user?._id),
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
            $match: {
                'dealId.parentDealId': { $exists: true },
            },
        },

        {
            $lookup: {
                from: 'deals',
                localField: 'dealId.parentDealId',
                foreignField: '_id',
                as: 'dealId.parentDealId',
            },
        },
        { $unwind: '$dealId.parentDealId' },

        {
            $lookup: {
                from: 'brands',
                localField: 'dealId.parentDealId.brand',
                foreignField: '_id',
                as: 'dealId.parentDealId.brand',
            },
        },
        { $unwind: '$dealId.parentDealId.brand' },
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.parentDealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.parentDealId.dealCategory',
            },
        },
        { $unwind: '$dealId.parentDealId.dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.parentDealId.platForm',
                foreignField: '_id',
                as: 'dealId.parentDealId.platForm',
            },
        },
        { $unwind: '$dealId.parentDealId.platForm' },
        {
            $match: {
                ...(brandId && {
                    'dealId.parentDealId.brand._id':
                        new mongoose.Types.ObjectId(brandId),
                }),
                ...(selectedPlatformFilter?.length && {
                    'dealId.parentDealId.platForm._id': {
                        $in:
                            selectedPlatformFilter?.map(
                                (i) => new mongoose.Types.ObjectId(i),
                            ) || [],
                    },
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
