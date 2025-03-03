import { ADMIN_ROLE_TYPE_ENUM } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';
const adminModuleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        uniqueSlug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('AdminModule', adminModuleSchema);
