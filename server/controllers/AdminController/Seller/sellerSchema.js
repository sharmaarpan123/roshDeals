import { z } from 'zod';
import {
    filterRefineFunction,
    filterRefineMessage,
    filterSchemaObject,
    optionalBoolean,
    optionalEmailString,
    optionalPassword,
    optionalPhoneNUmber,
    optionalString,
    requiredEmailString,
    requiredPassword,
    requiredPhoneNumber,
    requiredString,
} from '../../../utilities/ValidationSchema.js';

class SellerValidation {
    getByIdSchema = z.object({
        sellerId: requiredString('Seller Id'),
    });

    createSellerSchema = z.object({
        name: requiredString('Name'),
        email: requiredEmailString(),
        password: requiredPassword(),
        phoneNumber: requiredPhoneNumber(),
        dealIds: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
    });

    updateSellerSchema = z.object({
        sellerId: requiredString('Seller Id'),
        name: optionalString('Name'),
        email: optionalEmailString(),
        password: optionalPassword(),
        phoneNumber: optionalPhoneNUmber(),
        isActive: z.boolean().optional(),
    });

    linkSellerDealsSchema = z
        .object({
            email: optionalEmailString(),
            linkBySellerId: optionalBoolean().default(false),
            phoneNumber: optionalPhoneNUmber(),
            sellerId: optionalString('Seller Id'),
            dealIds: z
                .array(z.string())
                .min(1, 'At least one deal ID is required'),
            isActive: z.boolean().default(true),
        })
        .refine(
            (data) =>
                data.email ||
                data.phoneNumber ||
                (data.sellerId && data?.linkBySellerId),
            {
                message: 'Either email or phone number is required',
                path: ['email'],
            },
        )
        .refine((data) => data?.linkBySellerId || !data?.sellerId, {
            message: 'Please send the seller Id',
            path: ['sellerId'],
        });

    getSellerDealsSchema = z
        .object({
            sellerId: requiredString('Seller Id'),
            isActive: z.string().optional(),
        })
        .merge(filterSchemaObject)
        .refine(filterRefineFunction, filterRefineMessage);

    removeSellerDealSchema = z.object({
        dealId: requiredString('Deal Id'),
        sellerId: requiredString('Seller Id'),
    });

    addSellerDealSchema = z.object({
        sellerId: requiredString('Seller Id'),
        dealId: requiredString('Deal Id'),
        isActive: z.boolean().default(true),
    });

    getAdminDealSellersSchema = z
        .object({
            isActive: z.string().optional(),
        })
        .merge(filterSchemaObject)
        .refine(filterRefineFunction, filterRefineMessage);
}

const sellerValidationSchema = new SellerValidation();

export default sellerValidationSchema;
