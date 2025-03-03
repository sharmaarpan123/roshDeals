import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
    requiredString,
} from '../../utilities/ValidationSchema.js';

class schema {
    meQuerySchema = z.object({
        token: z
            .string({ required_error: 'token is required' })
            .min(1, 'token is required'),
    });
    getChatWithFilters = z
        .object({
            sender: requiredString('sender'),
            reciever: requiredString('reciever'),
        })
        .merge(filterSchemaObject)
        .refine(filterRefineFunction, filterRefineMessage);
}

const userControllerSchema = new schema();

export default userControllerSchema;
