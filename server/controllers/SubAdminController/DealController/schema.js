import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
    optionalString,
} from '../../../utilities/ValidationSchema.js';

class SubAdminDealSchemaClass {
    cloneDealSchema = z
        .object({
            dealId: z.string().optional(),
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
            finalCashBackForUser: z
                .string({
                    invalid_type_error: 'invalid Final Cash Back For User',
                    required_error: 'Final Cash Back For User is required',
                })
                .min(1, { message: 'Final Cash Back For User is required' }),
        })
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
        );

    allDealsListSchema = filterSchemaObject
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
                mediatorId: optionalString(),
            }),
        )
        .refine(filterRefineFunction, filterRefineMessage);

    getDeal = z.object({
        dealId: z.string({ required_error: 'DealId is  required' }).trim(),
    });
}

const SubAdminDealSchema = new SubAdminDealSchemaClass();

export default SubAdminDealSchema;
