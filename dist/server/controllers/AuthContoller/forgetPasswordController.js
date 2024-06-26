"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("@/database/models/User"));
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const utilitis_1 = require("@/utilities/utilitis");
const zod_1 = require("zod");
const forgetpasswordTemplate_1 = __importDefault(require("@/services/email/emailsTemplates/forgetpasswordTemplate"));
const NodeMailerTransPorter_1 = __importDefault(require("@/services/email/NodeMailerTransPorter"));
const Responses_1 = require("@/utilities/Responses");
const schema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: 'Email is required',
    })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
});
const forgetPasswordController = (0, catchAsync_1.default)(async (req, res) => {
    schema.parse(req.body);
    const { email } = req.body;
    const isUserRegistered = await User_1.default.findOne({
        email,
    });
    if (!isUserRegistered) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This email is not registered',
        }));
    }
    const otp = (0, utilitis_1.randomOtp)();
    await User_1.default.findOneAndUpdate({ email }, { otp });
    const transporter = (0, NodeMailerTransPorter_1.default)();
    const mailOptions = {
        from: process.env.GOOGLE_APP_USER,
        to: email,
        subject: 'ROSH DEALS - Reset Your Password ',
        html: (0, forgetpasswordTemplate_1.default)(otp),
    };
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(400).json((0, Responses_1.errorResponse)({
                message: `something went wrong while sending the mail please contact us at ==>  ${process.env.HELP_CONTACT_NUMBER}`,
                errorInfo: error,
            }));
        }
        else {
            return res.status(200).json((0, Responses_1.successResponse)({
                message: 'Your One Time Password is sended to the mail',
            }));
        }
    });
});
exports.default = forgetPasswordController;
//# sourceMappingURL=forgetPasswordController.js.map