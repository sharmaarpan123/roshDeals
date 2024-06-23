"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderFromUpdateSchema = exports.reviewFormSubmitSchema = exports.createOrderSchema = exports.orderIdSchema = void 0;
const utilitis_1 = require("@/utilities/utilitis");
const zod_1 = require("zod");
exports.orderIdSchema = zod_1.z.object({
    orderId: zod_1.z
        .string({
        required_error: 'Order id is required',
    })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
});
exports.createOrderSchema = zod_1.z.object({
    reviewerName: zod_1.z
        .string({
        required_error: 'Reviewer Name is required',
    })
        .trim()
        .min(1, { message: 'Reviewer should have at least one character' }),
    orderIdOfPlatForm: zod_1.z
        .string({
        required_error: 'Order id is required',
    })
        .trim()
        .min(1, { message: 'Order Id have at least one character' }),
    dealIds: zod_1.z
        .array(zod_1.z.string(), {
        invalid_type_error: 'invalid Deals Id',
        required_error: 'Deals Ids are required',
    })
        .nonempty({ message: 'At least One deals to create orders' }),
    orderScreenShot: zod_1.z
        .string({
        required_error: 'Order Screenshot  is required',
    })
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'Invalid Order Screenshot Url',
    }),
});
exports.reviewFormSubmitSchema = zod_1.z
    .object({
    deliveredScreenShot: zod_1.z
        .string({ required_error: 'Delivered Screenshot is required' })
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'Invalid Order Screenshot Url',
    }),
    reviewScreenShot: zod_1.z
        .string()
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'Invalid Order Screenshot Url',
    })
        .optional(),
    reviewLink: zod_1.z
        .string()
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'Invalid Order Screenshot Url',
    })
        .optional(),
    sellerFeedback: zod_1.z
        .object({
        screenShot: zod_1.z
            .string({
            required_error: 'Seller FeedBack Screenshot is required',
        })
            .refine((data) => (0, utilitis_1.isUrlValid)(data), {
            message: 'Invalid  seller FeedBack url',
        }),
        link: zod_1.z
            .string({
            required_error: 'Seller FeedBack Link is required',
        })
            .refine((data) => (0, utilitis_1.isUrlValid)(data), {
            message: 'Invalid  seller FeedBack url',
        }),
    }, { invalid_type_error: 'InValid seller Feed Back' })
        .optional(),
})
    .merge(exports.orderIdSchema)
    .refine((data) => {
    if ((data?.reviewLink && !data?.reviewScreenShot) ||
        (data?.reviewScreenShot && !data?.reviewLink)) {
        return false;
    }
    return true;
}, {
    message: 'Please send both review Link and review Screenshot  or neither',
});
exports.OrderFromUpdateSchema = zod_1.z
    .object({
    reviewerName: zod_1.z.string().trim().optional(),
    orderScreenShot: zod_1.z
        .string()
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'Invalid Order Screenshot Url',
    })
        .optional(),
    orderIdOfPlatForm: zod_1.z.string().trim().optional(),
})
    .merge(exports.orderIdSchema);
//# sourceMappingURL=Schema.js.map