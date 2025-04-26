import mongoose from 'mongoose';
import Deal from '../../database/models/Deal.js';
import Order from '../../database/models/Order.js';
import SellerDealLinker from '../../database/models/SellerDealLinker.js';
import catchAsync from '../../utilities/catchAsync.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import { MongooseObjectId } from '../../utilities/utilitis.js';
import { filterSchema } from '../../utilities/ValidationSchema.js';

class SellerController {
    getSellerDealsWithFilters = catchAsync(async (req, res) => {
        const {
            offset = 0,
            limit = 10,
            search,
            status,
            selectedCategoryFilter,
            selectedPlatformFilter,
            agencyId,
        } = req.body;

        const pipeline = [
            // Match seller's active deals
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(req.user._id),
                    isActive: true,
                },
            },
            // Lookup deal details
            {           
                $lookup: {
                    from: 'deals',
                    localField: 'dealId',
                    foreignField: '_id',
                    as: 'dealId',
                },
            },
            { $unwind: '$dealId' },

            // Apply filters on deal fields
            {
                $match: {
                    ...(agencyId && {
                        adminId: MongooseObjectId(agencyId),
                    }),
                    ...(search && {
                        'dealId.productName': { $regex: search, $options: 'i' },
                    }),
                    ...(status !== undefined && {
                        'dealId.isActive': Boolean(+status),
                    }),
                    ...(selectedCategoryFilter?.length && {
                        'dealId.dealCategory': {
                            $in: selectedCategoryFilter.map(
                                (id) => new mongoose.Types.ObjectId(id),
                            ),
                        },
                    }),
                    ...(selectedPlatformFilter?.length && {
                        'dealId.platForm': {
                            $in: selectedPlatformFilter.map(
                                (id) => new mongoose.Types.ObjectId(id),
                            ),
                        },
                    }),
                    'dealId.parentDealId': { $exists: false },
                },
            },

            // Lookup deal category details
            {
                $lookup: {
                    from: 'dealcategories',
                    localField: 'dealId.dealCategory',
                    foreignField: '_id',
                    as: 'dealId.dealCategory',
                },
            },
            {
                $unwind: {
                    path: '$dealId.dealCategory',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Lookup platform details
            {
                $lookup: {
                    from: 'platforms',
                    localField: 'dealId.platForm',
                    foreignField: '_id',
                    as: 'dealId.platForm',
                },
            },
            {
                $unwind: {
                    path: '$dealId.platForm',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'dealId.brand',
                    foreignField: '_id',
                    as: 'dealId.brand',
                },
            },
            {
                $unwind: {
                    path: '$dealId.brand',
                    preserveNullAndEmptyArrays: true,
                },
            },

            { $sort: { 'dealId.createdAt': -1 } },
        ];

        // Get total count
        const countPipeline = [...pipeline, { $count: 'total' }];

        pipeline.push({ $skip: parseInt(offset) });
        pipeline.push({ $limit: parseInt(limit) });

        const totalResult = await SellerDealLinker.aggregate(countPipeline);
        const total = totalResult[0]?.total || 0;

        // Get paginated results
        const deals = await SellerDealLinker.aggregate(pipeline);

        return res.status(200).json(
            successResponse({
                message: 'Seller deals fetched successfully',
                data: deals.map((item) => ({
                    ...item.dealId,
                    ...item,
                })),

                others: {
                    total,
                },
            }),
        );
    });

