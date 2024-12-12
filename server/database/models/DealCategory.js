import mongoose from 'mongoose';
const dealCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isExchangeDeal: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('DealCategory', dealCategorySchema);
//# sourceMappingURL=DealCategory.js.map
