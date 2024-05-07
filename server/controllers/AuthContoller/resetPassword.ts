import User from '@/models/User';
import catchAsync from '@/utilities/catchAsync';
import { hashPassword } from '@/utilities/hashPassword';
import { Response, Request } from 'express';
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
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                    data,
                ),
            {
                message:
                    'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
            },
        ),
});

type bodyType = z.infer<typeof schema>;

const resetPasswordController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        schema.parse(req.body);

        const { email, otp, password } = req.body as bodyType;

        const isUserExists = await User.findOne({
            email,
        });

        if (!isUserExists) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'This email is not registered , please sign up',
            });
        }

        const isOtpValid = await User.findOne({
            email,
            otp,
        });
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'wrong otp',
            });
        }

        const hashedPassword = await hashPassword(password);

        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword, otp: '' },
        );

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Your Password is upgraded',
        });
    },
);

export default resetPasswordController;
