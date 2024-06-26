"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("@/database/models/User"));
const Responses_1 = require("@/utilities/Responses");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const hashPassword_1 = require("@/utilities/hashPassword");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: 'Email is required',
    })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
    otp: zod_1.z
        .string({
        required_error: 'otp is required',
    })
        .trim()
        .min(4, { message: 'otp should contain at least 4 digit' })
        .max(4, { message: 'otp should contain  only 4 digit' })
        .refine((str) => {
        return /^\d+$/.test(str);
    }, { message: 'otp should contain only numeric values' }),
    password: zod_1.z
        .string({
        required_error: 'Password is required',
    })
        .trim()
        .min(1, { message: 'password is required' })
        .refine((data) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(data), {
        message: 'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
    }),
});
const resetPasswordController = (0, catchAsync_1.default)(async (req, res) => {
    schema.parse(req.body);
    const { email, otp, password } = req.body;
    const isUserExists = await User_1.default.findOne({
        email,
    });
    if (!isUserExists) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This email is not registered , please sign up',
        }));
    }
    const isOtpValid = await User_1.default.findOne({
        email,
        otp,
    });
    if (!isOtpValid) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'wrong otp',
        }));
    }
    const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
    await User_1.default.findOneAndUpdate({ email }, { password: hashedPassword, otp: '' });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Your Password is upgraded',
    }));
});
exports.default = resetPasswordController;
//# sourceMappingURL=resetPassword.js.map