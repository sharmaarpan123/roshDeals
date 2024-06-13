import { isUrlValid } from '@/utilities/utilitis';
import { z } from 'zod';

export const createOrderSchema = z.object({
    reviewerName: z
        .string({
            required_error: 'Reviewer Name is required',
        })
        .trim()
        .min(1, { message: 'Reviewer should have at least one character' }),
    orderId: z
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
