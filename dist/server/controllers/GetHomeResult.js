"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const Poster_1 = __importDefault(require("@/database/models/Poster"));
const Responses_1 = require("@/utilities/Responses");
const ValidationSchema_1 = require("@/utilities/ValidationSchema");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const zod_1 = require("zod");
const schema = zod_1.z.object({
    dealsFilter: ValidationSchema_1.filterSchema.optional(),
    brandFilter: ValidationSchema_1.filterSchema.optional(),
    dealCategoryFilter: ValidationSchema_1.filterSchema.optional(),
});
exports.default = (0, catchAsync_1.default)(async (req, res) => {
    const { dealsFilter, brandFilter, dealCategoryFilter } = schema.parse(req.body);
    const activelyDeals = Deal_1.default.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .skip(dealsFilter?.offset || 0)
        .limit(dealsFilter?.limit || 10);
    const brandData = Deal_1.default.aggregate([
        {
            $match: {
                isDeleted: false,
                isActive: true,
                isSlotCompleted: false,
            },
        },
        {
            $lookup: {
                from: 'brands', // Collection name in your database
                localField: 'brand',
                foreignField: '_id',
                as: 'brandData',
            },
        },
        {
            $unwind: '$brandData',
        },
        {
            $group: {
                _id: '$brandData._id', // Group by the unique identifier of the brand document
                brandData: { $first: '$brandData' }, // Keep the first document in each group
            },
        },
        {
            $replaceRoot: {
                newRoot: '$brandData',
            },
        },
        {
            $skip: brandFilter?.offset || 0,
        },
        {
            $limit: brandFilter?.limit || 10,
        },
    ]);
    const DealCategoriesData = Deal_1.default.aggregate([
        {
            $match: {
                isDeleted: false,
                isActive: true,
                isSlotCompleted: false,
            },
        },
        {
            $lookup: {
                from: 'dealcategories', // Collection name in your database
                localField: 'dealCategory',
                foreignField: '_id',
                as: 'dealCategoryData',
            },
        },
        {
            $unwind: '$dealCategoryData',
        },
        {
            $group: {
                _id: '$dealCategoryData._id', // Group by the unique identifier of the brand document
                dealCategoryData: { $first: '$dealCategoryData' }, // Keep the first document in each group
            },
        },
        {
            $replaceRoot: {
                newRoot: '$dealCategoryData',
            },
        },
        {
            $skip: dealCategoryFilter?.offset || 0,
        },
        {
            $limit: dealCategoryFilter?.limit || 10,
        },
    ]);
    const PosterData = Poster_1.default.find({
        isDeleted: false,
        isActive: true,
    })
        .populate('brand')
        .populate('dealCategory')
        .populate({
        path: 'deal',
        populate: {
            path: 'brand dealCategory platForm',
        },
    });
    const homeData = await Promise.all([
        activelyDeals,
        brandData,
        DealCategoriesData,
        PosterData,
    ]);
    if (homeData?.length) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'Home Data Fetched',
            data: {
                activelyDeals: homeData[0],
                brandData: homeData[1],
                dealCategoryData: homeData[2],
                Poster: homeData[3],
            },
        }));
    }
});
//# sourceMappingURL=GetHomeResult.js.map