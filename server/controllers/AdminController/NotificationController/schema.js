import { z } from 'zod';
const notificationArr = ['users', 'dealOrderStatus', 'toMed', 'toAgency'];
export const orderStatus = [
    'pending',
    'rejected',
    'accepted',
    'reviewFormSubmitted',
    'reviewFormRejected',
    'reviewFormAccepted',
];

export const sendNotificationSchema = z
    .object({
        title: z
            .string({ required_error: 'title is required' })
            .trim()
            .min(1, { message: 'title is required' }),
        body: z
            .string({ required_error: 'message is required' })
            .trim()
            .min(1, { message: 'message is required' }),
        type: z.enum(notificationArr, {
            required_error: 'in valid notification type',
        }),
        dealId: z.string().optional(),
        orderStatus: z
            .enum(orderStatus, { invalid_type_error: 'in valid order status' })
            .optional(),
    })
    .refine(
        (data) => {
            if (data?.type?.value === 'dealOrderStatus' && !data?.dealId) {
                return false;
            }
            return true;
        },
        {
            message: 'please select deal',
            path: ['dealId'],
        },
    )
    .refine(
        (data) => {
            if (data?.type?.value === 'dealOrderStatus' && !data?.orderStatus) {
                return false;
            }
            return true;
        },
        {
            message: 'please select status  ',
            path: ['orderStatus'],
        },
    );
