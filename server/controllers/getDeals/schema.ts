import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
} from '@/utilities/ValidationSchema';
import { z } from 'zod';

export enum SearchEnumType {
    brand = 'brand',
    dealCategory = 'dealCategory',
}

export const activeDealByBrandAndCategory = z

    .object({
        type: z.nativeEnum(SearchEnumType, {
            invalid_type_error: `please send valid type to search`,
            required_error: 'Type is required',
        }),
        id: z
            .string({ required_error: 'Id is required to search' })
            .min(1, { message: 'Id is required' }),
    })
    .merge(filterSchemaObject)
    .refine(filterRefineFunction, filterRefineMessage);
