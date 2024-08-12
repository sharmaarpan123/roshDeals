import { isUrlValid } from '../../utilities/utilitis.js';
import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
} from '../../utilities/ValidationSchema.js';
import { ORDER_FORM_STATUS } from '../../utilities/commonTypes.js';
export const orderIdSchema = z.object({
    orderId: z
        .string({
            required_error: 'Order id is required',
        })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
});

export const bulkPaymentStatusUpdateSchema = z.object({
    status: z.enum(['pending', 'paid']),
    orderIds: z.array(
        z
            .string({
                required_error: 'Order id is required',
                invalid_type_error :"order is should be string"
            })
            .trim()
            .min(1, { message: 'Order Id have at least one character' }),
        {
            invalid_type_error: 'orderIds field should be array',
            required_error: 'Order Ids is required',
        },
    ),
});

export const paymentStatusUpdateSchema = orderIdSchema.merge(
    z.object({
        status: z.enum(['pending', 'paid']),
    }),
);

export const acceptRejectOrderSchema = orderIdSchema
    .merge(
        z.object({
            status: z.enum(
                [
                    ORDER_FORM_STATUS.ACCEPTED,
                    ORDER_FORM_STATUS.REJECTED,
                    ORDER_FORM_STATUS.REVIEW_FORM_ACCEPTED,
                    ORDER_FORM_STATUS.REVIEW_FORM_REJECTED,
                ],
                {
                    message: 'inValid status',
                    required_error: 'status is required',
                },
            ),
            rejectReason: z.string().optional(),
        }),
    )
    .refine(
        (data) => {
            if (
                !data?.rejectReason?.trim() &&
                (data.status === ORDER_FORM_STATUS.REJECTED ||
                    data.status === ORDER_FORM_STATUS.REVIEW_FORM_REJECTED)
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'On reject  , Reason is required',
            path: ['rejectReason'],
        },
    );
export const createOrderSchema = z.object({
    reviewerName: z
        .string({
            required_error: 'Reviewer Name is required',
        })
        .trim()
        .min(1, { message: 'Reviewer should have at least one character' }),
    orderIdOfPlatForm: z
        .string({
            required_error: 'Order id is required',
        })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
    dealIds: z
        .array(z.string(), {
            invalid_type_error: 'invalid Deals Id',
            required_error: 'Deals Ids are required',
        })
        .nonempty({ message: 'At least One deals to create orders' }),
    orderScreenShot: z
        .string({
            required_error: 'Order Screenshot  is required',
        })
        .trim()
        .refine((data) => isUrlValid(data), {
            message: 'Invalid Order Screenshot Url',
        }),
});
export const reviewFormSubmitSchema = z
    .object({
        deliveredScreenShot: z
            .string({ required_error: 'Delivered Screenshot is required' })
            .trim()
            .refine((data) => isUrlValid(data), {
                message: 'Invalid Delivered Screenshot Url',
            }),
        reviewScreenShot: z
            .string()
            .trim()
            .refine((data) => isUrlValid(data), {
                message: 'Invalid review Screenshot Url',
            })
            .optional(),
        reviewLink: z
            .string()
            .trim()
            .refine((data) => isUrlValid(data), {
                message: 'Invalid review  link Url',
            })
            .optional(),
        sellerFeedback: z
            .string({ invalid_type_error: 'InValid seller Feed Back' })
            .optional(),
        paymentId: z
            .string({
                invalid_type_error: 'In valid Payment id',
                required_error: 'payment id is required',
            })
            .min(1, { message: 'payment id is required' }),
    })
    .merge(orderIdSchema)
    .refine(
        (data) => {
            if (
                (data?.reviewLink && !data?.reviewScreenShot) ||
                (data?.reviewScreenShot && !data?.reviewLink)
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                'Please send both review Link and review Screenshot  or neither',
        },
    );
export const OrderFromUpdateSchema = z
    .object({
        reviewerName: z.string().trim().optional(),
        orderScreenShot: z
            .string()
            .trim()
            .refine((data) => isUrlValid(data), {
                message: 'Invalid Order Screenshot Url',
            })
            .optional(),
        orderIdOfPlatForm: z.string().trim().optional(),
    })
    .merge(orderIdSchema);

export const allOrdersListSchema = filterSchemaObject
    .merge(
        z.object({
            status: z
                .enum(
                    [
                        'pending',
                        'accepted',
                        'rejected',
                        'reviewFormSubmitted',
                        'reviewFormAccepted',
                        'reviewFormRejected',
                        '',
                    ],
                    {
                        message: 'invalid Status',
                    },
                )
                .optional(),
            dealId: z
                .array(
                    z.string({ invalid_type_error: 'dealId should be string' }),
                    { invalid_type_error: 'deal Id should be arr' },
                )
                .optional(),
            brandId: z.string().optional(),
        }),
    )
    .refine(filterRefineFunction, filterRefineMessage);
