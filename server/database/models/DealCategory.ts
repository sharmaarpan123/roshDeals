import mongoose from 'mongoose';

const dealCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('DealCategory', dealCategorySchema);
