"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlatFormSchema = exports.editPlatFormSchema = exports.addPlatFormSchema = void 0;
const utilitis_1 = require("@/utilities/utilitis");
const zod_1 = require("zod");
const addPlatFormSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: 'Name is required',
    })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
    image: zod_1.z
        .string()
        .trim()
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'image url is invalid',
    })
        .optional(),
});
exports.addPlatFormSchema = addPlatFormSchema;
const deletePlatFormSchema = zod_1.z.object({
    platFormId: zod_1.z.string({ required_error: 'PlatFormId is  required' }).trim(),
});
exports.deletePlatFormSchema = deletePlatFormSchema;
const editPlatFormSchema = zod_1.z
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
        .refine((data) => (0, utilitis_1.isUrlValid)(data), {
        message: 'image url is invalid',
    })
        .optional(),
})
    .merge(deletePlatFormSchema);
exports.editPlatFormSchema = editPlatFormSchema;
//# sourceMappingURL=schema.js.map