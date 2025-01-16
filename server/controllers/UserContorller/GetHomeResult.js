import mongoose from 'mongoose';
import Deal from '../../database/models/Deal.js';
import Poster from '../../database/models/Poster.js';
import { successResponse } from '../../utilities/Responses.js';
import { filterSchema } from '../../utilities/ValidationSchema.js';
import catchAsync from '../../utilities/catchAsync.js';
import { z } from 'zod';
import { getCurrentAdminReferencesId } from '../../utilities/utilitis.js';
const schema = z.object({
    dealsFilter: filterSchema.optional(),
    brandFilter: filterSchema.optional(),
    dealCategoryFilter: filterSchema.optional(),
});
export default catchAsync(async (req, res) => {
    const { dealsFilter, brandFilter, dealCategoryFilter } = schema.parse(
        req.body,
    );

    const adminCurrentRecreance = getCurrentAdminReferencesId(req);

    const activelyDeals = Deal.find({
        isActive: true,
        isSlotCompleted: false,
        adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .populate({
            path: 'parentDealId',
            populate: {
                path: 'brand dealCategory platForm',
            },
        })
        .skip(dealsFilter?.offset || 0)
        .limit(dealsFilter?.limit || 10);

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
                from: 'deals', // Self-reference the 'deals' collection to handle parentDealId
                localField: 'parentDealId',
                foreignField: '_id',
                as: 'parentDeal',
              },
            },
            {
              $lookup: {
                from: 'brands', // Join with the 'brands' collection
                let: {
                  brandId: '$brand',
                  parentBrandId: { $arrayElemAt: ['$parentDeal.brand', 0] }, // Use parentDeal's brand if it exists
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
              $unwind: '$brandData',
            },
            {
              $group: {
                _id: '$brandData._id', // Group by brand ID
                brandData: { $first: '$brandData' }, // Keep the brand document
              },
            },
            {
              $replaceRoot: {
                newRoot: '$brandData', // Replace the document with brand data
              },
            },
            {
              $skip: brandFilter?.offset || 0,
            },
            {
              $limit: brandFilter?.limit || 10,
            },
          ]);
          
    const DealCategoriesData = Deal.aggregate([
        {
            $match: {
                isActive: true,
                isSlotCompleted: false,
                adminId: new mongoose.Types.ObjectId(adminCurrentRecreance),
            },
        },
        {
            $lookup: {
                from: 'dealcategories', // Collection name in your database
                localField: 'dealCategory',
                foreignField: '_id',
                as: 'dealCategoryData',
            },
        },
        {
            $unwind: '$dealCategoryData',
        },
        {
            $group: {
                _id: '$dealCategoryData._id', // Group by the unique identifier of the brand document
                dealCategoryData: { $first: '$dealCategoryData' }, // Keep the first document in each group
            },
        },
        {
            $replaceRoot: {
                newRoot: '$dealCategoryData',
            },
        },
        {
            $skip: dealCategoryFilter?.offset || 0,
        },
        {
            $limit: dealCategoryFilter?.limit || 10,
        },
    ]);
    const PosterData = Poster.find({
        isActive: true,
    })
        .populate('brand')
        .populate('dealCategory')
        .populate({
            path: 'deal',
            populate: {
                path: 'brand dealCategory platForm',
            },
        });
    const homeData = await Promise.all([
        activelyDeals,
        brandData,
        DealCategoriesData,
        PosterData,
    ]);
    if (homeData?.length) {
        return res.status(200).json(
            successResponse({
                message: 'Home Data Fetched',
                data: {
                    activelyDeals: homeData[0],
                    brandData: homeData[1],
                    dealCategoryData: homeData[2],
                    Poster: homeData[3],
                },
            }),
        );
    }
});
//# sourceMappingURL=GetHomeResult.js.map
