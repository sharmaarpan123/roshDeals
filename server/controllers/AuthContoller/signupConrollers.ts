import User from '@/database/models/User';
import { errorResponse, successResponse } from '@/utilities/Responses';
import catchAsync from '@/utilities/catchAsync';
import { hashPassword } from '@/utilities/hashPassword';
import { jwtGen } from '@/utilities/jwt';
import { Response, Request } from 'express';
import { z } from 'zod';

const schema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    phoneNumber: z
        .string({
            required_error: 'Phone Number is required',
        })
        .trim()
        .min(1, { message: 'Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
            message: 'phone Number should be Numeric',
        }),
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),

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
    fcmToken: z.string().optional(),
});

const signupController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = schema.parse(req.body);

        const { name, email, password, phoneNumber, fcmToken } = body;

        const isAlreadyExists = await User.findOne(
            {
                $or: [{ email }, { phoneNumber }],
            },
            {
                phoneNumber: 1,
                email: 1,
            },
        );

        if (isAlreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: `${(isAlreadyExists.email === email && 'This Email ') || 'This Phone Number '} is already exists`,
                }),
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
        });

        await user.save();

        const updatedUser = await User.findOneAndUpdate(
            {
                phoneNumber,
            },
            {
                fcmToken: fcmToken,
            },
            {
                new: true,
            },
        );

        const token = jwtGen(updatedUser);

        return res.status(200).json(
            successResponse({
                message: 'Sign up successfully',
                others: {
                    user: updatedUser,
                    token,
                },
            }),
        );
    },
);

export default signupController;
