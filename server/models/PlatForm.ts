import mongoose from 'mongoose';

const platFormSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    },
);

export default mongoose.model('PlatForm', platFormSchema);
