import User from '@/models/User';
import catchAsync from '@/utilities/catchAsync';
import { comparePassword } from '@/utilities/hashPassword';
import { jwtGen } from '@/utilities/jwt';
import { Response, Request } from 'express';
import { z } from 'zod';

const schema = z.object({
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

const signInController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        schema.parse(req.body);

        const { password, phoneNumber } = req.body as bodyType;

        const user = await User.findOne({
            phoneNumber,
        });

        if (!user) {
            return res.json({
                success: false,
                message: 'This Phone Number is not registered , please sign up',
            });
        }

        const isMatched = await comparePassword(password, user.password);

        if (!isMatched) {
            return res.json({
                success: false,
                message: 'wrong password',
            });
        }

        console.log(user);

        const token = jwtGen(user);
        return res.json({
            success: true,
            message: 'Sign in successfully',
            token,
            user,
        });
    },
);

export default signInController;
