"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editDealSchema = exports.getDeal = exports.addDealSchema = void 0;
const utilitis_1 = require("@/utilities/utilitis");
const zod_1 = require("zod");
const addDealSchema = zod_1.z.object({
    productName: zod_1.z
        .string({
        required_error: 'Product Name is required',
    })
        .trim()
        .min(1, { message: 'Product Name should have at least one character' }),
    brand: zod_1.z.string({
        required_error: 'Brand Id is required',
    }),
    platForm: zod_1.z
        .string({
        required_error: 'platFrom Id is required',
    })
        .trim(),
    dealCategory: zod_1.z
        .string({
        required_error: 'Deal category Id is required',
    })
        .trim(),
    productCategories: zod_1.z.array(zod_1.z.string({ invalid_type_error: 'product category should be string' })),
    postUrl: zod_1.z
        .string({ required_error: 'post url is required' })
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), { message: 'Invalid post url' }),
    termsAndCondition: zod_1.z.string({ required_error: 'This field is required' }),
    actualPrice: zod_1.z.string({ required_error: 'actual Price is required' }),
    isActive: zod_1.z.boolean().optional(),
    cashBack: zod_1.z.string({ required_error: 'cash Back Price is required' }),
    slotAlloted: zod_1.z.number({
        invalid_type_error: 'slot alloted should be numeric',
        required_error: 'slot alloted is required',
    }),
});
exports.addDealSchema = addDealSchema;
const getDeal = zod_1.z.object({
    dealId: zod_1.z.string({ required_error: 'DealId is  required' }).trim(),
});
exports.getDeal = getDeal;
const editDealSchema = zod_1.z
    .object({
    productName: zod_1.z
        .string()
        .trim()
        .min(1, {
        message: 'Product Name should have at least one character',
    })
        .optional(),
    brand: zod_1.z.string().optional(),
    platForm: zod_1.z.string().trim().optional(),
    dealCategory: zod_1.z.string().trim().optional(),
    productCategories: zod_1.z
        .array(zod_1.z.string({
        invalid_type_error: 'product category should be string',
    }))
        .optional(),
    postUrl: zod_1.z
        .string()
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), { message: 'Invalid post url' })
        .optional(),
    actualPrice: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    cashBack: zod_1.z.string().optional(),
    termsAndCondition: zod_1.z.string().optional(),
    slotAlloted: zod_1.z
        .number({ invalid_type_error: 'slot alloted should be numeric' })
        .optional(),
})
    .merge(getDeal);
exports.editDealSchema = editDealSchema;
//# sourceMappingURL=schema.js.map