import { POSTER_ENUM } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';

export const posterAddedByEnum = {
    superAdmin: 'superAdmin',
    admin: 'admin',
};

const PosterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        title: { type: String, required: true },
        addedBy: { type: String, enum: posterAddedByEnum },
        adminId: { type: mongoose.Types.ObjectId, ref: 'Admin' },
        image: { type: String },
        posterType: {
            type: String,
            enum: POSTER_ENUM,
            required: true,
        },
        brand: { type: mongoose.Types.ObjectId, ref: 'Brand' },
        dealCategory: { type: mongoose.Types.ObjectId, ref: 'DealCategory' },
        deal: { type: mongoose.Types.ObjectId, ref: 'Deal' },
        redirectUrl: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Poster', PosterSchema);
//# sourceMappingURL=Poster.js.map
