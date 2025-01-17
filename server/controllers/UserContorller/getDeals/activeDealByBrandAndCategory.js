import catchAsync from '../../../utilities/catchAsync.js';
import { SearchEnumType, activeDealByBrandAndCategory } from './schema.js';
import Deal from '../../../database/models/Deal.js';
import { successResponse } from '../../../utilities/Responses.js';
import mongoose from 'mongoose';
import Brand from '../../../database/models/Brand.js';
import DealCategory from '../../../database/models/DealCategory.js';
import PlatForm from '../../../database/models/PlatForm.js';
import { getCurrentAdminReferencesId } from '../../../utilities/utilitis.js';
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
        // ...(type === SearchEnumType.brand && { brand: id }),

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
    // Fetch deals with pagination
    // const DealData = Deal.find(filter)
    //     .populate('brand')
    //     .populate('dealCategory')
    //     .populate('platForm')
    //     .populate({
    //         path: 'parentDealId',
    //         populate: {
    //             path: 'brand dealCategory platForm',
    //         },
    //     })
    //     .skip(offset)
    //     .limit(limit);

    const DealData = Deal.aggregate([
        {
            $match: {
                isActive: true,
                isSlotCompleted: false,
                adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
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
        {
            $match: {
                ...(type === SearchEnumType.brand && {
                    $or: [{ brand: id }, { 'parentDealId.brand': id }],
                }),
                ...(type === SearchEnumType.dealCategory && {
                    $or: [
                        { dealCategory: id },
                        { 'parentDealId.dealCategory': id },
                    ],
                }),
                ...(type === SearchEnumType.platForm && {
                    $or: [{ platForm: id }, { 'parentDealId.platForm': id }],
                }),
                ...(selectedCategoryFilter?.length && {
                    $or: [
                        { dealCategory: { $in: selectedCategoryFilter } },
                        {
                            'parentDealId.dealCategory': {
                                $in: selectedCategoryFilter,
                            },
                        },
                    ],
                }),
                ...(selectedPlatformFilter?.length && {
                    $or: [
                        { platForm: { $in: selectedPlatformFilter } },
                        {
                            'parentDealId.platForm': {
                                $in: selectedPlatformFilter,
                            },
                        },
                    ],
                }),
                ...(selectedBrandFilter?.length && {
                    $or: [
                        { brand: { $in: selectedBrandFilter } },
                        { 'parentDealId.brand': { $in: selectedBrandFilter } },
                    ],
                }),
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
        { $unwind: '$parentDealId.dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'parentDealId.platForm',
                foreignField: '_id',
                as: 'parentDealId.platForm',
            },
        },
        { $unwind: '$parentDealId.platForm' },
        {
            $lookup: {
                from: 'brands',
                localField: 'parentDealId.brand',
                foreignField: '_id',
                as: 'parentDealId.brand',
            },
        },
        { $unwind: '$parentDealId.brand' },

        // root level  deal populate
        {
            $lookup: {
                from: 'dealcategories',
                localField: 'dealCategory',
                foreignField: '_id',
                as: 'dealCategory',
            },
        },
        { $unwind: '$dealCategory' },
        {
            $lookup: {
                from: 'platforms',
                localField: 'platForm',
                foreignField: '_id',
                as: 'platForm',
            },
        },
        { $unwind: '$platForm' },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand',
            },
        },
        { $unwind: '$brand' },
    ]);

    // Fetch total count
    const total = Deal.countDocuments(filter);

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
            total: totalCount,
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
