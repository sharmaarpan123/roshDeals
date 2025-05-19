import { z } from 'zod';
import { isUrlValid } from '../../../utilities/utilitis.js';
export const orderIdSchema = z.object({
    orderId: z
        .string({
            required_error: 'Order id is required',
        })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
});

export const createOrderSchema = z.object({
    reviewerName: z
        .string({
            required_error: 'Reviewer Name is required',
        })
        .trim()
        .min(1, { message: 'Reviewer should have at least one character' }),
    deals: z
        .array(
            z.object({
                dealId: z
                    .string()
                    .min(1, { message: 'Deals Ids are required' }),
                amount: z.number({
                    invalid_type_error:
                        'amount should be numeric in deals array',
                    required_error: 'amount is required in deals array',
                }),
            }),
            {
                invalid_type_error: 'invalid Deals Array',
                required_error: 'Deals are required',
            },
        )
        .nonempty({ message: 'At least One deals to create orders' }),
    orderIdOfPlatForm: z
        .string({
            required_error: 'Order id is required',
        })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
    // dealIds: z
    //     .array(z.string(), {
    //         invalid_type_error: 'invalid Deals Id',
    //         required_error: 'Deals Ids are required',
    //     })
    //     .nonempty({ message: 'At least One deals to create orders' }),
    orderScreenShot: z
        .string({
            required_error: 'Order Screenshot  is required',
        })
        .trim()
        .refine((data) => isUrlValid(data), {
            message: 'Invalid Order Screenshot Url',
        }),
    deliveryFee: z
        .string()
        .optional()
        .refine(
            (data) => {
                if (data && isNaN(data)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Delivery fee should be numeric',
            },
        ),
    exchangeDealProducts: z.array(z.string()).optional(),
    orderDate: z.string({ required_error: 'OrderDate is required' }).refine(
        (data) => {
            if (new Date(data) == 'Invalid Date') {
                return false;
            }
            return true;
        },
        { message: 'Invalid order date' },
    ),
}); //

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
    ); //
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
        orderDate: z
            .string()
            .refine(
                (data) => {
                    if (data && new Date(data) == 'Invalid Date') {
                        return false;
                    }
                    return true;
                },
                { message: 'Invalid order date' },
            )
            .optional(),
        deliveryFee: z
            .string()
            .optional()
            .refine(
                (data) => {
                    if (data && isNaN(data)) {
                        return false;
                    }
                    return true;
                },
                {
                    message: 'Delivery fee should be numeric',
                },
            ),
    })
    .merge(orderIdSchema);
