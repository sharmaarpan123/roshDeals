"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("@/database/models/User"));
const Responses_1 = require("@/utilities/Responses");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const hashPassword_1 = require("@/utilities/hashPassword");
const jwt_1 = require("@/utilities/jwt");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    phoneNumber: zod_1.z
        .string({
        required_error: 'Phone Number is required',
    })
        .trim()
        .min(1, { message: 'Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
        message: 'phone Number should be Numeric',
    }),
    password: zod_1.z
        .string({
        required_error: 'Password is required',
    })
        .trim()
        .min(1, { message: 'password is required' })
        .refine((data) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(data), {
        message: 'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
    }),
    fcmToken: zod_1.z.string().optional(),
});
const signInController = (0, catchAsync_1.default)(async (req, res) => {
    schema.parse(req.body);
    const { password, phoneNumber, fcmToken } = req.body;
    const user = await User_1.default.findOne({
        phoneNumber,
    });
    if (!user) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This Phone Number is not registered , please sign up',
        }));
    }
    const isMatched = await (0, hashPassword_1.comparePassword)(password, user.password);
    if (!isMatched) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'wrong password',
        }));
    }
    const updatedUser = await User_1.default.findOneAndUpdate({
        phoneNumber,
    }, {
        fcmToken: fcmToken,
    }, {
        new: true,
    });
    const token = (0, jwt_1.jwtGen)(updatedUser);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Sign in successfully',
        others: { user: updatedUser, token },
    }));
});
exports.default = signInController;
//# sourceMappingURL=signInController.js.map