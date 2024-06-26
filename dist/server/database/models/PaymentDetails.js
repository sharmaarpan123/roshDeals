"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentDetail = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function (userId) {
                const platForm = await mongoose_1.default.models.User.findById(userId).lean();
                return !!platForm;
            },
            message: (props) => `${props.value} is not a valid User ID!`,
        },
    },
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    IFSC: { type: String },
    upiId: { type: String, required: true },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('PaymentDetail', PaymentDetail);
//# sourceMappingURL=PaymentDetails.js.map