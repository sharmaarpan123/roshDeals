"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusChangeSchema = exports.deleteSchema = exports.editSchema = exports.addSchema = void 0;
const commonTypes_1 = require("@/utilities/commonTypes");
const zod_1 = require("zod");
const addSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({
        required_error: 'Name is required',
    })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    title: zod_1.z
        .string({
        required_error: 'title is required',
    })
        .trim()
        .min(1, { message: 'title should have at least one character' }),
    image: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'image url should have at least one character' })
        .optional(),
    posterType: zod_1.z.nativeEnum(commonTypes_1.POSTER_ENUM, {
        required_error: 'Poster type is required',
        invalid_type_error: 'inValid Poster Type',
    }),
    brand: zod_1.z.string().optional(),
    dealCategory: zod_1.z.string().trim().optional(),
    deal: zod_1.z.string().trim().optional(),
    redirectUrl: zod_1.z.string().trim().optional(),
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.REDIRECT &&
        !data?.redirectUrl) {
        return false;
    }
    return true;
}, {
    message: 'please send redirect url',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.DEAL && !data?.deal) {
        return false;
    }
    return true;
}, {
    message: 'please send Deal Id',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.DEALCATEGORY &&
        !data?.dealCategory) {
        return false;
    }
    return true;
}, {
    message: 'please send  Deal Category Id',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.BRAND && !data?.brand) {
        return false;
    }
    return true;
}, {
    message: 'please send Brand Id',
});
exports.addSchema = addSchema;
const deleteSchema = zod_1.z.object({
    posterId: zod_1.z.string({ required_error: 'brand Id is  required' }).trim(),
});
exports.deleteSchema = deleteSchema;
const editSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({
        required_error: 'Name is required',
    })
        .trim()
        .min(1, { message: 'name should have at least one character' })
        .optional(),
    image: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'image url should have at least one character' })
        .optional(),
    title: zod_1.z
        .string({
        required_error: 'title is required',
    })
        .trim()
        .min(1, { message: 'title should have at least one character' })
        .optional(),
    posterType: zod_1.z
        .nativeEnum(commonTypes_1.POSTER_ENUM, {
        required_error: 'Poster type is required',
        invalid_type_error: 'inValid Poster Type',
    })
        .optional(),
    brand: zod_1.z.string().optional(),
    dealCategory: zod_1.z.string().trim().optional(),
    deal: zod_1.z.string().trim().optional(),
    redirectUrl: zod_1.z.string().trim().optional(),
})
    .merge(deleteSchema)
    .refine((data) => {
    if (data.posterType &&
        !data.brand &&
        !data.deal &&
        !data.dealCategory &&
        !data.redirectUrl) {
        return false;
    }
    return true;
}, {
    message: "make sure to send the field according to posterType else  don't send the posterType",
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.REDIRECT &&
        !data?.redirectUrl) {
        return false;
    }
    return true;
}, {
    message: 'please send redirect url',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.DEAL && !data?.deal) {
        return false;
    }
    return true;
}, {
    message: 'please send Deal Id',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.DEALCATEGORY &&
        !data?.dealCategory) {
        return false;
    }
    return true;
}, {
    message: 'please send  Deal Category Id',
})
    .refine((data) => {
    if (data.posterType === commonTypes_1.POSTER_ENUM.BRAND && !data?.brand) {
        return false;
    }
    return true;
}, {
    message: 'please send Brand Id',
});
exports.editSchema = editSchema;
const statusChangeSchema = zod_1.z
    .object({
    status: zod_1.z.boolean({ required_error: 'Status is required' }),
})
    .merge(deleteSchema);
exports.statusChangeSchema = statusChangeSchema;
//# sourceMappingURL=schema.js.map