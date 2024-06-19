import { z } from 'zod';

export const getDetails = z.object({
    userId: z
        .string({
            required_error: 'User ID is required',
        })
        .min(1, { message: 'User ID cannot be empty' }),
});

export const addBankDetailsSchema = z
    .object({
        bankName: z.string().optional(),
        accountHolderName: z.string().optional(),
        accountNumber: z.string().optional(),
        IFSC: z.string().optional(),
        upiId: z.string({
            required_error: 'Upi id   is required',
        }),
    })
    .merge(getDetails);

export const editBankDetailsSchema = z
    .object({
        bankName: z.string().optional(),
        accountHolderName: z.string().optional(),
        accountNumber: z.string().optional(),
        IFSC: z.string().optional(),
        upiId: z.string().optional(),
    })
    .merge(getDetails);
