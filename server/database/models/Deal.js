import mongoose from 'mongoose';
const dealSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        uniqueIdentifier: {
            type: String,
            required: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Brand',
            validate: {
                validator: async function (brandId) {
                    const brand = await mongoose.models.Brand.findById(brandId);
                    return !!brand; // Return true if the brand exists
                },
                message: (props) => `${props.value} is not a valid Brand ID!`,
            },
        },
        platForm: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'PlatForm',
            validate: {
                validator: async function (platFormId) {
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
            required: true,
            ref: 'DealCategory',
            validate: {
                validator: async function (DealCategoryId) {
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
        exchangeDealProducts: { type: [String] },
        postUrl: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
        },
        termsAndCondition: {
            type: String,
            required: true,
        },
        actualPrice: {
            type: String,
            required: true,
        },
        lessAmount: {
            type: String,
        },
        isCommissionDeal: {
            type: Boolean,
            default: false,
        },
        commissionValue: {
            type: String,
        },
        finalCashBackForUser: {
            type: String,
            required: true,
        },
        adminCommission: {
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
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            required: true,
            default: 'pending',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refundDays: {
            type: String,
            required: true,
        },
        paymentDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Deal', dealSchema);
//# sourceMappingURL=Deal.js.map
