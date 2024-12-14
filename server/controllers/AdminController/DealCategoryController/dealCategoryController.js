import Deal from '../../../database/models/Deal.js';
import DealCategory from '../../../database/models/DealCategory.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    addDealCategorySchema,
    DealCategoryIdSchema,
    editDealCategorySchema,
    updateStatusChangeSchema,
} from './schema.js';

// const getAllDealCategoryController = catchAsync(async (req, res) => {
//     const AllDealCategories = await DealCategory.find({}).sort({
//         createdAt: -1,
//     });
//     return res.status(200).json(
//         successResponse({
//             message: 'All DealCategory',
//             data: AllDealCategories,
//         }),
//     );
// });
const getDealCategoryByIdController = catchAsync(async (req, res) => {
    const { dealCategoryId } = DealCategoryIdSchema.parse(req.params);
    const dealCategory = await DealCategory.findOne({
        _id: dealCategoryId,
    });
    return res.status(200).json(
        successResponse({
            message: 'DealCategory details',
            data: dealCategory,
        }),
    );
});
const addDealCategoryController = catchAsync(async (req, res) => {
    const body = addDealCategorySchema.parse(req.body);
    const { name, isExchangeDeal } = body;
    const alreadyExists = await DealCategory.findOne({
        name,
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
        isExchangeDeal,
    });
    const DealCategoryRes = await newDealCategory.save();
    return res.status(200).json(
        successResponse({
            message: 'Deal Category Added successfully',
            data: DealCategoryRes,
        }),
    );
});
const editDealCategoryController = catchAsync(async (req, res) => {
    const body = editDealCategorySchema.parse(req.body);
    const { dealCategoryId, ...restBody } = body;
    const UpdatedDealCategoryForm = await DealCategory.findByIdAndUpdate(
        { _id: dealCategoryId },
        { ...restBody },
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
});
const DealCategoryUpdateStatusController = catchAsync(async (req, res) => {
    const body = updateStatusChangeSchema.parse(req.body);
    const { dealCategoryId, status } = body;
    const UpdatedDealCategoryForm = await DealCategory.findByIdAndUpdate(
        { _id: dealCategoryId },
        {
            isActive: status,
        },
        { new: true, upsert: true },
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
                statusCode: 404,
                message: 'Not found any Data with this deal category id',
            }),
        );
    }
});
// const getActiveDealCategoriesController = catchAsync(async (req, res) => {
//     const { offset, limit } = filterSchema.parse(req.body);
//     const DealCategoriesData = Deal.aggregate([
//         {
//             $match: {
//                 isActive: true,
//                 isSlotCompleted: false,
//             },
//         },
//         {
//             $lookup: {
//                 from: 'dealcategories', // Collection name in your database
//                 localField: 'dealCategory',
//                 foreignField: '_id',
//                 as: 'dealCategoryData',
//             },
//         },
//         {
//             $unwind: '$dealCategoryData',
//         },
//         {
//             $group: {
//                 _id: '$dealCategory',
//                 dealCategoryData: { $first: '$dealCategoryData' },
//             },
//         },
//         {
//             $replaceRoot: {
//                 newRoot: '$dealCategoryData',
//             },
//         },
//         {
//             $skip: offset || 0,
//         },
//         {
//             $limit: limit || 15,
//         },
//     ]);

//     const total = Deal.find({
//         isActive: true,
//         isSlotCompleted: false,
//     }).countDocuments();

//     const data = await Promise.all([DealCategoriesData, total]);
//     return res.status(200).json(
//         successResponse({
//             message: 'All active Deal Category',
//             data: data[0],
//             total: data[1],
//         }),
//     );
// });
export default {
    addDealCategoryController,
    editDealCategoryController,
    // getAllDealCategoryController,
    // getActiveDealCategoriesController,
    getDealCategoryByIdController,
    DealCategoryUpdateStatusController,
};
//# sourceMappingURL=dealCategoryController.js.map
