import catchAsync from '../../../utilities/catchAsync.js';
import { SearchEnumType, activeDealByBrandAndCategory } from './schema.js';
import Deal from '../../../database/models/Deal.js';
import { successResponse } from '../../../utilities/Responses.js';
import mongoose from 'mongoose';
import Brand from '../../../database/models/Brand.js';
import DealCategory from '../../../database/models/DealCategory.js';
import PlatForm from '../../../database/models/PlatForm.js';
import {
    getCurrentAdminReferencesId,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';
export default catchAsync(async (req, res) => {
    const body = activeDealByBrandAndCategory.parse(req.body);

    const {
        type,
        id,
        offset,
        limit,
        selectedCategoryFilter,
        selectedPlatformFilter,
        selectedBrandFilter,
    } = body;

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    const filter = {
        isActive: true,
        isSlotCompleted: false,
        adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
        ...(type === SearchEnumType.brand && {
            $or: [{ brand: id }, { 'parentDealId.brand': id }],
        }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
        ...(type === SearchEnumType.platForm && { platForm: id }),
        ...(selectedCategoryFilter?.length && {
            dealCategory: { $in: selectedCategoryFilter },
        }),
        ...(selectedPlatformFilter?.length && {
            platForm: { $in: selectedPlatformFilter },
        }),
        ...(selectedBrandFilter?.length && {
            brand: { $in: selectedBrandFilter },
        }),
    };

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
            $match: {
                ...(type === SearchEnumType.brand && {
                    $or: [
                        { 'brand._id': MongooseObjectId(id) },
                        { 'parentDealId.brand._id': MongooseObjectId(id) },
                    ],
                }),
                ...(type === SearchEnumType.dealCategory && {
                    $or: [
                        { 'dealCategory._id': MongooseObjectId(id) },
                        {
                            'parentDealId.dealCategory._id':
                                MongooseObjectId(id),
                        },
                    ],
                }),
                ...(type === SearchEnumType.platForm && {
                    $or: [
                        { 'platForm._id': MongooseObjectId(id) },
                        { 'parentDealId.platForm._id': MongooseObjectId(id) },
                    ],
                }),
                ...(selectedCategoryFilter?.length && {
                    $or: [
                        {
                            'dealCategory._id': {
                                $in: [
                                    selectedCategoryFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                        {
                            'parentDealId.dealCategory._id': {
                                $in: [
                                    selectedCategoryFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                    ],
                }),
                ...(selectedPlatformFilter?.length && {
                    $or: [
                        {
                            'platForm._id': {
                                $in: [
                                    selectedPlatformFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                        {
                            'parentDealId.platForm._id': {
                                $in: [
                                    selectedPlatformFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                    ],
                }),
                ...(selectedBrandFilter?.length && {
                    $or: [
                        {
                            'brand._id': {
                                $in: [
                                    selectedBrandFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                        {
                            'parentDealId.brand._id': {
                                $in: [
                                    selectedBrandFilter?.map((i) =>
                                        MongooseObjectId(i),
                                    ),
                                ],
                            },
                        },
                    ],
                }),
            },
        },
    ];

    const total = Deal.countDocuments([
        ...pipeLine,
        {
            $count: 'totalCount',
        },
    ]);

    pipeLine = [
        ...pipeLine,
        {
            $skip: offset || 0,
        },
        {
            $limit: limit || 10,
        },
    ];

    const DealData = Deal.aggregate([...pipeLine]);

    // Fetch total count

    // Fetch related brands, categories, and platforms with populate
    const relatedFilter = {
        isActive: true,
        isSlotCompleted: false,
        adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
        ...(type === SearchEnumType.platForm && { platForm: id }),
    };

    // Fetch distinct IDs and populate their details
    const [relatedBrands, relatedCategories, relatedPlatforms] =
        await Promise.all([
            Deal.find(relatedFilter)
                .distinct('brand')
                .then((ids) => Brand.find({ _id: { $in: ids } })),
            Deal.find(relatedFilter)
                .distinct('dealCategory')
                .then((ids) => DealCategory.find({ _id: { $in: ids } })),
            Deal.find(relatedFilter)
                .distinct('platForm')
                .then((ids) => PlatForm.find({ _id: { $in: ids } })),
        ]);

    // Execute all queries concurrently
    const [data, totalCount] = await Promise.all([DealData, total]);

    // Respond with successResponse
    return res.status(200).json(
        successResponse({
            message:
                'Deal data with related brands, categories, and platforms for the requested id',
            data,
            total:
                (totalCount[1] &&
                    totalCount[1][0] &&
                    totalCount[1][0]?.totalCount) ||
                0,
            others: {
                relatedData: {
                    brands: relatedBrands,
                    categories: relatedCategories,
                    platforms: relatedPlatforms,
                },
            },
        }),
    );
});

//# sourceMappingURL=activeDealByBrandAndCategory.js.map
