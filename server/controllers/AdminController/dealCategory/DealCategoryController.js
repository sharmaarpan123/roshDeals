import DealCategory from '../../../database/models/DealCategory.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

class DealCategoryController {
    getAllDealCategoryWithFilters = catchAsync(async (req, res) => {
        const { limit, offset, search, status } = filterSchema.parse(req.query);

        const AllDealCategories = DealCategory.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
            ...(status && { isActive: Boolean(+status) }),
        })
            .sort({
                createdAt: -1,
            })
            .skip(offset || 0)
            .limit(limit || 10);

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
}

const AdminDealCategoryController = new DealCategoryController();

export default AdminDealCategoryController;
