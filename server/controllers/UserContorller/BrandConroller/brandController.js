import {
    addSchema,
    brandIdSchema,
    editSchema,
    updateStatusSchema,
} from './schema.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { errorResponse, successResponse } from '../../../utilities/Responses.js';
import Brand from '../../../database/models/Brand.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import Deal from '../../../database/models/Deal.js';
// const geBrandByIdController = catchAsync(async (req, res) => {
//     const { brandId } = brandIdSchema.parse(req.params);
//     const brandDetails = await Brand.findOne({
//         _id: brandId,
//     });
//     return res.status(200).json(
//         successResponse({
//             message: 'All Brands',
//             data: brandDetails,
//         }),
//     );
// });
const getAllBrandController = catchAsync(async (req, res) => {
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
// const addBrandController = catchAsync(async (req, res) => {
//     const body = addSchema.parse(req.body);
//     const { name, image } = body;
//     const alreadyExists = await Brand.findOne({
//         name: { $regex: new RegExp(name, 'i') },
//     }).lean();
//     if (alreadyExists) {
//         return res.status(400).json(
//             errorResponse({
//                 message: 'This Brand already exists',
//             }),
//         );
//     }
//     const newBrand = await Brand.create({
//         name,
//         image,
//     });
//     const DealCategoryRes = await newBrand.save();
//     return res.status(200).json(
//         successResponse({
//             message: 'Brand Added successfully',
//             data: DealCategoryRes,
//         }),
//     );
// });
// const editBrandController = catchAsync(async (req, res) => {
//     const body = editSchema.parse(req.body);
//     const { name, brandId, image } = body;
//     if (name) {
//         // checking unique name
//         const alreadyExists = await Brand.findOne({
//             name: { $regex: new RegExp(name, 'i') },
//         }).lean();
//         if (alreadyExists && alreadyExists._id.toString() !== brandId) {
//             return res.status(400).json(
//                 errorResponse({
//                     message: 'This Brand already exists',
//                 }),
//             );
//         }
//     }
//     const UpdatedBrand = await Brand.findByIdAndUpdate(
//         { _id: brandId },
//         { name, image },
//         { new: true },
//     );
//     if (UpdatedBrand) {
//         return res.status(200).json(
//             successResponse({
//                 message: 'updated successfully',
//                 data: UpdatedBrand,
//             }),
//         );
//     } else {
//         return res.status(404).json(
//             errorResponse({
//                 message: 'Not found any Data with this Brand id',
//             }),
//         );
//     }
// });
// const updateStatusController = catchAsync(async (req, res) => {
//     const body = updateStatusSchema.parse(req.body);
//     const { brandId, status } = body;
//     const updatedData = await Brand.findByIdAndUpdate(
//         { _id: brandId },
//         {
//             isActive: status,
//         },
//         { new: true, upsert: true },
//     );
//     if (updatedData) {
//         return res.status(200).json(
//             successResponse({
//                 message: 'updated successfully',
//                 data: updatedData,
//             }),
//         );
//     } else {
//         return res.status(404).json(
//             errorResponse({
//                 statusCode: 404,
//                 message: 'Not found any Data with this  Brand id',
//             }),
//         );
//     }
// });
const getActiveBrandController = catchAsync(async (req, res) => {
    const { offset, limit, search } = filterSchema.parse(req.body);
    const brandData = await Deal.aggregate([
        {
            $match: {
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
    return res.status(200).json(
        successResponse({
            message: 'All active Brands',
            data: brandData,
        }),
    );
});
export default {
    // addBrandController,
    // editBrandController,
    // updateStatusController,
    getAllBrandController,
    getActiveBrandController,
    // geBrandByIdController,
};
//# sourceMappingURL=brandController.js.map
