import Admin from '../../database/models/Admin.js';
import User from '../../database/models/User.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import { hashPassword } from '../../utilities/hashPassword.js';
import { z } from 'zod';
const schema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
    otp: z
        .string({
            required_error: 'otp is required',
        })
        .trim()
        .min(4, { message: 'otp should contain at least 4 digit' })
        .max(4, { message: 'otp should contain  only 4 digit' })
        .refine(
            (str) => {
                return /^\d+$/.test(str);
            },
            { message: 'otp should contain only numeric values' },
        ),
    password: z
        .string({
            required_error: 'Password is required',
        })
        .trim()
        .min(1, { message: 'password is required' })
        .refine(
            (data) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                    data,
                ),
            {
                message:
                    'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
            },
        ),
});
const adminResetPassword = catchAsync(async (req, res) => {
    schema.parse(req.body);
    const { email, otp, password } = req.body;

    const isUserExists = await Admin.findOne({
        email,
    });
    if (!isUserExists) {
        return res.status(400).json(
            errorResponse({
                message: 'This email is not registered , please sign up',
            }),
        );
    }

    const isOtpValid = await Admin.findOne({
        email,
        otp,
    });
    if (!isOtpValid) {
        return res.status(400).json(
            errorResponse({
                message: 'wrong otp',
            }),
        );
    }
    const hashedPassword = await hashPassword(password);
    await Admin.findOneAndUpdate(
        { email },
        { password: hashedPassword, otp: '' },
    );
    return res.status(200).json(
        successResponse({
            message: 'Your Password is upgraded',
        }),
    );
});
export default adminResetPassword;
//# sourceMappingURL=resetPassword.js.map
