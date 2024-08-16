import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import { addBankDetailsSchema, editBankDetailsSchema, getDetails, } from './schema.js';
import PaymentDetails from '../../database/models/PaymentDetails.js';
export const addPaymentDetails = catchAsync(async (req, res) => {
    const body = addBankDetailsSchema.parse(req.body);
    const { IFSC, accountHolderName, accountNumber, bankName, upiId, userId, } = body;
    const isAlreadyAdded = await PaymentDetails.findOne({
        userId,
    });
    if (isAlreadyAdded) {
        return res.status(400).json(errorResponse({
            message: 'your payments are already added ,  you can edit them',
        }));
    }
    const newPaymentDetail = await PaymentDetails.create({
        IFSC,
        accountHolderName,
        accountNumber,
        bankName,
        upiId,
        userId,
    });
    const data = await newPaymentDetail.save();
    return res.status(200).json(successResponse({
        message: 'payment details added',
        data,
    }));
});
export const editPaymentDetails = catchAsync(async (req, res) => {
    const body = editBankDetailsSchema.parse(req.body);
    const { IFSC, accountHolderName, accountNumber, bankName, upiId, userId, } = body;
    const newPaymentDetail = await PaymentDetails.findOneAndUpdate({ userId }, { IFSC, accountHolderName, accountNumber, bankName, upiId, userId }, { new: true });
    return res.status(200).json(successResponse({
        message: 'payment details added',
        data: newPaymentDetail,
    }));
});
export const getPaymentDetails = catchAsync(async (req, res) => {
    const { userId } = getDetails.parse(req.query);
    // Validate the userId
    const paymentDetails = await PaymentDetails.findOne({ userId });
    if (!paymentDetails) {
        return res.status(404).json(errorResponse({
            message: 'Payment details not found',
        }));
    }
    return res.status(200).json(successResponse({
        message: 'Payment details retrieved successfully',
        data: paymentDetails,
    }));
});
//# sourceMappingURL=paymentDeails.js.map