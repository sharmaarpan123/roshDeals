"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderList = exports.reviewFromSubmitController = exports.OrderFromUpdate = exports.OrderCreateController = exports.acceptRejectOrder = void 0;
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const Schema_1 = require("./Schema");
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const Responses_1 = require("@/utilities/Responses");
const Order_1 = __importDefault(require("@/database/models/Order"));
const commonTypes_1 = require("@/utilities/commonTypes");
const checkSlotCompletedDeals = async (dealIds) => Deal_1.default.find({
    _id: { $in: dealIds },
    $expr: { $gte: ['$slotCompletedCount', '$slotAlloted'] },
});
exports.acceptRejectOrder = (0, catchAsync_1.default)(async (req, res) => {
    const { orderId } = Schema_1.orderIdSchema.parse(req.body);
    const order = await Order_1.default.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'Not found any Order with This id',
        }));
    }
    // if (order.orderFormStatus)
});
exports.OrderCreateController = (0, catchAsync_1.default)(async (req, res) => {
    const { dealIds, orderIdOfPlatForm, orderScreenShot, reviewerName } = Schema_1.createOrderSchema.parse(req.body);
    const { _id } = req.user;
    // validating the deals Id // start
    const validDealsIds = await Deal_1.default.find({
        _id: { $in: dealIds },
    });
    if (dealIds.length !== validDealsIds.length) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'Deals are not Valid',
        }));
    }
    // validating the deals Id// end
    // check to sure deals slot not completed // start
    const slotCompletedDeals = await checkSlotCompletedDeals(dealIds);
    if (slotCompletedDeals.length) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'These Deals Slot are completed , please cancel these orders',
            others: { deals: slotCompletedDeals },
        }));
    }
    // check to sure deals slot not completed// end
    await Deal_1.default.updateMany({
        _id: { $in: dealIds },
        $expr: { $lt: ['$slotCompletedCount', '$slotAlloted'] },
    }, { $inc: { slotCompletedCount: 1 } });
    const newCreatedOrders = await Order_1.default.insertMany(dealIds.map((deal) => ({
        dealId: deal,
        orderIdOfPlatForm,
        orderScreenShot,
        reviewerName,
        userId: _id,
    })));
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'orders created successfully!',
        data: newCreatedOrders,
    }));
});
//
exports.OrderFromUpdate = (0, catchAsync_1.default)(async (req, res) => {
    const { orderIdOfPlatForm, reviewerName, orderScreenShot, orderId } = Schema_1.OrderFromUpdateSchema.parse(req.body);
    const order = await Order_1.default.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'Not found any Order with This id',
        }));
    }
    if (order.orderFormStatus === commonTypes_1.ORDER_FORM_STATUS.ACCEPTED) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: "You Can't update this order now , This order is accepted",
        }));
    }
    const updatedOrderForm = await Order_1.default.findOneAndUpdate({ _id: orderId }, { orderIdOfPlatForm, reviewerName, orderScreenShot }, { new: true });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'order Form Updated',
        data: updatedOrderForm,
    }));
});
exports.reviewFromSubmitController = (0, catchAsync_1.default)(async (req, res) => {
    const { orderId, reviewLink, deliveredScreenShot, reviewScreenShot, sellerFeedback, } = Schema_1.reviewFormSubmitSchema.parse(req.body);
    const order = await Order_1.default.findOne({ _id: orderId });
    if (!order) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'Not found any Order with This id',
        }));
    }
    if (order.orderFormStatus !== commonTypes_1.ORDER_FORM_STATUS.ACCEPTED) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'Your order is not accepted yet!',
        }));
    }
    const updatedOrder = await Order_1.default.findOneAndUpdate({ _id: orderId }, {
        reviewLink,
        deliveredScreenShot,
        reviewScreenShot,
        sellerFeedback,
        isReviewFormSubmitted: true,
    });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Your review Form is submitted!',
        data: updatedOrder,
    }));
});
exports.OrderList = (0, catchAsync_1.default)(async (req, res) => {
    const orders = await Order_1.default.find({ userId: req.user._id }).populate({
        path: 'dealId',
        select: 'brand dealCategory platForm productName productCategories actualPrice cashBack termsAndCondition postUrl payMentGiven',
        populate: [
            { path: 'brand', select: 'name image' },
            { path: 'dealCategory', select: 'name' },
            { path: 'platForm', select: 'name' },
        ],
    });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Orders List.',
        others: { orders },
    }));
});
//# sourceMappingURL=OrderController.js.map