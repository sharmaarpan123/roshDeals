import { z } from 'zod';

const addDealCategorySchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
});

const deleteDealCategorySchema = z.object({
    dealCategoryId: z
        .string({ required_error: 'DealCategoryId is  required' })
        .trim(),
});

const editDealCategorySchema = addDealCategorySchema.merge(
    deleteDealCategorySchema,
);

export {
    addDealCategorySchema,
    editDealCategorySchema,
    deleteDealCategorySchema,
};
