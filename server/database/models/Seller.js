import mongoose from 'mongoose';
import { SELLER_ROLE_TYPE_ENUM } from '../../utilities/commonTypes.js';
const sellerSchema = new mongoose.Schema(
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
        fcmTokens: {
            type: [String],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: SELLER_ROLE_TYPE_ENUM,
            required: true,
            default: SELLER_ROLE_TYPE_ENUM.SELLER,
        },
    },
    {
        timestamps: true,
    },
);
export default mongoose.model('Seller', sellerSchema);
