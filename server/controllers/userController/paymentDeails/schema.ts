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
        bankName: z
            .string({
                required_error: 'Bank Name is required',
            })
            .min(1, { message: 'Bank Name cannot be empty' }),
        accountHolderName: z
            .string({
                required_error: 'Account Holder Name is required',
            })
            .min(1, { message: 'Account Holder Name cannot be empty' }),
        accountNumber: z
            .string({
                required_error: 'Account Number is required',
            })
            .min(1, { message: 'Account Number cannot be empty' }),
        IFSC: z
            .string({
                required_error: 'IFSC is required',
            })
            .min(1, { message: 'IFSC cannot be empty' }),
        upiId: z.string().optional(),
    })
    .merge(getDetails);

export const editBankDetailsSchema = z
    .object({
        bankName: z
            .string({
                required_error: 'Bank Name is required',
            })
            .min(1, { message: 'Bank Name cannot be empty' }),
        accountHolderName: z
            .string({
                required_error: 'Account Holder Name is required',
            })
            .min(1, { message: 'Account Holder Name cannot be empty' }),
        accountNumber: z
            .string({
                required_error: 'Account Number is required',
            })
            .min(1, { message: 'Account Number cannot be empty' }),
        IFSC: z
            .string({
                required_error: 'IFSC is required',
            })
            .min(1, { message: 'IFSC cannot be empty' }),
        upiId: z.string().optional(),
    })
    .merge(getDetails);
