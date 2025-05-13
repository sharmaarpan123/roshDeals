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
    const { name, isExchangeDeal, image } = body;
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
        image,
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
                message: 'Updated successfully.',
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
                message: 'Updated successfully.',
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
const getAllDealCategoryWithFilters = catchAsync(async (req, res) => {
    const { limit, offset, search, status } = filterSchema.parse(req.query);

    const AllDealCategories = DealCategory.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: Boolean(+status) }),
    }).sort({
        createdAt: -1,
    });

    if (offset || offset === 0) {
        AllDealCategories.skip(offset || 0).limit(limit || 10);
    }

    const total = DealCategory.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: Boolean(+status) }),
    }).countDocuments();

    const data = await Promise.all([AllDealCategories, total]);

    return res.status(200).json(
        successResponse({
            message: 'All DealCategory',
            data: data[0],
            total: data[1],
        }),
    );
});

export default {
    addDealCategoryController,
    editDealCategoryController,
    getDealCategoryByIdController,
    DealCategoryUpdateStatusController,
    getAllDealCategoryWithFilters,
};
//# sourceMappingURL=dealCategoryController.js.map
