import { Request, Response } from 'express';
import {
    addDealCategorySchema,
    deleteDealCategorySchema,
    editDealCategorySchema,
} from './schema';
import catchAsync from '@/utilities/catchAsync';
import { errorResponse, successResponse } from '@/utilities/Responses';
import DealCategory from '@/database/models/DealCategory';
import { filterSchema } from '@/utilities/ValidationSchema';
import Deal from '@/database/models/Deal';

const getAllDealCategoryController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const AllDealCategories = await DealCategory.find({ isDeleted: false });
        return res.status(200).json(
            successResponse({
                message: 'All DealCategory',
                data: AllDealCategories,
            }),
        );
    },
);

const getDealCategoryByIdController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { dealCategoryId } = deleteDealCategorySchema.parse(req.params);
        const dealCategory = await DealCategory.findOne({
            _id: dealCategoryId,
        });
        return res.status(200).json(
            successResponse({
                message: 'DealCategory details',
                data: dealCategory,
            }),
        );
    },
);

const addDealCategoryController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addDealCategorySchema.parse(req.body);

        const { name } = body;

        const alreadyExists = await DealCategory.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();

        if (alreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: 'This Deal Category already exists',
                }),
            );
        }

        const newDealCategory = await DealCategory.create({
            name,
        });

        const DealCategoryRes = await newDealCategory.save();

        return res.status(200).json(
            successResponse({
                message: 'Deal Category Added successfully',
                data: DealCategoryRes,
            }),
        );
    },
);

const editDealCategoryController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editDealCategorySchema.parse(req.body);

        const { name, dealCategoryId } = body;

        const UpdatedDealCategoryForm = await DealCategory.findByIdAndUpdate(
            { _id: dealCategoryId },
            { name: name },
            { new: true },
        );

        if (UpdatedDealCategoryForm) {
            return res.status(200).json(
                successResponse({
                    message: 'updated successfully',
                    data: UpdatedDealCategoryForm,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    message: 'Not found any Data with this deal category id',
                }),
            );
        }
    },
);

const deleteDealCategoryController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = deleteDealCategorySchema.parse(req.body);

        const { dealCategoryId } = body;

        const UpdatedDealCategoryForm = await DealCategory.findByIdAndUpdate(
            { _id: dealCategoryId },
            {
                isDeleted: true,
            },
            { new: true },
        );

        if (UpdatedDealCategoryForm) {
            return res.status(200).json(
                successResponse({
                    message: 'deleted successfully',
                    data: UpdatedDealCategoryForm,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    statusCode: 404,
                    message: 'Not found any Data with this deal category id',
                }),
            );
        }
    },
);

const getActiveDealCategoriesController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { offset, limit } = filterSchema.parse(req.body);

        const DealCategoriesData = await Deal.aggregate([
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

        return res.status(200).json(
            successResponse({
                message: 'All active Deal Category',
                data: DealCategoriesData,
            }),
        );
    },
);
export default {
    addDealCategoryController,
    editDealCategoryController,
    deleteDealCategoryController,
    getAllDealCategoryController,
    getActiveDealCategoriesController,
    getDealCategoryByIdController,
};
