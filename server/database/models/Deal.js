
import mongoose from 'mongoose';
const dealSchema = new mongoose.Schema(
    {
        parentDealId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deal',
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        productName: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        uniqueIdentifier: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: function () {
                return !this.parentDealId;
            },
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
            ref: 'PlatForm',
            required: function () {
                return !this.parentDealId;
            },
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
            ref: 'DealCategory',
            required: function () {
                return !this.parentDealId;
            },
            validate: {
                validator: async function (dealCategoryId) {
                    const dealCategory =
                        await mongoose.models.DealCategory.findById(
                            dealCategoryId,
                        ).lean();
                    return !!dealCategory;
                },
                message: (props) =>
                    `${props.value} is not a valid DealCategory ID!`,
            },
        },
        // productCategories: {
        //     type: [String],
        // },
        exchangeDealProducts: { type: [String] },
        postUrl: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        imageUrl: {
            type: String,
        },
        termsAndCondition: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        actualPrice: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        lessAmount: {
            type: String,
        },
        lessAmountToSubAdmin: {
            type: String,
        },
        isCommissionDeal: {
            type: Boolean,
            default: false,
        },
        commissionValue: {
            type: String,
        },
        commissionValueToSubAdmin: {
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
            required: function () {
                return !this.parentDealId;
            },
        },
        slotCompletedCount: {
            type: Number,
            required: function () {
                return !this.parentDealId;
            },
            default: 0,
        },
        isSlotCompleted: {
            type: Boolean,
            default: false,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            required: function () {
                return !this.parentDealId;
            },
            default: 'pending',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refundDays: {
            type: String,
            required: function () {
                return !this.parentDealId;
            },
        },
        paymentDate: {
            type: Date,
        },
        showToUsers: {
            type: Boolean,
            default: true,
        },
        showToSubAdmins: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Deal', dealSchema);
//# sourceMappingURL=Deal.js.map
