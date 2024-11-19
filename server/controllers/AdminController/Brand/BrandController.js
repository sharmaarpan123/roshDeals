import Brand from '../../../database/models/Brand.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

class brandController {
    getAllBrandWithCFilters = catchAsync(async (req, res) => {
        const { offset, limit, search, status } = filterSchema.parse(req.body);

        let AllDAta = Brand.find({
            ...(status && { isActive: Boolean(+status) }),
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).sort({ createdAt: -1 });

        if (typeof offset !== 'undefined') {
            AllDAta = AllDAta.skip(offset);
        }

        if (typeof limit !== 'undefined') {
            AllDAta = AllDAta.limit(limit);
        }

        const total = Brand.find({
            ...(status && { isActive: Boolean(+status) }),
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).countDocuments();
        const data = await Promise.all([AllDAta, total]);
        return res.status(200).json(
            successResponse({
                message: 'All Brands',
                data: data[0],
                total: data[1],
            }),
        );
    });
}

const adminBrandController = new brandController();

export default adminBrandController;
