import User from '@/models/User';
import catchAsync from '@/utilities/catchAsync';
import { hashPassword } from '@/utilities/hashPassword';
import { Response, Request } from 'express';
import { z } from 'zod';

const schema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
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
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email'),
    phoneNumber: z
        .string({
            required_error: 'Phone Number is required',
        })
        .trim()
        .min(1, { message: 'Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
            message: 'phone Number should be Numeric',
        }),
});

type bodyType = z.infer<typeof schema>;

const signupController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        schema.parse(req.body);

        const { name, email, password, phoneNumber } = req.body as bodyType;

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
            return res.json({
                success: false,
                message: `${(isAlreadyExists.email === email && 'This Email ') || 'This Phone Number '} is already exists`,
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
        });

        await user.save();

        return res.json({
            success: true,
            message: 'Sign up successfully',
        });
    },
);

export default signupController;
