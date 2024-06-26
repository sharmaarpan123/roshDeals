"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const schema_1 = require("./schema");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const Responses_1 = require("@/utilities/Responses");
const Brand_1 = __importDefault(require("@/database/models/Brand"));
const ValidationSchema_1 = require("@/utilities/ValidationSchema");
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const getAllBrandController = (0, catchAsync_1.default)(async (req, res) => {
    const { offset, limit, search } = ValidationSchema_1.filterSchema.parse(req.body);
    const AllDAta = Brand_1.default.find({
        isDeleted: false,
        ...(search && { name: { $regex: search, $options: 'i' } }),
    })
        .skip(offset || 0)
        .limit(limit || 20);
    const total = Brand_1.default.find({
        isDeleted: false,
        ...(search && { name: { $regex: search, $options: 'i' } }),
    }).countDocuments();
    const data = await Promise.all([AllDAta, total]);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All Brands',
        data: data[0],
        total: data[1],
    }));
});
const addBrandController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addSchema.parse(req.body);
    const { name, image } = body;
    const alreadyExists = await Brand_1.default.findOne({
        name: { $regex: new RegExp(name, 'i') },
    }).lean();
    if (alreadyExists) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'This Brand already exists',
        }));
    }
    const newBrand = await Brand_1.default.create({
        name,
        image,
    });
    const DealCategoryRes = await newBrand.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Brand Added successfully',
        data: DealCategoryRes,
    }));
});
const editBrandController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editSchema.parse(req.body);
    const { name, brandId, image } = body;
    if (name) {
        // checking unique name
        const alreadyExists = await Brand_1.default.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();
        if (alreadyExists && alreadyExists._id.toString() !== brandId) {
            return res.status(400).json((0, Responses_1.errorResponse)({
                message: 'This Brand already exists',
            }));
        }
    }
    const UpdatedBrand = await Brand_1.default.findByIdAndUpdate({ _id: brandId }, { name, image }, { new: true });
    if (UpdatedBrand) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'updated successfully',
            data: UpdatedBrand,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Not found any Data with this Brand id',
        }));
    }
});
const deleteBrandController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.deleteSchema.parse(req.body);
    const { brandId } = body;
    const deletedData = await Brand_1.default.findByIdAndUpdate({ _id: brandId }, {
        isDeleted: true,
    }, { new: true });
    if (deletedData) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'deleted successfully',
            data: deletedData,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            statusCode: 404,
            message: 'Not found any Data with this  Brand id',
        }));
    }
});
const getActiveBrandController = (0, catchAsync_1.default)(async (req, res) => {
    const { offset, limit, search } = ValidationSchema_1.filterSchema.parse(req.body);
    const brandData = await Deal_1.default.aggregate([
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
            $match: {
                'brandData.name': { $regex: search || '', $options: 'i' },
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
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ]);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'All active Brands',
        data: brandData,
    }));
});
module.exports = {
    addBrandController,
    editBrandController,
    deleteBrandController,
    getAllBrandController,
    getActiveBrandController,
};
//# sourceMappingURL=brandController.js.map