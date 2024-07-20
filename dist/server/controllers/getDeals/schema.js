import { filterRefineFunction, filterRefineMessage, filterSchemaObject, } from '../../utilities/ValidationSchema.js';
import { z } from 'zod';
export var SearchEnumType;
(function (SearchEnumType) {
    SearchEnumType["brand"] = "brand";
    SearchEnumType["dealCategory"] = "dealCategory";
})(SearchEnumType || (SearchEnumType = {}));
export const activeDealByBrandAndCategory = z
    .object({
    type: z.nativeEnum(SearchEnumType, {
        invalid_type_error: `please send valid type to search`,
        required_error: 'Type is required',
    }),
    id: z
        .string({ required_error: 'Id is required to search' })
        .min(1, { message: 'Id is required!' }),
})
    .merge(filterSchemaObject)
    .refine(filterRefineFunction, filterRefineMessage);
//# sourceMappingURL=schema.js.map