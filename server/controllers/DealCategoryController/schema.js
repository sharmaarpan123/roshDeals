import { z } from 'zod';
const addDealCategorySchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
});
const DealCategoryIdSchema = z.object({
    dealCategoryId: z
        .string({ required_error: 'DealCategoryId is  required' })
        .trim(),
});
const updateStatusChangeSchema = z
    .object({
        status: z.boolean({ invalid_type_error: 'in valid status' }),
    })
    .merge(DealCategoryIdSchema);
const editDealCategorySchema =
    addDealCategorySchema.merge(DealCategoryIdSchema);
export { addDealCategorySchema, editDealCategorySchema, DealCategoryIdSchema , updateStatusChangeSchema };
//# sourceMappingURL=schema.js.map
