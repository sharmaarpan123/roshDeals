import mongoose from 'mongoose';
const platFormSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('PlatForm', platFormSchema);
//# sourceMappingURL=PlatForm.js.map
