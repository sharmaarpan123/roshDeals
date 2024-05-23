import { z } from 'zod';

export const filterSchema = z
    .object({
        offset: z
            .number({ invalid_type_error: 'offset Should be number' })
            .optional(),
        limit: z
            .number({ invalid_type_error: 'limit Should be number' })
            .optional(),
        search: z
            .string({ invalid_type_error: 'search should be string type' })
            .optional(),
    })
    .refine(
        (data) => {
            if (
                !(data.offset || data.offset === 0) &&
                !(data.limit || data.limit === 0)
            ) {
                return true;
            }
            if (
                !(
                    (data.offset || data.offset === 0) &&
                    (data.limit || data.limit === 0)
                )
            ) {
                return false;
            }
            if (
                !(
                    (data.limit || data.limit === 0) &&
                    (data.offset || data.offset === 0)
                )
            ) {
                return false;
            }
            return true;
        },

        { message: 'Please send offset and limit both or other wise not any' },
    );
