import { z } from 'zod';

const addPlatFormSchema = z.object({
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

const deletePlatFormSchema = z.object({
    platFormId: z.string({ required_error: 'PlatFormId is  required' }).trim(),
});

const editPlatFormSchema = addPlatFormSchema.merge(deletePlatFormSchema);

export { addPlatFormSchema, editPlatFormSchema, deletePlatFormSchema };
