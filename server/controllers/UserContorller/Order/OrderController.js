import mongoose from 'mongoose';
import Brand from '../../../database/models/Brand.js';
import Deal from '../../../database/models/Deal.js';
import DealCategory from '../../../database/models/DealCategory.js';
import Notifications, {
    notificationType,
} from '../../../database/models/Notifications.js';
import Order from '../../../database/models/Order.js';
import PlatForm from '../../../database/models/PlatForm.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ORDER_FORM_STATUS } from '../../../utilities/commonTypes.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import {
    getCurrentAdminReferencesId,
    MongooseObjectId,
    toUTC,
} from '../../../utilities/utilitis.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    createOrderSchema,
    OrderFromUpdateSchema,
    reviewFormSubmitSchema,
} from './Schema.js';

export const OrderCreateController = catchAsync(async (req, res) => {
    const {
        deals,
        // dealIds,
        orderIdOfPlatForm,
        orderScreenShot,
        reviewerName,
        exchangeDealProducts,
        orderDate,
        deliveryFee,
    } = createOrderSchema.parse(req.body);
    const { _id, name } = req.user;

    const currentAdminReference = getCurrentAdminReferencesId(req);

    // Validate the deals
    const validDeals = await Deal.find({
        _id: { $in: deals?.map((item) => item?.dealId) },
        adminId: currentAdminReference,
    })
        .populate('adminId')
        .populate('parentDealId')
        .select(
            'adminId parentDealId slotCompletedCount slotAlloted lessAmount commissionValue isCommissionDeal adminCommission',
        );

    if (deals?.length !== validDeals?.length) {
        return res.status(400).json(
            errorResponse({
                message:
                    'Some deals are not valid or do not belong to your agency or mediator account.',
            }),
        );
    }

    // Map parent or child deals
    const parentOrChildDeals = validDeals.map((deal) => {
        if (deal.parentDealId) {
            return {
                dealId: deal.parentDealId._id,
                isParent: true,
            };
        } else {
            return {
                dealId: deal._id,
                isParent: false,
            };
        }
    });

    // Check if any slots are completed (for parents or children)
    const parentOrChildDealIds = parentOrChildDeals.map((d) => d.dealId);
    const slotCompletedDeals = await Deal.find({
        _id: { $in: parentOrChildDealIds },
        $expr: { $gte: ['$slotCompletedCount', '$slotAlloted'] },
    }).select('productName');

    if (slotCompletedDeals?.length) {
        return res.status(400).json(
            errorResponse({
                message:
                    (slotCompletedDeals &&
                        slotCompletedDeals[0]?.productName) ||
                    '' +
                        ' This deal have completed their slots. Please cancel these orders.',
                others: { deals: slotCompletedDeals },
            }),
        );
    }

    // Update slot counts
    await Deal.updateMany(
        {
            _id: { $in: parentOrChildDealIds },
            $expr: { $lt: ['$slotCompletedCount', '$slotAlloted'] },
        },
        { $inc: { slotCompletedCount: 1 } },
    );

    const newOrders = validDeals.map((deal, index) => {
        const orderedDealsData = deals?.find(
            (item) => item?.dealId === deal?._id?.toString(),
        );

        const obj = {
            dealId: deal?._id,
            dealOwner: deal?.adminId?._id,
            orderIdOfPlatForm,
            orderScreenShot,
            reviewerName,
            userId: _id,
            orderDate: toUTC(new Date(orderDate)),
            exchangeDealProducts,
            ...(index === 0 && { deliveryFee }), // only add the delivery fee to one order
            orderPrice: orderedDealsData?.amount,
            ...(deal.lessAmount && {
                lessAmount: deal.lessAmount,
            }),
            ...(deal.commissionValue && {
                commissionValue: deal.commissionValue,
            }),
            ...(deal.isCommissionDeal && {
                isCommissionDeal: true,
            }),
            ...(deal.adminCommission && {
                adminCommission: deal.adminCommission,
            }),
        };

        return obj;
    });

    const insertedOrders = await Order.insertMany(newOrders);

    const adminsFireBaseTokens = validDeals
        .map((i) => i.adminId?.fcmTokens)
        ?.flat();

    const body = 'New Order';
    const title = name + ' has Created a New order';

    insertedOrders?.forEach((item) => {
        sendNotification({
            notification: {
                body,
                title,
            },
            tokens: adminsFireBaseTokens,
        });

        Notifications.create({
            type: notificationType.order,
            orderId: item._id,
            adminId: currentAdminReference,
            body,
            title,
        }).then((res) => {
            res.save().then((res) => {});
        });
    });

    return res.status(200).json(
        successResponse({
            message: 'Orders created successfully!',
            data: insertedOrders,
        }),
    );
});
//
export const OrderFromUpdate = catchAsync(async (req, res) => {
    const {
        orderIdOfPlatForm,
        reviewerName,
        orderScreenShot,
        orderId,
        orderDate,
        deliveryFee,
    } = OrderFromUpdateSchema.parse(req.body);

    const { name } = req.user;
    const order = await Order.findOne({ _id: orderId }).populate('dealOwner');
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
            ...(orderDate && { orderDate: toUTC(new Date(orderDate)) }),
            deliveryFee,
            orderFormStatus: ORDER_FORM_STATUS.PENDING,
        },
        { new: true },
    );

    const body = 'Order Form Updated';
    const title = name + ' buyer has updated  refund form';

    sendNotification({
        notification: {
            body,
            title,
        },
        tokens: order?.dealOwner?.fcmTokens,
    });

    Notifications.create({
        type: notificationType.order,
        orderId: order._id,
        adminId: order?.dealOwner?._id,
        body,
        title,
    }).then((res) => res.save());

    return res.status(200).json(
        successResponse({
            message: 'order Form Updated',
            data: updatedOrderForm,
        }),
    );
}); //
export const reviewFromSubmitController = catchAsync(async (req, res) => {
    const {
        orderId,
        reviewLink,
        deliveredScreenShot,
        reviewScreenShot,
        sellerFeedback,
        paymentId,
    } = reviewFormSubmitSchema.parse(req.body);
    const { name } = req.user;

    const order = await Order.findOne({ _id: orderId }).populate('dealOwner');
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

    const body = 'Review Form Updated';
    const title = name + ' buyer has updated Order from';

    sendNotification({
        notification: {
            body,
            title,
        },
        tokens: order?.dealOwner?.fcmTokens,
    });

    Notifications.create({
        type: notificationType.order,
        orderId: order._id,
        adminId: order?.dealOwner?._id,
        body,
        title,
    }).then((res) => res.save());

    return res.status(200).json(
        successResponse({
            message: 'Your review Form is submitted!',
            data: updatedOrder,
        }),
    );
}); //
export const OrderList = catchAsync(async (req, res) => {
    const {
        limit,
        offset,
        selectedDate,
        selectedBrandFilter,
        selectedCategoryFilter,
        selectedPlatformFilter,
    } = filterSchema.parse(req.body);
    const dateFilter = selectedDate
        ? {
              orderDate: {
                  $gte: toUTC(new Date(selectedDate)), // Start of the day in UTC
                  $lt: toUTC(
                      new Date(
                          new Date(selectedDate).setDate(
                              new Date(selectedDate).getDate() + 1,
                          ),
                      ),
                  ), // End of the day in UTC
              },
          }
        : {};

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    const orders = await Order.aggregate([
        {
            $match: {
                userId: MongooseObjectId(req.user._id),
                ...dateFilter,
                dealOwner: new mongoose.Types.ObjectId(adminCurrentRecreance),
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
                ...(selectedBrandFilter?.length > 0 && {
                    $or: [
                        {
                            'dealId.parentDealId.brand': {
                                $in: selectedBrandFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                        {
                            'dealId.brand': {
                                $in: selectedBrandFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                    ],
                }),
                ...(selectedPlatformFilter?.length > 0 && {
                    $or: [
                        {
                            'dealId.parentDealId.platForm': {
                                $in: selectedPlatformFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                        {
                            'dealId.platForm': {
                                $in: selectedPlatformFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                    ],
                }),
                ...(selectedCategoryFilter?.length > 0 && {
                    $or: [
                        {
                            'dealId.parentDealId.dealCategory': {
                                $in: selectedCategoryFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                        {
                            'dealId.dealCategory': {
                                $in: selectedCategoryFilter?.map((item) =>
                                    MongooseObjectId(item),
                                ),
                            },
                        },
                    ],
                }),
            },
        },

        // root level  deal populate
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.dealCategory',
            },
        },
        {
            $unwind: {
                path: '$dealId.dealCategory',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.platForm',
                foreignField: '_id',
                as: 'dealId.platForm',
            },
        },
        {
            $unwind: {
                path: '$dealId.platForm',
                preserveNullAndEmptyArrays: true,
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
        {
            $unwind: {
                path: '$dealId.brand',
                preserveNullAndEmptyArrays: true,
            },
        },

        // parent deal populate
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealId.parentDealId.dealCategory',
                foreignField: '_id',
                as: 'dealId.parentDealId.dealCategory',
            },
        },
        {
            $unwind: {
                path: '$dealId.parentDealId.dealCategory',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'platforms',
                localField: 'dealId.parentDealId.platForm',
                foreignField: '_id',
                as: 'dealId.parentDealId.platForm',
            },
        },
        {
            $unwind: {
                path: '$dealId.parentDealId.platForm',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'dealId.parentDealId.brand',
                foreignField: '_id',
                as: 'dealId.parentDealId.brand',
            },
        },
        {
            $unwind: {
                path: '$dealId.parentDealId.brand',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ]);

    //  then the extra keys if offset is zero
    if (offset === 0) {
        // Fetch related brands, categories, and platforms with populate
        const relatedFilter = {
            isActive: true,
            isSlotCompleted: false,
            adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
        };

        // Fetch distinct IDs and populate their details
        const [relatedBrands, relatedCategories, relatedPlatforms] =
            await Promise.all([
                Deal.find(relatedFilter)
                    .distinct('brand')
                    .then((ids) => Brand.find({ _id: { $in: ids } })),
                Deal.find(relatedFilter)
                    .distinct('dealCategory')
                    .then((ids) => DealCategory.find({ _id: { $in: ids } })),
                Deal.find(relatedFilter)
                    .distinct('platForm')
                    .then((ids) => PlatForm.find({ _id: { $in: ids } })),
            ]);
        // Respond with successResponse
        return res.status(200).json(
            successResponse({
                message: 'Order List with related data',

                others: {
                    orders,
                    relatedData: {
                        brands: relatedBrands,
                        categories: relatedCategories,
                        platforms: relatedPlatforms,
                    },
                },
            }),
        );
    }

    return res.status(200).json(
        successResponse({
            message: 'Orders List.',
            others: { orders },
        }),
    );
}); //
export const UserEarning = catchAsync(async (req, res) => {
    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    const earnings = await Order.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(req.user._id),
                paymentStatus: 'paid',
                dealOwner: MongooseObjectId(adminCurrentRecreance),
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
                        $toDouble: '$deal.finalCashBackForUser',
                    },
                },
                totalAmount: {
                    $sum: {
                        $cond: {
                            if: '$deal.isCommissionDeal',
                            then: {
                                $subtract: [
                                    {
                                        $add: [
                                            { $toDouble: '$orderPrice' },
                                            { $toDouble: '$commissionValue' },
                                            { $ifNull: [{ $toDouble: '$deliveryFee' }, 0] }
                                        ]
                                    },
                                    { $ifNull: [{ $toDouble: '$adminCommission' }, 0] }
                                ]
                            },
                            else: {
                                $subtract: [
                                    {
                                        $add: [
                                            {
                                                $subtract: [
                                                    { $toDouble: '$orderPrice' },
                                                    { $toDouble: '$lessAmount' }
                                                ]
                                            },
                                            { $ifNull: [{ $toDouble: '$deliveryFee' }, 0] }
                                        ]
                                    },
                                    { $ifNull: [{ $toDouble: '$adminCommission' }, 0] }
                                ]
                            }
                        }
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
                totalAmount:
                    earnings.length > 0 ? earnings[0].totalAmount : 0,
            },
        }),
    );
}); //

export const getOrderById = catchAsync(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json(
            errorResponse({
                message: 'Order ID is required',
            }),
        );
    }

    const order = await Order.findOne({
        _id: orderId,
        userId: req.user._id, // Ensure user can only access their own orders
    }).populate({
        path: 'dealId',
        populate: [
            { path: 'brand' },
            { path: 'dealCategory' },
            { path: 'platForm' },
            {
                path: 'parentDealId',
                populate: [
                    { path: 'dealCategory' },
                    { path: 'platForm' },
                    { path: 'brand' },
                ],
            },
        ],
    });

    if (!order) {
        return res.status(404).json(
            errorResponse({
                message: 'Order not found',
            }),
        );
    }

    return res.status(200).json(
        successResponse({
            message: 'Order retrieved successfully',
            data: order,
        }),
    );
});
