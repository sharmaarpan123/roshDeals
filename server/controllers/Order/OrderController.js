import catchAsync from '../../utilities/catchAsync.js';
import {
    acceptRejectOrderSchema,
    allOrdersListSchema,
    createOrderSchema,
    OrderFromUpdateSchema,
    orderIdSchema,
    reviewFormSubmitSchema,
} from './Schema.js';
import Deal from '../../database/models/Deal.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import Order from '../../database/models/Order.js';
import { ORDER_FORM_STATUS } from '../../utilities/commonTypes.js';
import { populate } from 'dotenv';
const checkSlotCompletedDeals = async (dealIds) =>
    Deal.find({
        _id: { $in: dealIds },
        $expr: { $gte: ['$slotCompletedCount', '$slotAlloted'] },
    });
export const acceptRejectOrder = catchAsync(async (req, res) => {
    const { orderId, status } = acceptRejectOrderSchema.parse(req.body);

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
        { orderFormStatus: status },
        { new: true },
    );

    return res.status(200).json(
        successResponse({
            message: `order is ${status} successfully`,
            data: updatedOrder,
        }),
    );
});

export const getAllOrders = catchAsync(async (req, res) => {
    const { offset, limit, status, dealId } = allOrdersListSchema.parse(
        req.body,
    );

    const orders = Order.find({
        ...(status && { orderFormStatus: status }),
        ...(dealId && { dealId }),
    })
        .populate({
            path: 'dealId',
            select: 'brand dealCategory platForm productName productCategories actualPrice cashBack termsAndCondition postUrl paymentStatus',
            populate: [
                { path: 'brand', select: 'name image' },
                { path: 'dealCategory', select: 'name' },
                { path: 'platForm', select: 'name' },
            ],
        })
        .populate('userId')
        .skip(offset || 0)
        .limit(limit || 20);

    const totalCount = Order.find({
        ...(status && { orderFormStatus: status }),
        ...(dealId && { dealId }),
    }).countDocuments();

    const data = await Promise.all([orders, totalCount]);

    return res.status(200).json(
        successResponse({
            message: 'orders list!',
            data: data[0],
            total: data[1],
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
        { orderIdOfPlatForm, reviewerName, orderScreenShot },
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
    } = reviewFormSubmitSchema.parse(req.body);
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json(
            errorResponse({
                message: 'Not found any Order with This id',
            }),
        );
    }
    if (order.orderFormStatus !== ORDER_FORM_STATUS.ACCEPTED) {
        return res.status(400).json(
            errorResponse({
                message: 'Your order is not accepted yet!',
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
    const orders = await Order.find({ userId: req.user._id }).populate({
        path: 'dealId',
        select: 'brand dealCategory platForm productName productCategories actualPrice cashBack termsAndCondition postUrl paymentStatus',
        populate: [
            { path: 'brand', select: 'name image' },
            { path: 'dealCategory', select: 'name' },
            { path: 'platForm', select: 'name' },
        ],
    });
    return res.status(200).json(
        successResponse({
            message: 'Orders List.',
            others: { orders },
        }),
    );
});
//# sourceMappingURL=OrderController.js.map
