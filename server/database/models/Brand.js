import mongoose from 'mongoose';
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
export default mongoose.model('Brand', brandSchema);
//# sourceMappingURL=Brand.js.map