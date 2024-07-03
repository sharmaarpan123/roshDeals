"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentDetails = exports.editPaymentDetails = exports.addPaymentDetails = void 0;
const Responses_1 = require("@/utilities/Responses");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const schema_1 = require("./schema");
const PaymentDetails_1 = __importDefault(require("@/database/models/PaymentDetails"));
exports.addPaymentDetails = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addBankDetailsSchema.parse(req.body);
    const { IFSC, accountHolderName, accountNumber, bankName, upiId, userId, } = body;
    const isAlreadyAdded = await PaymentDetails_1.default.findOne({
        userId,
    });
    if (isAlreadyAdded) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'your payments are already added ,  you can edit them',
        }));
    }
    const newPaymentDetail = await PaymentDetails_1.default.create({
        IFSC,
        accountHolderName,
        accountNumber,
        bankName,
        upiId,
        userId,
    });
    const data = await newPaymentDetail.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'payment details added',
        data,
    }));
});
exports.editPaymentDetails = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editBankDetailsSchema.parse(req.body);
    const { IFSC, accountHolderName, accountNumber, bankName, upiId, userId, } = body;
    const newPaymentDetail = await PaymentDetails_1.default.findOneAndUpdate({ userId }, { IFSC, accountHolderName, accountNumber, bankName, upiId, userId }, { new: true });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'payment details added',
        data: newPaymentDetail,
    }));
});
exports.getPaymentDetails = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = schema_1.getDetails.parse(req.query);
    // Validate the userId
    const paymentDetails = await PaymentDetails_1.default.findOne({ userId });
    if (!paymentDetails) {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Payment details not found',
        }));
    }
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Payment details retrieved successfully',
        data: paymentDetails,
    }));
});
//# sourceMappingURL=paymentDeails.js.map