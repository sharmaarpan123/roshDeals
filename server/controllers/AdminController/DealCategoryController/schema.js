import { z } from 'zod';
import { requiredBoolean } from '../../../utilities/ValidationSchema.js';
const addDealCategorySchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    image: z
        .string({
            required_error: 'Image is required',
        })
        .min(1, { message: 'Image is required' })
        .trim(),
    isExchangeDeal: requiredBoolean('Is Exchange Deal'),
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
export {
    addDealCategorySchema,
    editDealCategorySchema,
    DealCategoryIdSchema,
    updateStatusChangeSchema,
};
//# sourceMappingURL=schema.js.map
