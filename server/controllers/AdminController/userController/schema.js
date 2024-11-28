import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
} from '../../../utilities/ValidationSchema.js';

export const userIdSchema = z.object({
    userId: z.string({ required_error: 'userId required' }),
});

export const getAllUserSchema = z
    .object({
        status: z.enum(['', '0', '1'], {
            invalid_type_error: 'invalid status',
        }),
    })
    .merge(filterSchemaObject)
    .refine(filterRefineFunction, filterRefineMessage);

export const activeInActiveSchema = z
    .object({
        status: z.boolean({
            required_error: 'status is required ',
            invalid_type_error: 'invalid  status',
        }),
    })
    .merge(userIdSchema);

export const updateUserSchema = z
    .object({
        status: z
            .boolean({
                required_error: 'status is required ',
                invalid_type_error: 'invalid  status',
            })
            .optional(),

        name: z
            .string({ required_error: 'name is required' })
            .trim()
            .optional(),
        email: z
            .string({ required_error: 'email is required' })
            .trim()
            .email('Please send a valid email')
            .toLowerCase(),
        phoneNumber: z
            .string({
                required_error: 'Phone Number is required',
            })
            .trim()
            .min(1, { message: 'Phone Number is required' })
            .refine((data) => /^\d+$/.test(data), {
                message: 'phone Number should be Numeric',
            })
            .optional(),
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
            )
            .optional(),
    })
    .merge(userIdSchema);
