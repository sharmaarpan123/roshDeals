import { z } from 'zod';
import {
    optionalEmailString,
    optionalPassword,
    optionalPhoneNUmber,
    optionalString,
    requiredBoolean,
    requiredEmailString,
    requiredPassword,
    requiredPhoneNumber,
    requiredString,
} from '../../../utilities/ValidationSchema.js';

class SellerValidation {
    getByIdSchema = z.object({
        sellerId: requiredString('Seller Id')
    });

    createSellerSchema = z.object({
        name: requiredString('Name'),
        email: requiredEmailString(),
        password: requiredPassword(),
        phoneNumber: requiredPhoneNumber(),
        dealIds: z.array(z.string()).optional(),
        isActive: z.boolean().default(true)
    });

    updateSellerSchema = z.object({
        sellerId: requiredString('Seller Id'),
        name: optionalString('Name'),
        email: optionalEmailString(),
        password: optionalPassword(),
        phoneNumber: optionalPhoneNUmber(),
        isActive: z.boolean().optional()
    });

    linkSellerDealsSchema = z.object({
        email: optionalEmailString(),
        phoneNumber: optionalPhoneNUmber(),
        dealIds: z.array(z.string()).min(1, 'At least one deal ID is required'),
        isActive: z.boolean().default(true)
    }).refine(
        (data) => data.email || data.phoneNumber,
        {
            message: "Either email or phone number is required",
            path: ["email"]
        }
    );
}

const sellerValidationSchema = new SellerValidation();

export default sellerValidationSchema; 