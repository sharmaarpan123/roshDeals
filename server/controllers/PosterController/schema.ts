import { POSTER_ENUM } from '@/utilities/commonTypes';
import { z } from 'zod';

const addSchema = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .trim()
            .min(1, { message: 'name should have at least one character' }),
        title: z
            .string({
                required_error: 'title is required',
            })
            .trim()
            .min(1, { message: 'title should have at least one character' }),
        image: z
            .string()
            .trim()
            .min(1, { message: 'image url should have at least one character' })
            .optional(),
        posterType: z.nativeEnum(POSTER_ENUM, {
            required_error: 'Poster type is required',
            invalid_type_error: 'inValid Poster Type',
        }),
        brand: z.string().optional(),
        dealCategory: z.string().trim().optional(),
        deal: z.string().trim().optional(),
        redirectUrl: z.string().trim().optional(),
    })
    .refine(
        (data) => {
            if (
                data.posterType === POSTER_ENUM.REDIRECT &&
                !data?.redirectUrl
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'please send redirect url',
        },
    )
    .refine(
        (data) => {
            if (data.posterType === POSTER_ENUM.DEAL && !data?.deal) {
                return false;
            }
            return true;
        },
        {
            message: 'please send Deal Id',
        },
    )
    .refine(
        (data) => {
            if (
                data.posterType === POSTER_ENUM.DEALCATEGORY &&
                !data?.dealCategory
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'please send  Deal Category Id',
        },
    )
    .refine(
        (data) => {
            if (data.posterType === POSTER_ENUM.BRAND && !data?.brand) {
                return false;
            }
            return true;
        },
        {
            message: 'please send Brand Id',
        },
    );

const deleteSchema = z.object({
    posterId: z.string({ required_error: 'brand Id is  required' }).trim(),
});

const editSchema = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .trim()
            .min(1, { message: 'name should have at least one character' })
            .optional(),
        image: z
            .string()
            .trim()
            .min(1, { message: 'image url should have at least one character' })
            .optional(),
        title: z
            .string({
                required_error: 'title is required',
            })
            .trim()
            .min(1, { message: 'title should have at least one character' })
            .optional(),
        posterType: z
            .nativeEnum(POSTER_ENUM, {
                required_error: 'Poster type is required',
                invalid_type_error: 'inValid Poster Type',
            })
            .optional(),
        brand: z.string().optional(),
        dealCategory: z.string().trim().optional(),
        deal: z.string().trim().optional(),
        redirectUrl: z.string().trim().optional(),
    })
    .merge(deleteSchema)
    .refine(
        (data) => {
            if (
                data.posterType &&
                !data.brand &&
                !data.deal &&
                !data.dealCategory &&
                !data.redirectUrl
            ) {
                return false;
            }
            return true;
        },
        {
            message:
                "make sure to send the field according to posterType else  don't send the posterType",
        },
    )
    .refine(
        (data) => {
            if (
                data.posterType === POSTER_ENUM.REDIRECT &&
                !data?.redirectUrl
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'please send redirect url',
        },
    )
    .refine(
        (data) => {
            if (data.posterType === POSTER_ENUM.DEAL && !data?.deal) {
                return false;
            }
            return true;
        },
        {
            message: 'please send Deal Id',
        },
    )
    .refine(
        (data) => {
            if (
                data.posterType === POSTER_ENUM.DEALCATEGORY &&
                !data?.dealCategory
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'please send  Deal Category Id',
        },
    )
    .refine(
        (data) => {
            if (data.posterType === POSTER_ENUM.BRAND && !data?.brand) {
                return false;
            }
            return true;
        },
        {
            message: 'please send Brand Id',
        },
    );

const statusChangeSchema = z
    .object({
        status: z.boolean({ required_error: 'Status is required' }),
    })
    .merge(deleteSchema);

export { addSchema, editSchema, deleteSchema, statusChangeSchema };
