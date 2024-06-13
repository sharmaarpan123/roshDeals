import { ROLE_TYPE_ENUM } from '@/utilities/commonTypes';
import mongoose from 'mongoose';

export type RoleType = keyof typeof ROLE_TYPE_ENUM;

export interface UserType {
    name: string;
    _id: String;
    email: string;
    password: string;
    phoneNumber: string;
    otp: string;
    roles: ROLE_TYPE_ENUM[];
    fcmToken?: string;
    isDeleted: boolean;
    isVerified: boolean;
}

const userSchema = new mongoose.Schema<UserType>(
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
        roles: {
            type: [String],
            enum: ROLE_TYPE_ENUM,
            required: true,
            default: [ROLE_TYPE_ENUM.USER],
        },
        fcmToken: {
            type: String,
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
