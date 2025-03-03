import mongoose from 'mongoose';
import Deal from '../../../database/models/Deal.js';
import DealCategory from '../../../database/models/DealCategory.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import { getCurrentAdminReferencesId } from '../../../utilities/utilitis.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

const getAllDealCategoryController = catchAsync(async (req, res) => {
    const AllDealCategories = await DealCategory.find({}).sort({
        createdAt: -1,
    });
    return res.status(200).json(
        successResponse({
            message: 'All DealCategory',
            data: AllDealCategories,
        }),
    );
});
const getActiveDealCategoriesController = catchAsync(async (req, res) => {
    const { offset, limit } = filterSchema.parse(req.body);

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    let pipeLine = [
        {
            $match: {
                isActive: true,
                isSlotCompleted: false,
                adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
            },
        },
        {
            $lookup: {
                from: 'deals', // Self-reference the 'deals' collection to handle parentDealId
                localField: 'parentDealId',
                foreignField: '_id',
                as: 'parentDeal',
            },
        },
        {
            $lookup: {
                from: 'dealcategories',
                let: {
                    dealCategoryId: '$dealCategory',
                    parentDealCategoryId: {
                        $arrayElemAt: ['$parentDeal.dealCategory', 0],
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ['$_id', '$$dealCategoryId'] }, // Match the direct brand
                                    { $eq: ['$_id', '$$parentDealCategoryId'] }, // Match the parentDeal's brand
                                ],
                            },
                        },
                    },
                ],
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
    ];

    pipeLine = [
        ...pipeLine,
        {
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ];
    const DealCategoriesData = Deal.aggregate(pipeLine);

    const data = await Promise.all([DealCategoriesData]);
    return res.status(200).json(
        successResponse({
            message: 'All active Deal Category',
            data: data[0],
        }),
    );
});
export default {
    getAllDealCategoryController,
    getActiveDealCategoriesController,
};
