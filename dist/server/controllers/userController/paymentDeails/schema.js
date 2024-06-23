"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBankDetailsSchema = exports.addBankDetailsSchema = exports.getDetails = void 0;
const zod_1 = require("zod");
exports.getDetails = zod_1.z.object({
    userId: zod_1.z
        .string({
        required_error: 'User ID is required',
    })
        .min(1, { message: 'User ID cannot be empty' }),
});
exports.addBankDetailsSchema = zod_1.z
    .object({
    bankName: zod_1.z.string().optional(),
    accountHolderName: zod_1.z.string().optional(),
    accountNumber: zod_1.z.string().optional(),
    IFSC: zod_1.z.string().optional(),
    upiId: zod_1.z.string({
        required_error: 'Upi id   is required',
    }),
})
    .merge(exports.getDetails);
exports.editBankDetailsSchema = zod_1.z
    .object({
    bankName: zod_1.z.string().optional(),
    accountHolderName: zod_1.z.string().optional(),
    accountNumber: zod_1.z.string().optional(),
    IFSC: zod_1.z.string().optional(),
    upiId: zod_1.z.string().optional(),
})
    .merge(exports.getDetails);
//# sourceMappingURL=schema.js.map