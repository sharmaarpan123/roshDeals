import mongoose from 'mongoose';

const PosterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        title: { type: String, required: true },
        image: { type: String },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Poster', PosterSchema);
