import User from '../../database/models/User.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import { comparePassword, hashPassword } from '../../utilities/hashPassword.js';
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
const resetPasswordController = catchAsync(async (req, res) => {
    const body = schema.parse(req.body);
    const { email, otp, password } = body;

    const isUserExists = await User.findOne({
        email,
    });

    if (!isUserExists) {
        return res.status(400).json(
            errorResponse({
                message: 'Provided email address is not associated with any account , please sign up',
            }),
        );
    }

    const isMatched = await comparePassword(password, isUserExists.password);

    if (isMatched) {
        return res.status(400).json(
            errorResponse({
                message:
                    'The new password cannot be the same as the current one.',
            }),
        );
    }

    const isOtpValid = await User.findOne({
        email,
        otp,
    });
    if (!isOtpValid) {
        return res.status(400).json(
            errorResponse({
                message: 'Please enter a valid OTP',
            }),
        );
    }
    const hashedPassword = await hashPassword(password);
    await User.findOneAndUpdate(
        { email },
        { password: hashedPassword, otp: '' },
    );
    return res.status(200).json(
        successResponse({
            message: ' Password Updated successfully.',
        }),
    );
});
export default resetPasswordController;
//# sourceMappingURL=resetPassword.js.map
