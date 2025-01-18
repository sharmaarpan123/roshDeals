import Deal from '../../../database/models/Deal.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { getDeal } from './schema.js';

import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    getCurrentAdminReferencesId,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';

export const dealDetails = catchAsync(async (req, res) => {
    const body = getDeal.parse(req.params);
    const { dealId } = body;
    const DealRes = await Deal.findOne({ _id: dealId })
        .populate('dealCategory')
        .populate('platForm')
        .populate('brand')
        .populate({
            path: 'parentDealId',
            populate: {
                path: 'brand dealCategory platForm',
            },
        });
    if (!DealRes) {
        return res.status(400).json(
            errorResponse({
                message: 'No Data Found',
            }),
        );
    }
    return res.status(200).json(
        successResponse({
            message: 'Deal Fetched',
            data: DealRes,
        }),
    );
});
export const activeDealsController = catchAsync(async (req, res) => {
    const { limit, offset, search } = filterSchema.parse(req.body);
    // const activelyDeals = Deal.find({
    //     isActive: true,
    //     isSlotCompleted: false,
    //     ...(search && { productName: { $regex: search, $options: 'i' } }),
    // })
    //     .populate('brand')
    //     .populate('dealCategory')
    //     .populate('platForm')
    //     .sort({ createdAt: -1 })
    //     .skip(offset || 0)
    //     .limit(limit || 20);

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    let pipeLine = [
        {
            $match: {
                isActive: true,
                isSlotCompleted: false,
                adminId: MongooseObjectId(adminCurrentRecreance),
            },
        },
        {
            $lookup: {
                from: 'deals',
                foreignField: '_id',
                localField: 'parentDealId',
                as: 'parentDealId',
            },
        },

        {
            $match: {
                ...(search && {
                    $or: [
                        {
                            'parentDealId.productName': {
                                $regex: search,
                                $options: 'i',
                            },
                        },
                        {
                            productName: {
                                $regex: search,
                                $options: 'i',
                            },
                        },
                    ],
                }),
            },
        },

        {
            $unwind: {
                path: '$parentDealId',
                preserveNullAndEmptyArrays: true,
            },
        },

        // parent deal populate
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'parentDealId.dealCategory',
                foreignField: '_id',
                as: 'parentDealId.dealCategory',
            },
        },
        {
            $unwind: {
                path: '$parentDealId.dealCategory',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'platforms',
                localField: 'parentDealId.platForm',
                foreignField: '_id',
                as: 'parentDealId.platForm',
            },
        },
        {
            $unwind: {
                path: '$parentDealId.platForm',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'parentDealId.brand',
                foreignField: '_id',
                as: 'parentDealId.brand',
            },
        },
        {
            $unwind: {
                path: '$parentDealId.brand',
                preserveNullAndEmptyArrays: true,
            },
        },

        // root level  deal populate
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealCategory',
                foreignField: '_id',
                as: 'dealCategory',
            },
        },
        {
            $unwind: {
                path: '$dealCategory',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'platforms',
                localField: 'platForm',
                foreignField: '_id',
                as: 'platForm',
            },
        },
        {
            $unwind: {
                path: '$platForm',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand',
            },
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ];

    const activelyDeals = await Deal.aggregate(pipeLine);

    if (activelyDeals) {
        return res.status(200).json(
            successResponse({
                message: 'Deals Fetched',
                data: activelyDeals,
            }),
        );
    }
});