    getSellerOrdersByDealId = catchAsync(async (req, res) => {
        const {
            dealId,
            offset = 0,
            limit = 10,
            orderFormStatus,
            selectedPlatformFilter,
            startDate,
            endDate,
        } = req.body;

        if (!dealId) {
            return res.status(400).json(
                errorResponse({
                    message: 'Deal ID is required',
                }),
            );
        }

        // First verify if the seller has access to this deal
        const sellerDealLink = await SellerDealLinker.findOne({
            sellerId: req.user._id,
            dealId: new mongoose.Types.ObjectId(dealId),
            isActive: true,
        });

        if (!sellerDealLink) {
            return res.status(403).json(
                errorResponse({
                    message: 'You do not have access to this deal',
                }),
            );
        }

        const clonedDealIds = await Deal.find(
            {
                parentDealId: dealId,
            },
            { _id: 1 },
        );

        const aggregateArr = [
            {
                $match: {
                    dealId: {
                        $in: [
                            MongooseObjectId(dealId),
                            ...clonedDealIds.map((item) => item?._id),
                        ],
                    },
                    ...(startDate && {
                        orderDate: {
                            $gte: new Date(startDate),
                            $lt: new Date(
                                new Date(endDate).setDate(
                                    new Date(endDate).getDate() + 1,
                                ),
                            ),
                        },
                    }),
                    ...(orderFormStatus && { orderFormStatus }),
                },
            },
            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealId',
                    foreignField: '_id',
                    as: 'dealId',
                },
            },
            { $unwind: { path: '$dealId', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'brands',
                    localField: 'dealId.brand',
                    foreignField: '_id',
                    as: 'dealId.brand',
                },
            },
            {
                $unwind: {
                    path: '$dealId.brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'dealcategories',
                    localField: 'dealId.dealCategory',
                    foreignField: '_id',
                    as: 'dealId.dealCategory',
                },
            },
            {
                $unwind: {
                    path: '$dealId.dealCategory',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'platforms',
                    localField: 'dealId.platForm',
                    foreignField: '_id',
                    as: 'dealId.platForm',
                },
            },
            {
                $unwind: {
                    path: '$dealId.platForm',
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $lookup: {
                    from: 'deals',
                    localField: 'dealId.parentDealId',
                    foreignField: '_id',
                    as: 'dealId.parentDealId',
                },
            },
            {
                $unwind: {
                    path: '$dealId.parentDealId',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // parent deal populate
            {
                $lookup: {
                    from: 'dealcategories',
                    localField: 'dealId.parentDealId.dealCategory',
                    foreignField: '_id',
                    as: 'dealId.parentDealId.dealCategory',
                },
            },
            {
                $unwind: {
                    path: '$dealId.parentDealId.dealCategory',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'platforms',
                    localField: 'dealId.parentDealId.platForm',
                    foreignField: '_id',
                    as: 'dealId.parentDealId.platForm',
                },
            },
            {
                $unwind: {
                    path: '$dealId.parentDealId.platForm',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'dealId.parentDealId.brand',
                    foreignField: '_id',
                    as: 'dealId.parentDealId.brand',
                },
            },
            {
                $unwind: {
                    path: '$dealId.parentDealId.brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    ...(selectedPlatformFilter?.length && {
                        $or: [
                            {
                                'dealId.platForm._id': {
                                    $in:
                                        selectedPlatformFilter?.map(
                                            (i) =>
                                                new mongoose.Types.ObjectId(i),
                                        ) || [],
                                },
                            },
                            {
                                'dealId.parentDealId.platForm._id': {
                                    $in:
                                        selectedPlatformFilter?.map(
                                            (i) =>
                                                new mongoose.Types.ObjectId(i),
                                        ) || [],
                                },
                            },
                        ],
                    }),
                },
            },
            { $sort: { createdAt: -1 } },
        ];

        if (limit || offset) {
            aggregateArr.push({ $skip: parseInt(offset) });
            aggregateArr.push({ $limit: parseInt(limit) });
        }

        const orders = Order.aggregate(aggregateArr);

        if (limit || offset) {
            aggregateArr.pop();
            aggregateArr.pop();
        }

        aggregateArr.push({ $count: 'total' });

        const totalCount = Order.aggregate(aggregateArr);

        const data = await Promise.all([orders, totalCount]);

        return res.status(200).json(
            successResponse({
                message: 'Orders fetched successfully',
                data: data[0],
                others: {
                    total: data[1].length > 0 ? data[1][0].total : 0,
                },
            }),
        );
    });

    getSellerAgenciesWithFilters = catchAsync(async (req, res) => {
        const { offset = 0, limit = 10, search } = filterSchema.parse(req.body);

        const pipeline = [
            {
                $match: {
                    isActive: true,
                    sellerId: MongooseObjectId(req?.user?._id),
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'adminId',
                    foreignField: '_id',
                    as: 'adminInfo',
                },
            },
            { $unwind: '$adminInfo' },
            {
                $match: {
                    ...(search && {
                        'adminInfo.name': { $regex: search, $options: 'i' },
                    }),
                },
            },
            {
                $group: {
                    _id: '$adminInfo._id',
                    admin: { $first: '$adminInfo' },
                },
            },
            {
                $replaceRoot: {
                    newRoot: '$admin',
                },
            },
        ];

        // Get total count
        const countPipeline = [
            ...pipeline, // Take only the filtering stages
            { $count: 'total' },
        ];

        pipeline.push({ $skip: parseInt(offset) });
        pipeline.push({ $limit: parseInt(limit) });

        const totalResult = await SellerDealLinker.aggregate(countPipeline);
        const total = totalResult[0]?.total || 0;

        // Get paginated results
        const agencies = await SellerDealLinker.aggregate(pipeline);

        return res.status(200).json(
            successResponse({
                message: 'Seller deals fetched successfully',
                data: agencies,
                others: {
                    total,
                },
            }),
        );
    });
}

export default new SellerController();
