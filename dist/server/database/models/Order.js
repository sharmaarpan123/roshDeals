"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonTypes_1 = require("@/utilities/commonTypes");
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: 'User' },
    dealId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: 'Deal' },
    reviewerName: { type: String, required: true },
    orderIdOfPlatForm: { type: String, required: true }, // order id from the platforms
    orderScreenShot: { type: String, required: true },
    deliveredScreenShot: { type: String },
    reviewScreenShot: { type: String },
    reviewLink: { type: String },
    sellerFeedback: { screenShot: String, link: String },
    orderFormStatus: {
        type: String,
        enum: commonTypes_1.ORDER_FORM_STATUS,
        default: commonTypes_1.ORDER_FORM_STATUS.PENDING,
    },
    isReviewFormSubmitted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map