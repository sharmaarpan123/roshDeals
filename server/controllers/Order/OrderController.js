import mongoose from 'mongoose';
import Deal from '../../database/models/Deal.js';
import Order from '../../database/models/Order.js';
import catchAsync from '../../utilities/catchAsync.js';
import { ORDER_FORM_STATUS } from '../../utilities/commonTypes.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import { filterSchema } from '../../utilities/ValidationSchema.js';
import {
    acceptRejectOrderSchema,
    allOrdersListSchema,
    bulkPaymentStatusUpdateSchema,
    createOrderSchema,
    OrderFromUpdateSchema,
    paymentStatusUpdateSchema,
    reviewFormSubmitSchema,
} from './Schema.js';
const checkSlotCompletedDeals = async (dealIds) =>
    Deal.find({
        _id: { $in: dealIds },
        $expr: { $gte: ['$slotCompletedCount', '$slotAlloted'] },
    });

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
        { paymentStatus: status },
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
    console.log(order, 'order');

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
export const OrderCreateController = catchAsync(async (req, res) => {
    const { dealIds, orderIdOfPlatForm, orderScreenShot, reviewerName } =
        createOrderSchema.parse(req.body);
    const { _id } = req.user;
    // validating the deals Id // start
    const validDealsIds = await Deal.find({
        _id: { $in: dealIds },
    });
    if (dealIds.length !== validDealsIds.length) {
        return res.status(400).json(
            errorResponse({
                message: 'Deals are not Valid',
            }),
        );
    }
    // validating the deals Id// end
    // check to sure deals slot not completed // start
    const slotCompletedDeals = await checkSlotCompletedDeals(dealIds);
    if (slotCompletedDeals.length) {
        return res.status(400).json(
            errorResponse({
                message:
                    'These Deals Slot are completed , please cancel these orders',
                others: { deals: slotCompletedDeals },
            }),
        );
    }
    // check to sure deals slot not completed// end
    await Deal.updateMany(
        {
            _id: { $in: dealIds },
            $expr: { $lt: ['$slotCompletedCount', '$slotAlloted'] },
        },
        { $inc: { slotCompletedCount: 1 } },
    );
    const newCreatedOrders = await Order.insertMany(
        dealIds.map((deal) => ({
            dealId: deal,
            orderIdOfPlatForm,
            orderScreenShot,
            reviewerName,
            userId: _id,
        })),
    );
    return res.status(200).json(
        successResponse({
            message: 'orders created successfully!',
            data: newCreatedOrders,
        }),
    );
});
//
export const OrderFromUpdate = catchAsync(async (req, res) => {
    const { orderIdOfPlatForm, reviewerName, orderScreenShot, orderId } =
        OrderFromUpdateSchema.parse(req.body);
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }
    if (order.orderFormStatus === ORDER_FORM_STATUS.ACCEPTED) {
        return res.status(200).json(
            successResponse({
                message:
                    "You Can't update this order now , This order is accepted",
            }),
        );
    }
    const updatedOrderForm = await Order.findOneAndUpdate(
        { _id: orderId },
        {
            orderIdOfPlatForm,
            reviewerName,
            orderScreenShot,
            orderFormStatus: ORDER_FORM_STATUS.PENDING,
        },
        { new: true },
    );
    return res.status(200).json(
        successResponse({
            message: 'order Form Updated',
            data: updatedOrderForm,
        }),
    );
});
export const reviewFromSubmitController = catchAsync(async (req, res) => {
    const {
        orderId,
        reviewLink,
        deliveredScreenShot,
        reviewScreenShot,
        sellerFeedback,
        paymentId,
    } = reviewFormSubmitSchema.parse(req.body);
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }

    if (order.orderFormStatus === ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED) {
        return res.status(400).json(
            errorResponse({
                message: 'Your Review form is accepted , no need to update  ',
            }),
        );
    }

    if (
        order.orderFormStatus === ORDER_FORM_STATUS.REJECTED ||
        order.orderFormStatus === ORDER_FORM_STATUS.PENDING
    ) {
        return res.status(400).json(
            errorResponse({
                message:
                    "your order form is not accepted yet so you can't fill the review form",
            }),
        );
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        {
            reviewLink,
            deliveredScreenShot,
            reviewScreenShot,
            sellerFeedback,
            paymentId,
            orderFormStatus: ORDER_FORM_STATUS.REVIEW_FORM_SUBMITTED,
        },
        {
            new: true,
        },
    );
    return res.status(200).json(
        successResponse({
            message: 'Your review Form is submitted!',
            data: updatedOrder,
        }),
    );
});
export const OrderList = catchAsync(async (req, res) => {
    console.log(req.query, 'query');
    const { limit, offset } = filterSchema.parse(req.query);
    const orders = await Order.find({ userId: req.user._id })
        .populate({
            path: 'dealId',
            select: 'brand dealCategory platForm productName productCategories actualPrice cashBack termsAndCondition postUrl paymentStatus',
            populate: [
                { path: 'brand', select: 'name image' },
                { path: 'dealCategory', select: 'name' },
                { path: 'platForm', select: 'name' },
            ],
        })
        .sort({ createdAt: -1 })
        .skip(offset || 0)
        .limit(limit || 10);

    return res.status(200).json(
        successResponse({
            message: 'Orders List.',
            others: { orders },
        }),
    );
});
export const UserEarning = catchAsync(async (req, res) => {
    const earnings = await Order.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(req.user._id),
                paymentStatus: 'paid',
            },
        },
        {
            $lookup: {
                from: 'deals',
                localField: 'dealId',
                foreignField: '_id',
                as: 'deal',
            },
        },
        {
            $unwind: '$deal',
        },
        {
            $group: {
                _id: '$userId',
                totalCashback: {
                    $sum: {
                        $toDouble: '$deal.cashBack',
                    },
                },
            },
        },
    ]);

    return res.status(200).json(
        successResponse({
            message: 'Total Cashback Earned.',
            others: {
                totalCashback:
                    earnings.length > 0 ? earnings[0].totalCashback : 0,
            },
        }),
    );
});
