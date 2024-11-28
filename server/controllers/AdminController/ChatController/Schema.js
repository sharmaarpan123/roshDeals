import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
    requiredString,
} from '../../../utilities/ValidationSchema.js';

export const getChatWithFilters = z
    .object({
        sender: requiredString("sender"),
        reciever: requiredString("reciever"),
    })
    .merge(filterSchemaObject)
    .refine(filterRefineFunction, filterRefineMessage);
