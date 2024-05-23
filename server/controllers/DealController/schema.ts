import { isUrlValid } from '@/utilities/utilitis';
import { z } from 'zod';

const addDealSchema = z.object({
    productName: z
        .string({
            required_error: 'Product Name is required',
        })
        .trim()
        .min(1, { message: 'Product Name should have at least one character' }),
    brand: z.string({
        required_error: 'Brand Id is required',
    }),
    platForm: z
        .string({
            required_error: 'platFrom Id is required',
        })
        .trim(),
    dealCategory: z
        .string({
            required_error: 'Deal category Id is required',
        })
        .trim(),
    productCategories: z.array(
        z.string({ invalid_type_error: 'product category should be string' }),
    ),
    postUrl: z
        .string({ required_error: 'post url is required' })
        .trim()
        .refine((data) => isUrlValid(data), { message: 'Invalid post url' }),
    actualPrice: z.string({ required_error: 'actual Price is required' }),
    isActive: z.boolean().optional(),
    cashBack: z.string({ required_error: 'cash Back Price is required' }),
    slotAlloted: z.number({
        invalid_type_error: 'slot alloted should be numeric',
        required_error: 'slot alloted is required',
    }),
});

const getDeal = z.object({
    dealId: z.string({ required_error: 'DealId is  required' }).trim(),
});

const editDealSchema = z
    .object({
        productName: z
            .string()
            .trim()
            .min(1, {
                message: 'Product Name should have at least one character',
            })
            .optional(),
        brand: z.string().optional(),
        platForm: z.string().trim().optional(),
        dealCategory: z.string().trim().optional(),
        productCategories: z
            .array(
                z.string({
                    invalid_type_error: 'product category should be string',
                }),
            )
            .optional(),
        postUrl: z
            .string()
            .trim()
            .refine((data) => isUrlValid(data), { message: 'Invalid post url' })
            .optional(),
        actualPrice: z.string().optional(),
        isActive: z.boolean().optional(),
        cashBack: z.string().optional(),
        slotAlloted: z
            .number({ invalid_type_error: 'slot alloted should be numeric' })
            .optional(),
    })
    .merge(getDeal);

export { addDealSchema, getDeal, editDealSchema };
