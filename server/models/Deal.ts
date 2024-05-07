import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            require: String,
            ref: 'Brand',
        },
        platForm: {
            type: mongoose.Schema.Types.ObjectId,
            require: String,
            ref: 'PlatForm',
        },
        dealCategory: {
            type: mongoose.Schema.Types.ObjectId,
            require: String,
            ref: 'DealCategory',
        },
        productCategories: {
            type: [String],
        },
        postUrl: {
            type: String,
            required: true,
        },
        actualPrice: {
            type: String,
            required: true,
        },
        cashBack: {
            type: String,
            required: true,
        },
        slotAlloted: {
            type: Number,
            required: true,
        },
        slotCompletedCount: {
            type: Number,
            required: true,
        },
        payMentReceived: {
            // when received from the brand
            type: Boolean,
            default: false,
        },
        payMentGiven: {
            // when given to the the buyers
            type: Boolean,
            default: false,
        },
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

export default mongoose.model('Deal', dealSchema);
