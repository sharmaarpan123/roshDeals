import { z } from 'zod';
const addSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    image: z
        .string()
        .trim()
        .min(1, { message: 'image url should have at least one character' })
        .optional(),
});
const brandIdSchema = z.object({
    brandId: z.string({ required_error: 'brand Id is  required' }).trim(),
});
const editSchema = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .trim()
            .min(1, { message: 'name should have at least one character' })
            .optional(),
        image: z
            .string()
            .trim()
            .min(1, { message: 'image url should have at least one character' })
            .optional(),
    })
    .merge(brandIdSchema);

const updateStatusSchema = z.object({
    status: z.boolean({ invalid_type_error: 'inValid status' }),
}).merge(brandIdSchema);

export { addSchema, editSchema, brandIdSchema, updateStatusSchema };
//# sourceMappingURL=schema.js.map
