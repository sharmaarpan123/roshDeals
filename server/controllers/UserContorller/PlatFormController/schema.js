// import { isUrlValid } from '../../../utilities/utilitis.js';
// import { z } from 'zod';
// const addPlatFormSchema = z.object({
//     name: z
//         .string({
//             required_error: 'Name is required',
//         })
//         .trim()
//         .min(1, { message: 'name should have at least one character' }),
//     image: z
//         .string()
//         .trim()
//         .refine((data) => isUrlValid(data), {
//             message: 'image url is invalid',
//         })
//         .optional(),
// });
// const platFormIdSchema = z.object({
//     platFormId: z.string({ required_error: 'PlatFormId is  required' }).trim(),
// });
// const editPlatFormSchema = z
//     .object({
//         name: z
//             .string({
//                 required_error: 'Name is required',
//             })
//             .trim()
//             .min(1, { message: 'name should have at least one character' })
//             .optional(),
//         image: z
//             .string()
//             .trim()
//             .refine((data) => isUrlValid(data), {
//                 message: 'image url is invalid',
//             })
//             .optional(),
//     })
//     .merge(platFormIdSchema);

// const updateStatusChangeSchema = z
//     .object({
//         status: z.boolean({ invalid_type_error: 'in valid status' }),
//     })
//     .merge(platFormIdSchema);

// export {
//     addPlatFormSchema,
//     editPlatFormSchema,
//     platFormIdSchema,
//     updateStatusChangeSchema,
// };
