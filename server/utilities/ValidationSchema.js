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
        .number({ invalid_type_error: 'offset Should be number' })
        .optional(),
    limit: z
        .number({ invalid_type_error: 'limit Should be number' })
        .optional(),
    search: z
        .string({ invalid_type_error: 'search should be string type' })
        .optional(),
});
export const filterSchema = filterSchemaObject.refine(
    filterRefineFunction,
    filterRefineMessage,
);
//# sourceMappingURL=ValidationSchema.js.map
