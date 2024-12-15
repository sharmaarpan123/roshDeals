import Deal from '../../../database/models/Deal.js';
import DealCategory from '../../../database/models/DealCategory.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    successResponse,
} from '../../../utilities/Responses.js';
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
    const DealCategoriesData = Deal.aggregate([
        {
            $match: {
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
                _id: '$dealCategory',
                dealCategoryData: { $first: '$dealCategoryData' },
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
            $limit: limit || 15,
        },
    ]);

    const total = Deal.find({
        isActive: true,
        isSlotCompleted: false,
    }).countDocuments();

    const data = await Promise.all([DealCategoriesData, total]);
    return res.status(200).json(
        successResponse({
            message: 'All active Deal Category',
            data: data[0],
            total: data[1],
        }),
    );
});
export default {

    getAllDealCategoryController,
    getActiveDealCategoriesController,

};

