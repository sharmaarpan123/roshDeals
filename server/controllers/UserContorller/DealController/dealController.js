import Deal from '../../../database/models/Deal.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { getDeal } from './schema.js';

import { filterSchema } from '../../../utilities/ValidationSchema.js';

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
    const activelyDeals = Deal.find({
        isActive: true,
        isSlotCompleted: false,
        ...(search && { productName: { $regex: search, $options: 'i' } }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .sort({ createdAt: -1 })
        .skip(offset || 0)
        .limit(limit || 20);
    const total = Deal.find({
        isActive: true,
        isSlotCompleted: false,
        ...(search && { productName: { $regex: search, $options: 'i' } }),
    }).countDocuments();
    const data = await Promise.all([activelyDeals, total]);
    if (activelyDeals) {
        return res.status(200).json(
            successResponse({
                message: 'Deals Fetched',
                data: data[0],
                total: data[1],
            }),
        );
    }
});
