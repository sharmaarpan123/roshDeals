import { isUrlValid } from '../../../utilities/utilitis.js';
import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
} from '../../../utilities/ValidationSchema.js';
import { ORDER_FORM_STATUS } from '../../../utilities/commonTypes.js';
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
                invalid_type_error: 'order is should be string',
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

export const allOrdersListSchema = filterSchemaObject
    .merge(
        z.object({
            orderFormStatus: z
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
            mediatorId: z.string().optional(),
            brandId: z.string().optional(),
            startDate: z
                .string()
                .refine(
                    (data) => {
                        if (data && new Date(data) == 'Invalid Date') {
                            return false;
                        }
                        return true;
                    },
                    { message: 'Invalid start date' },
                )
                .optional(),
            endDate: z
                .string()
                .refine(
                    (data) => {
                        if (data && new Date(data) == 'Invalid Date') {
                            return false;
                        }
                        return true;
                    },
                    { message: 'Invalid end date' },
                )
                .optional(),
        }),
    )
    .refine(
        (data) => {
            if (data?.startDate && !data?.endDate) {
                return false;
            }
            if (data?.endDate && !data?.startDate) {
                return false;
            }
            return true;
        },
        { message: 'Please send both start Date and end Date or neither' },
    )
    .refine(filterRefineFunction, filterRefineMessage);
