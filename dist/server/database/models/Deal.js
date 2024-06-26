"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dealSchema = new mongoose_1.default.Schema({
    productName: {
        type: String,
        required: true,
    },
    brand: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: String,
        ref: 'Brand',
        validate: {
            validator: async function (brandId) {
                const brand = await mongoose_1.default.models.Brand.findById(brandId);
                return !!brand; // Return true if the brand exists
            },
            message: (props) => `${props.value} is not a valid Brand ID!`,
        },
    },
    platForm: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: String,
        ref: 'PlatForm',
        validate: {
            validator: async function (platFormId) {
                const platForm = await mongoose_1.default.models.PlatForm.findById(platFormId).lean();
                return !!platForm;
            },
            message: (props) => `${props.value} is not a valid PlatForm ID!`,
        },
    },
    dealCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: String,
        ref: 'DealCategory',
        validate: {
            validator: async function (DealCategoryId) {
                const DealCategory = await mongoose_1.default.models.DealCategory.findById(DealCategoryId).lean();
                return !!DealCategory;
            },
            message: (props) => `${props.value} is not a valid DealCategory ID!`,
        },
    },
    productCategories: {
        type: [String],
    },
    postUrl: {
        type: String,
        required: true,
    },
    termsAndCondition: {
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
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Deal', dealSchema);
//# sourceMappingURL=Deal.js.map