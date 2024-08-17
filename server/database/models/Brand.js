import mongoose from 'mongoose';
const brandSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Brand', brandSchema);
//# sourceMappingURL=Brand.js.map
