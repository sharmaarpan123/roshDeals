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
            validate: {
                validator: async function (brandId: mongoose.Types.ObjectId) {
                    const brand = await mongoose.models.Brand.findById(brandId);
                    return !!brand; // Return true if the brand exists
                },
                message: (props) => `${props.value} is not a valid Brand ID!`,
            },
        },
        platForm: {
            type: mongoose.Schema.Types.ObjectId,
            require: String,
            ref: 'PlatForm',
            validate: {
                validator: async function (
                    platFormId: mongoose.Types.ObjectId,
                ) {
                    const platForm =
                        await mongoose.models.PlatForm.findById(
                            platFormId,
                        ).lean();
                    return !!platForm;
                },
                message: (props) =>
                    `${props.value} is not a valid PlatForm ID!`,
            },
        },
        dealCategory: {
            type: mongoose.Schema.Types.ObjectId,
            require: String,
            ref: 'DealCategory',
            validate: {
                validator: async function (
                    DealCategoryId: mongoose.Types.ObjectId,
                ) {
                    const DealCategory =
                        await mongoose.models.DealCategory.findById(
                            DealCategoryId,
                        ).lean();
                    return !!DealCategory;
                },
                message: (props) =>
                    `${props.value} is not a valid DealCategory ID!`,
            },
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
            default: 0,
        },
        isSlotCompleted: {
            type: Boolean,
            default: false,
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
            default: true,
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
