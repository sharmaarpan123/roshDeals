"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const schema_1 = require("./schema");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const Responses_1 = require("@/utilities/Responses");
const Poster_1 = __importDefault(require("@/database/models/Poster"));
const validations_1 = require("@/utilities/validations");
const commonTypes_1 = require("@/utilities/commonTypes");
const getAllPosterController = (0, catchAsync_1.default)(async (req, res) => {
    const AllData = Poster_1.default.find()
        .populate('brand')
        .populate({
        path: 'deal',
        populate: {
            path: 'brand dealCategory platForm',
        },
    })
        .populate('dealCategory');
    const total = Poster_1.default.find().countDocuments();
    const data = await Promise.all([AllData, total]);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All Posters',
        data: data[0],
        total: data[1],
    }));
});
const addPosterController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addSchema.parse(req.body);
    const { name, title, image, brand, deal, dealCategory, posterType, redirectUrl, } = body;
    const inValidMongoIdMessage = await (0, validations_1.validatingMongoObjectIds)({
        brand,
        dealCategory,
        deal,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: inValidMongoIdMessage,
        }));
    }
    const newPoster = await Poster_1.default.create({
        name,
        title,
        image,
        posterType,
        ...(posterType === commonTypes_1.POSTER_ENUM.REDIRECT && { redirectUrl }),
        ...(posterType === commonTypes_1.POSTER_ENUM.DEAL && { deal }),
        ...(posterType === commonTypes_1.POSTER_ENUM.DEALCATEGORY && { dealCategory }),
        ...(posterType === commonTypes_1.POSTER_ENUM.BRAND && { brand }),
    });
    const PosterRes = await newPoster.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Poster Added successfully',
        data: PosterRes,
    }));
});
const editPosterController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editSchema.parse(req.body);
    const { name, title, posterId, image, brand, deal, dealCategory, posterType, redirectUrl, } = body;
    const inValidMongoIdMessage = await (0, validations_1.validatingMongoObjectIds)({
        brand,
        dealCategory,
        deal,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: inValidMongoIdMessage,
        }));
    }
    const updatedPoster = await Poster_1.default.findByIdAndUpdate({ _id: posterId }, {
        name,
        title,
        image,
        ...(posterType === commonTypes_1.POSTER_ENUM.REDIRECT && {
            posterType,
            redirectUrl,
            deal: null,
            brand: null,
            dealCategory: null,
        }),
        ...(posterType === commonTypes_1.POSTER_ENUM.DEAL && {
            posterType,
            redirectUrl: null,
            deal,
            brand: null,
            dealCategory: null,
        }),
        ...(posterType === commonTypes_1.POSTER_ENUM.BRAND && {
            posterType,
            redirectUrl: null,
            deal: null,
            brand,
            dealCategory: null,
        }),
        ...(posterType === commonTypes_1.POSTER_ENUM.DEALCATEGORY && {
            posterType,
            redirectUrl: null,
            deal: null,
            brand: null,
            dealCategory,
        }),
    }, { new: true });
    if (updatedPoster) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'Updated successfully',
            data: updatedPoster,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Not found any data with this Poster id',
        }));
    }
});
const deletePosterController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.deleteSchema.parse(req.body);
    const { posterId } = body;
    const deletedData = await Poster_1.default.findByIdAndUpdate({ _id: posterId }, {
        isDeleted: true,
    }, { new: true });
    if (deletedData) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'Deleted successfully',
            data: deletedData,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            statusCode: 404,
            message: 'Not found any data with this Poster id',
        }));
    }
});
const statusChangeController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.statusChangeSchema.parse(req.body);
    const { posterId, status } = body;
    const data = await Poster_1.default.findByIdAndUpdate({ _id: posterId }, {
        isActive: status,
    }, { new: true });
    if (data) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'Status Updated successfully',
            data: data,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            statusCode: 404,
            message: 'Not found any data with this Poster id',
        }));
    }
});
module.exports = {
    addPosterController,
    editPosterController,
    deletePosterController,
    statusChangeController,
    getAllPosterController,
};
//# sourceMappingURL=PosterController.js.map