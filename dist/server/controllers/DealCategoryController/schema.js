"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealCategorySchema = exports.editDealCategorySchema = exports.addDealCategorySchema = void 0;
const zod_1 = require("zod");
const addDealCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: 'Name is required',
    })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
});
exports.addDealCategorySchema = addDealCategorySchema;
const deleteDealCategorySchema = zod_1.z.object({
    dealCategoryId: zod_1.z
        .string({ required_error: 'DealCategoryId is  required' })
        .trim(),
});
exports.deleteDealCategorySchema = deleteDealCategorySchema;
const editDealCategorySchema = addDealCategorySchema.merge(deleteDealCategorySchema);
exports.editDealCategorySchema = editDealCategorySchema;
//# sourceMappingURL=schema.js.map