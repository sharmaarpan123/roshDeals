import { ORDER_FORM_STATUS } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        dealId: { type: mongoose.Types.ObjectId, required: true, ref: 'Deal' },
        dealOwner: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Admin',
        },
        reviewerName: { type: String, required: true },
        orderIdOfPlatForm: { type: String, required: true }, // order id from the platforms
        orderScreenShot: { type: String, required: true },
        deliveredScreenShot: { type: String },
        reviewScreenShot: { type: String },
        reviewLink: { type: String },
        sellerFeedback: { type: String },
        rejectReason: { type: String },
        paymentId: { type: String },
        exchangeDealProducts: { type: [String] },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            required: true,
            default: 'pending',
        },
        orderFormStatus: {
            type: String,
            enum: ORDER_FORM_STATUS,
            default: ORDER_FORM_STATUS.PENDING,
        },
        paymentDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map
