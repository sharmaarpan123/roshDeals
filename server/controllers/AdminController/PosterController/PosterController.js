import {
    addSchema,
    deleteSchema,
    editSchema,
    statusChangeSchema,
} from './schema.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import Poster, { posterAddedByEnum } from '../../../database/models/Poster.js';
import { validatingMongoObjectIds } from '../../../utilities/validations.js';
import { POSTER_ENUM } from '../../../utilities/commonTypes.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    getAccessorId,
    isSuperAdminAccessingApi,
} from '../../../utilities/utilitis.js';

const getAllPosterController = catchAsync(async (req, res) => {
    const { offset, limit, status } = filterSchema.parse(req.body);
    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);
    const adminId = getAccessorId(req);

    const AllData = Poster.find({
        ...(status && { isActive: Boolean(+status) }),
        ...(!isSuperAdminAccessing && { adminId: adminId }),
    })
        .populate('brand')
        .populate('adminId')
        .populate({
            path: 'deal',
            populate: {
                path: 'brand dealCategory platForm',
            },
        })
        .populate('dealCategory')
        .sort({ createdAt: -1 });

    if (limit && offset) {
        AllData.skip(offset).limit(limit);
    }

    const total = Poster.find().countDocuments();
    const data = await Promise.all([AllData, total]);
    return res.status(200).json(
        successResponse({
            message: 'All Posters',
            data: data[0],
            total: data[1],
        }),
    );
});

const getPosterById = catchAsync(async (req, res) => {
    const { posterId } = deleteSchema.parse(req.params);
    const data = await Poster.findOne({ _id: posterId })
        .populate('brand')
        .populate({
            path: 'deal',
            populate: {
                path: 'brand dealCategory platForm',
            },
        })
        .populate('dealCategory');

    return res.status(200).json(
        successResponse({
            message: 'All Posters',
            data: data,
        }),
    );
});

const addPosterController = catchAsync(async (req, res) => {
    const body = addSchema.parse(req.body);
    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);
    const adminId = getAccessorId(req);
    const {
        name,
        title,
        image,
        brand,
        deal,
        dealCategory,
        posterType,
        redirectUrl,
    } = body;
    const inValidMongoIdMessage = await validatingMongoObjectIds({
        brand,
        dealCategory,
        deal,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json(
            errorResponse({
                message: inValidMongoIdMessage,
            }),
        );
    }
    const newPoster = await Poster.create({
        name,
        title,
        image,
        posterType,
        addedBy: isSuperAdminAccessing
            ? posterAddedByEnum.superAdmin
            : posterAddedByEnum.admin,
        adminId: adminId,
        ...(posterType === POSTER_ENUM.REDIRECT && { redirectUrl }),
        ...(posterType === POSTER_ENUM.DEAL && { deal }),
        ...(posterType === POSTER_ENUM.DEALCATEGORY && { dealCategory }),
        ...(posterType === POSTER_ENUM.BRAND && { brand }),
    });
    const PosterRes = await newPoster.save();
    return res.status(200).json(
        successResponse({
            message: 'Poster Added successfully',
            data: PosterRes,
        }),
    );
});
const editPosterController = catchAsync(async (req, res) => {
    const body = editSchema.parse(req.body);
    const {
        name,
        title,
        posterId,
        image,
        brand,
        deal,
        dealCategory,
        posterType,
        redirectUrl,
    } = body;
    const inValidMongoIdMessage = await validatingMongoObjectIds({
        brand,
        dealCategory,
        deal,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json(
            errorResponse({
                message: inValidMongoIdMessage,
            }),
        );
    }
    const updatedPoster = await Poster.findByIdAndUpdate(
        { _id: posterId },
        {
            name,
            title,
            image,
            ...(posterType === POSTER_ENUM.REDIRECT && {
                posterType,
                redirectUrl,
                deal: null,
                brand: null,
                dealCategory: null,
            }),
            ...(posterType === POSTER_ENUM.DEAL && {
                posterType,
                redirectUrl: null,
                deal,
                brand: null,
                dealCategory: null,
            }),
            ...(posterType === POSTER_ENUM.BRAND && {
                posterType,
                redirectUrl: null,
                deal: null,
                brand,
                dealCategory: null,
            }),
            ...(posterType === POSTER_ENUM.DEALCATEGORY && {
                posterType,
                redirectUrl: null,
                deal: null,
                brand: null,
                dealCategory,
            }),
        },
        { new: true },
    );
    if (updatedPoster) {
        return res.status(200).json(
            successResponse({
                message: 'Updated successfully',
                data: updatedPoster,
            }),
        );
    } else {
        return res.status(404).json(
            errorResponse({
                message: 'Not found any data with this Poster id',
            }),
        );
    }
});
const deletePosterController = catchAsync(async (req, res) => {
    const body = deleteSchema.parse(req.body);
    const { posterId } = body;
    const deletedData = await Poster.findOneAndDelete({ _id: posterId });
    if (deletedData) {
        return res.status(200).json(
            successResponse({
                message: 'Deleted successfully',
                data: deletedData,
            }),
        );
    } else {
        return res.status(404).json(
            errorResponse({
                statusCode: 404,
                message: 'Not found any data with this Poster id',
            }),
        );
    }
});
const statusChangeController = catchAsync(async (req, res) => {
    const body = statusChangeSchema.parse(req.body);
    const { posterId, status } = body;
    const data = await Poster.findByIdAndUpdate(
        { _id: posterId },
        {
            isActive: status,
        },
        { new: true },
    );
    if (data) {
        return res.status(200).json(
            successResponse({
                message: 'Status Updated successfully',
                data: data,
            }),
        );
    } else {
        return res.status(404).json(
            errorResponse({
                statusCode: 404,
                message: 'Not found any data with this Poster id',
            }),
        );
    }
});
export default {
    addPosterController,
    editPosterController,
    deletePosterController,
    statusChangeController,
    getAllPosterController,
    getPosterById,
};
//# sourceMappingURL=PosterController.js.map
