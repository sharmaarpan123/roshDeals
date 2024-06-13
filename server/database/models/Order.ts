import { ORDER_FORM_STATUS } from '@/utilities/commonTypes';
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        dealId: { type: mongoose.Types.ObjectId, required: true, ref: 'Deal' },
        reviewerName: { type: String, required: true },
        orderId: { type: String, required: true },
        orderScreenShot: { type: String, required: true },
        deliveredScreenShot: { type: String },
        reviewScreenShot: { type: String },
        reviewLink: { type: String },
        sellerFeedback: { type: String },
        orderFormStatus: {
            type: String,
            enum: ORDER_FORM_STATUS,
            default: ORDER_FORM_STATUS.PENDING,
        },
        isReviewFormSubmitted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Order', orderSchema);
