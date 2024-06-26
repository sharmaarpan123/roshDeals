"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const schema_1 = require("./schema");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const Responses_1 = require("@/utilities/Responses");
const DealCategory_1 = __importDefault(require("@/database/models/DealCategory"));
const ValidationSchema_1 = require("@/utilities/ValidationSchema");
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const getAllDealCategoryController = (0, catchAsync_1.default)(async (req, res) => {
    const AllDealCategories = await DealCategory_1.default.find({ isDeleted: false });
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All DealCategory',
        data: AllDealCategories,
    }));
});
const addDealCategoryController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addDealCategorySchema.parse(req.body);
    const { name } = body;
    const alreadyExists = await DealCategory_1.default.findOne({
        name: { $regex: new RegExp(name, 'i') },
    }).lean();
    if (alreadyExists) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This Deal Category already exists',
        }));
    }
    const newDealCategory = await DealCategory_1.default.create({
        name,
    });
    const DealCategoryRes = await newDealCategory.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Deal Category Added successfully',
        data: DealCategoryRes,
    }));
});
const editDealCategoryController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editDealCategorySchema.parse(req.body);
    const { name, dealCategoryId } = body;
    const UpdatedDealCategoryForm = await DealCategory_1.default.findByIdAndUpdate({ _id: dealCategoryId }, { name: name }, { new: true });
    if (UpdatedDealCategoryForm) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'updated successfully',
            data: UpdatedDealCategoryForm,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Not found any Data with this deal category id',
        }));
    }
});
const deleteDealCategoryController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.deleteDealCategorySchema.parse(req.body);
    const { dealCategoryId } = body;
    const UpdatedDealCategoryForm = await DealCategory_1.default.findByIdAndUpdate({ _id: dealCategoryId }, {
        isDeleted: true,
    }, { new: true });
    if (UpdatedDealCategoryForm) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'deleted successfully',
            data: UpdatedDealCategoryForm,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            statusCode: 404,
            message: 'Not found any Data with this deal category id',
        }));
    }
});
const getActiveDealCategoriesController = (0, catchAsync_1.default)(async (req, res) => {
    const { offset, limit } = ValidationSchema_1.filterSchema.parse(req.body);
    const DealCategoriesData = await Deal_1.default.aggregate([
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
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ]);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All active Deal Category',
        data: DealCategoriesData,
    }));
});
module.exports = {
    addDealCategoryController,
    editDealCategoryController,
    deleteDealCategoryController,
    getAllDealCategoryController,
    getActiveDealCategoriesController,
};
//# sourceMappingURL=dealCategoryController.js.map