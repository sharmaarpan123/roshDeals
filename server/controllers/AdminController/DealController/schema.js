import { isUrlValid } from '../../../utilities/utilitis.js';
import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
} from '../../../utilities/ValidationSchema.js';

const allDealsListSchema = filterSchemaObject
    .merge(
        z.object({
            status: z
                .enum(['0', '1', ''], {
                    message: 'invalid Status',
                })
                .optional(),
            paymentStatus: z
                .enum(['pending', 'received', 'paid', ''], {
                    message: 'invalid payment Status',
                })
                .optional(),
            isSlotCompleted: z
                .enum(['completed', 'uncompleted', ''], {
                    message: 'invalid slot payment status',
                })
                .optional(),
        }),
    )
    .refine(filterRefineFunction, filterRefineMessage);

const addDealSchema = z
    .object({
        productName: z
            .string({
                required_error: 'Product Name is required',
            })
            .trim()
            .min(1, {
                message: 'Product Name should have at least one character',
            }),
        brand: z.string({
            required_error: 'Brand Id is required',
        }),
        platForm: z
            .string({
                required_error: 'platFrom Id is required',
            })
            .trim(),
        dealCategory: z
            .string({
                required_error: 'Deal category Id is required',
            })
            .trim(),
        productCategories: z.array(
            z.string({
                invalid_type_error: 'product category should be string',
            }),
        ),
        postUrl: z
            .string({ required_error: 'post url is required' })
            .trim()
            .refine((data) => isUrlValid(data), {
                message: 'Invalid post url',
            }),
        termsAndCondition: z.string({
            required_error: 'This field is required',
        }),
        actualPrice: z
            .string({ required_error: 'actual Price is required' })
            .refine((data) => !isNaN(data), {
                message: 'actual price should be numeric',
            }),
        isActive: z.boolean().optional(),
        lessAmount: z.string().refine(
            (data) => {
                if (data && isNaN(data)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Less Amount should be numeric',
                path: ['lessAmount'],
            },
        ),
        commissionValue: z.string().refine(
            (data) => {
                if (data && isNaN(data)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Commission Value should be numeric',
                path: ['commissionValue'],
            },
        ),
        adminCommission: z
            .string({ required_error: 'Admin commission required' })
            .refine((data) => !isNaN(data), {
                message: 'Admin  commission should be numeric',
            }),
        slotAlloted: z.number({
            invalid_type_error: 'slot alloted should be numeric',
            required_error: 'slot alloted is required',
        }),
        finalCashBackForUser: z
            .string({
                invalid_type_error: 'invalid Final Cash Back For User',
                required_error: 'Final Cash Back For User is required',
            })
            .min(1, { message: 'Final Cash Back For User is required' }),
        refundDays: z
            .string({
                invalid_type_error: 'invalid refundDays',
                required_error: 'refundDays is required',
            })
            .min(1, { message: 'Slot Alloted is required' }),
        uniqueIdentifier: z
            .string({
                required_error: 'unique Identifier is required',
            })
            .min(1, { message: 'unique Identifier  is required' }),
        imageUrl: z.string().optional(),
        isExchangeDeal: z.boolean().optional(),
        refundDays: z.number({
            required_error: 'Please add refundDays field',
            invalid_type_error: 'refundDays field  should be numeric',
        }),
        exchangeDealProducts: z.array(z.string()).optional(),
        isCommissionDeal: z.boolean().optional(),
    })
    .refine(
        (data) => {
            if (
                data?.isExchangeDeal &&
                !data.exchangeDealProducts &&
                !data.exchangeDealProducts[0]
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                'If your deal is exchange deal , then please provide the exchange deals products fields',
            path: ['exchangeDealProducts'],
        },
    )
    .refine(
        (data) => {
            if (!data?.lessAmount && !data?.commissionValue) {
                return false;
            }
            return true;
        },
        {
            message: 'Please send either commission or lessAmount value',
            path: ['lessAmount'],
        },
    )
    .refine(
        (data) => {
            if (
                (data?.isCommissionDeal && !data?.commissionValue) ||
                (!data?.isCommissionDeal && data?.commissionValue)
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                'if your deal is commission based please send both  value commissionValue and isCommissionDeal value ',

            path: ['commissionValue'],
        },
    );

const BulkAddDealSchema = z.array(addDealSchema, {
    invalid_type_error: 'Bulk Add Data should be array',
    required_error: 'Bulk Add is required',
});

const getDeal = z.object({
    dealId: z.string({ required_error: 'DealId is  required' }).trim(),
});

export const paymentStatusChangeSchema = getDeal.merge(
    z.object({
        status: z.enum(['pending', 'paid'], {
            invalid_type_error: 'In Valid status',
            required_error: 'status is required',
        }),
    }),
);

export const statusChangeSchema = getDeal.merge(
    z.object({
        status: z.boolean({
            invalid_type_error: 'In Valid status',
            required_error: 'status is required',
        }),
    }),
);

const editDealSchema = z
    .object({
        productName: z
            .string()
            .trim()
            .min(1, {
                message: 'Product Name should have at least one character',
            })
            .optional(),
        brand: z.string().optional(),
        platForm: z.string().trim().optional(),
        dealCategory: z.string().trim().optional(),
        productCategories: z
            .array(
                z.string({
                    invalid_type_error: 'product category should be s   tring',
                }),
            )
            .optional(),
        postUrl: z
            .string()
            .trim()
            .refine((data) => isUrlValid(data), { message: 'Invalid post url' })
            .optional(),
        actualPrice: z
            .string()
            .refine((data) => !isNaN(data), {
                message: 'Actual price  should be numeric',
            })
            .optional(),
        isActive: z.boolean().optional(),
        lessAmount: z.string().refine(
            (data) => {
                if (data && isNaN(data)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Less Amount should be numeric',
                path: ['lessAmount'],
            },
        ),
        commissionValue: z.string().refine(
            (data) => {
                if (data && isNaN(data)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Commission Value should be numeric',
                path: ['commissionValue'],
            },
        ),
        adminCommission: z
            .string({ required_error: 'Admin commission required' })
            .refine((data) => !isNaN(data), {
                message: 'Admin  commission should be numeric',
            })
            .optional(),
        termsAndCondition: z.string().optional(),
        slotAlloted: z
            .number({ invalid_type_error: 'slot alloted should be numeric' })
            .optional(),
        uniqueIdentifier: z.string().optional(),
        imageUrl: z.string().optional(),
        exchangeDealProducts: z.array(z.string()).optional(),
        isExchangeDeal: z.boolean().optional(),
        finalCashBackForUser: z
            .string({
                invalid_type_error: 'invalid Final Cash Back For User',
                required_error: 'Final Cash Back For User is required',
            })
            .min(1, { message: 'Final Cash Back For User is required' }),
        refundDays: z
            .number({ invalid_type_error: 'Refund Days should be numeric' })
            .optional(),
        isCommissionDeal: z.boolean().optional(),
    })
    .merge(getDeal)
    .refine(
        (data) => {
            if (
                data?.isExchangeDeal &&
                !data.exchangeDealProducts &&
                !data.exchangeDealProducts[0]
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                'If your deal is exchange deal , then please provide the exchange deals products fields',
            path: ['exchangeDealProducts'],
        },
    )
    .refine(
        (data) => {
            if (!data?.lessAmount && !data?.commissionValue) {
                return false;
            }
            return true;
        },
        {
            message: 'Please send either commission or lessAmount value',
            path: ['lessAmount'],
        },
    )
    .refine(
        (data) => {
            if (
                (data?.isCommissionDeal && !data?.commissionValue) ||
                (!data?.isCommissionDeal && data?.commissionValue)
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                'if your deal is commission based please send both  value commissionValue and isCommissionDeal value ',
            path: ['commissionValue'],
        },
    );
const getDealsWithBrandIdSchema = z.object({
    brandId: z
        .string({ required_error: 'brand id is required' })
        .min(1, { message: "'brand id is required'" }),
});

export {
    addDealSchema,
    getDeal,
    editDealSchema,
    allDealsListSchema,
    getDealsWithBrandIdSchema,
    BulkAddDealSchema,
};
//# sourceMappingURL=schema.js.map
