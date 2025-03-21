import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import Brand from '../../../database/models/Brand.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import Deal from '../../../database/models/Deal.js';
import mongoose from 'mongoose';

import { getCurrentAdminReferencesId } from '../../../utilities/utilitis.js';
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

const getActiveBrandController = catchAsync(async (req, res) => {
    const { offset, limit, search } = filterSchema.parse(req.body);

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    const brandData = await Deal.aggregate([
        {
            $match: {
                isActive: true,
                isSlotCompleted: false,
                adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
            },
        },
        {
            $lookup: {
                from: 'deals', // Collection name in your database
                localField: 'parentDealId',
                foreignField: '_id',
                as: 'parentDealId',
            },
        },
        {
            $lookup: {
                from: 'brands',
                let: {
                    brandId: '$brand',
                    parentBrandId: {
                        $arrayElemAt: ['$parentDealId.brand', 0],
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ['$_id', '$$brandId'] }, // Match the direct brand
                                    { $eq: ['$_id', '$$parentBrandId'] }, // Match the parentDeal's brand
                                ],
                            },
                        },
                    },
                ],
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
    getAllBrandController,
    getActiveBrandController,
};
