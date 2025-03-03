import { z } from 'zod';

export const requiredString = (key) => {
    return z
        .string({
            required_error: key + ' is required',
        })
        .trim()
        .min(1, { message: key + ' should have at least one character' });
};

export const requiredBoolean = (key) => {
    return z.boolean({
        required_error: key + ' is required',
        invalid_type_error: key + ' should be boolean',
    });
};

export const optionalBoolean = (key) => {
    return z
        .boolean({
            invalid_type_error: key + ' should be boolean',
        })
        .optional();
};

export const optionalPhoneNUmber = (key = '') =>
    z
        .string({
            required_error: key + ' Phone Number is required',
        })
        .trim()
        .min(1, { message: key + ' Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
            message: key + ' phone Number should be Numeric',
        })
        .optional();

export const requiredPhoneNumber = (key = '') =>
    z
        .string({
            required_error: key + ' Phone Number is required',
        })
        .trim()
        .min(1, { message: key + ' Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
            message: key + ' phone Number should be Numeric',
        });

export const optionalString = () => {
    return z.string().trim().optional();
};

export const requiredEmailString = (key = '') => {
    return z
        .string({
            required_error: key + ' Email is required',
        })
        .trim()
        .email('Please send a valid' + key + 'email')
        .toLowerCase();
};

export const optionalEmailString = (key = '') => {
    return z
        .string()
        .trim()
        .email('Please send a valid ' + key + 'email')
        .toLowerCase()
        .optional();
};

export const requiredPassword = () =>
    z
        .string({
            required_error: 'Password is required',
        })
        .trim()
        .min(1, { message: 'password is required' })
        .refine(
            (data) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                    data,
                ),
            {
                message:
                    'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
            },
        );

export const optionalPassword = () =>
    z
        .string()
        .optional()
        .refine(
            (data) => {
                if (!data) {
                    return true;
                }
                if (
                    data &&
                    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                        data,
                    )
                ) {
                    return false;
                }

                return true;
            },

            {
                message:
                    'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
            },
        );

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
    selectedCategoryFilter: z
        .array(z.string())
        .nullable() // explicitly allow null values
        .optional(),
    selectedPlatformFilter: z
        .array(z.string())
        .nullable() // explicitly allow null values
        .optional(),
    selectedBrandFilter: z
        .array(z.string())
        .nullable() // explicitly allow null values
        .optional(),
    selectedDate: z
        .string()
        .nullable() // explicitly allow null values
        .optional(),
});
export const filterSchema = filterSchemaObject.refine(
    filterRefineFunction,
    filterRefineMessage,
);
//# sourceMappingURL=ValidationSchema.js.map
