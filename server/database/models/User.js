import { ROLE_TYPE_ENUM } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            default: '',
        },
        currentAdminReference: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
        },
        historyAdminReferences: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Admin',
        },
        roles: {
            type: [String],
            enum: ROLE_TYPE_ENUM,
            required: true,
            default: [ROLE_TYPE_ENUM.USER],
        },
        fcmToken: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map
