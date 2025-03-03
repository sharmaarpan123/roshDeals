import { ADMIN_ROLE_TYPE_ENUM } from '../../utilities/commonTypes.js';
import mongoose from 'mongoose';

const PermissionObj = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminModule' },
    allowAccess: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canAdd: { type: Boolean, default: false },
    canView: { type: Boolean, default: false },
    canViewList: { type: Boolean, default: false },
});

const adminSchema = new mongoose.Schema(
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
        userName: {
            type: String,
            unique: true,
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
        roles: {
            type: [String],
            enum: ADMIN_ROLE_TYPE_ENUM,
            required: true,
        },
        fcmTokens: {
            type: [String],
        },
        permissions: {
            type: [PermissionObj],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Admin', adminSchema);
