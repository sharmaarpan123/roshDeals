"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonTypes_1 = require("@/utilities/commonTypes");
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
        enum: commonTypes_1.ROLE_TYPE_ENUM,
        required: true,
        default: [commonTypes_1.ROLE_TYPE_ENUM.USER],
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
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map