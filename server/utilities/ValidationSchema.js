import { z } from 'zod';
export const filterRefineFunction = (data) => {
    if (
        !(data.offset || data.offset === 0) &&
        !(data.limit || data.limit === 0)
    ) {
        return true;
    }
    if (
        !(data.offset || data.offset === 0) ||
        !(data.limit || data.limit === 0)
    ) {
        return false;
    }
    return true;
};
export const filterRefineMessage = {
    message: 'Please send both offset and limit or neither',
};
export const filterSchemaObject = z.object({
    offset: z
        .union([
            z.string().refine((data) => !isNaN(data), {
                message: 'offset should be a number or a numeric string',
            }),
            z.number(),
        ])
        .optional(),
    limit: z
        .union([
            z.string().refine((data) => !isNaN(data), {
                message: 'limit should be a number or a numeric string',
            }),
            z.number(),
        ])
        .optional(),
    search: z
        .string({ invalid_type_error: 'search should be string type' })
        .optional(),
    status: z
        .enum(['0', '1', ''], {
            invalid_type_error: 'in Valid status',
        })
        .optional(),
});
export const filterSchema = filterSchemaObject.refine(
    filterRefineFunction,
    filterRefineMessage,
);
//# sourceMappingURL=ValidationSchema.js.map
