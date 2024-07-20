import { POSTER_ENUM } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';
const PosterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
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
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true,
});
export default mongoose.model('Poster', PosterSchema);
//# sourceMappingURL=Poster.js.map