import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        brandName: {
            type: String,
            require: String,
        },
        platForm: {
            type: String,
            required: true,
        },
        slotAlloted: {
            type: Number,
            required: true,
        },
        slotCompleted: {
            type: Number,
            required: true,
        },
        payMentReceived: {
            type: Boolean,
            default: false,
        },
        // isPaymentSu
        isActive: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Product', productSchema);
