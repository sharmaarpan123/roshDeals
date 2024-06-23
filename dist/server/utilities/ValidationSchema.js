"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSchema = exports.filterSchemaObject = exports.filterRefineMessage = exports.filterRefineFunction = void 0;
const zod_1 = require("zod");
const filterRefineFunction = (data) => {
    if (!(data.offset || data.offset === 0) &&
        !(data.limit || data.limit === 0)) {
        return true;
    }
    if (!(data.offset || data.offset === 0) ||
        !(data.limit || data.limit === 0)) {
        return false;
    }
    return true;
};
exports.filterRefineFunction = filterRefineFunction;
exports.filterRefineMessage = {
    message: 'Please send both offset and limit or neither',
};
exports.filterSchemaObject = zod_1.z.object({
    offset: zod_1.z
        .number({ invalid_type_error: 'offset Should be number' })
        .optional(),
    limit: zod_1.z
        .number({ invalid_type_error: 'limit Should be number' })
        .optional(),
    search: zod_1.z
        .string({ invalid_type_error: 'search should be string type' })
        .optional(),
});
exports.filterSchema = exports.filterSchemaObject.refine(exports.filterRefineFunction, exports.filterRefineMessage);
//# sourceMappingURL=ValidationSchema.js.map