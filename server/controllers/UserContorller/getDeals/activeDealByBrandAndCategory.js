import catchAsync from '../../../utilities/catchAsync.js';
import { SearchEnumType, activeDealByBrandAndCategory } from './schema.js';
import Deal from '../../../database/models/Deal.js';
import { successResponse } from '../../../utilities/Responses.js';
import mongoose from 'mongoose';
import Brand from '../../../database/models/Brand.js';
import DealCategory from '../../../database/models/DealCategory.js';
import PlatForm from '../../../database/models/PlatForm.js';
export default catchAsync(async (req, res) => {
    const body = activeDealByBrandAndCategory.parse(req.body);
    console.log(body)
    const { type, id, offset, limit, selectedCategoryFilter, selectedPlatformFilter, selectedBrandFilter } = body;
    const filter = {
        isActive: true,
        isSlotCompleted: false,
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
        ...(type === SearchEnumType.platForm && { platForm: id }),
        ...(selectedCategoryFilter?.length && { dealCategory: { $in: selectedCategoryFilter } }),
        ...(selectedPlatformFilter?.length && { platForm: { $in: selectedPlatformFilter } }),
        ...(selectedBrandFilter?.length && { brand: { $in: selectedBrandFilter } }),
    };
    // Fetch deals with pagination
    const DealData = Deal.find(filter)
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .skip(offset)
        .limit(limit);

    // Fetch total count
    const total = Deal.countDocuments(filter);

    // Fetch related brands, categories, and platforms with populate
    const relatedFilter = {
        isActive: true,
        isSlotCompleted: false,
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
        ...(type === SearchEnumType.platForm && { platForm: id }),
    };

    // Fetch distinct IDs and populate their details
    const [relatedBrands, relatedCategories, relatedPlatforms] = await Promise.all([
        Deal.find(relatedFilter).distinct('brand').then(ids =>
            Brand.find({ _id: { $in: ids } })
        ),
        Deal.find(relatedFilter).distinct('dealCategory').then(ids =>
            DealCategory.find({ _id: { $in: ids } })
        ),
        Deal.find(relatedFilter).distinct('platForm').then(ids =>
            PlatForm.find({ _id: { $in: ids } })
        ),
    ]);

    // Execute all queries concurrently
    const [data, totalCount] = await Promise.all([DealData, total]);

    // Respond with successResponse
    return res.status(200).json(
        successResponse({
            message: 'Deal data with related brands, categories, and platforms for the requested id',
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
