import { ROLE_TYPE_ENUM } from '@/utilities/commonTypes';
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
        role: {
            type: [String],
            enum: ROLE_TYPE_ENUM,
            required: true,
            default: [ROLE_TYPE_ENUM.USER],
        },
        isDeleted: {
            type: Boolean,
            default: false,
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
