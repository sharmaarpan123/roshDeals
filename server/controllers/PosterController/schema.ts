import { z } from 'zod';

const addSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    title: z
        .string({
            required_error: 'title is required',
        })
        .trim()
        .min(1, { message: 'title should have at least one character' }),
    image: z
        .string()
        .trim()
        .min(1, { message: 'image url should have at least one character' })
        .optional(),
});

const deleteSchema = z.object({
    posterId: z.string({ required_error: 'brand Id is  required' }).trim(),
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
        title: z
            .string({
                required_error: 'title is required',
            })
            .trim()
            .min(1, { message: 'title should have at least one character' }),
    })
    .merge(deleteSchema);

const statusChangeSchema = z
    .object({
        status: z.boolean({ required_error: 'Status is required' }),
    })
    .merge(deleteSchema);

export { addSchema, editSchema, deleteSchema, statusChangeSchema };
