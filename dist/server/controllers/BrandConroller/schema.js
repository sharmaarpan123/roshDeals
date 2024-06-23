"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchema = exports.editSchema = exports.addSchema = void 0;
const zod_1 = require("zod");
const addSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: 'Name is required',
    })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    image: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'image url should have at least one character' })
        .optional(),
});
exports.addSchema = addSchema;
const deleteSchema = zod_1.z.object({
    brandId: zod_1.z.string({ required_error: 'brand Id is  required' }).trim(),
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
})
    .merge(deleteSchema);
exports.editSchema = editSchema;
//# sourceMappingURL=schema.js.map