"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDealByBrandAndCategory = exports.SearchEnumType = void 0;
const ValidationSchema_1 = require("@/utilities/ValidationSchema");
const zod_1 = require("zod");
var SearchEnumType;
(function (SearchEnumType) {
    SearchEnumType["brand"] = "brand";
    SearchEnumType["dealCategory"] = "dealCategory";
})(SearchEnumType || (exports.SearchEnumType = SearchEnumType = {}));
exports.activeDealByBrandAndCategory = zod_1.z
    .object({
    type: zod_1.z.nativeEnum(SearchEnumType, {
        invalid_type_error: `please send valid type to search`,
        required_error: 'Type is required',
    }),
    id: zod_1.z
        .string({ required_error: 'Id is required to search' })
        .min(1, { message: 'Id is required!' }),
})
    .merge(ValidationSchema_1.filterSchemaObject)
    .refine(ValidationSchema_1.filterRefineFunction, ValidationSchema_1.filterRefineMessage);
//# sourceMappingURL=schema.js.map