import catchAsync from '@/utilities/catchAsync';
import { Request, Response } from 'express';
import { SearchEnumType, activeDealByBrandAndCategory } from './schema';
import Deal from '@/database/models/Deal';
import { successResponse } from '@/utilities/Responses';

export default catchAsync(async (req: Request, res: Response) => {
    const body = activeDealByBrandAndCategory.parse(req.body);

    const { type, id, offset, limit } = body;

    const DealData = await Deal.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
    })
        .skip(offset)
        .limit(limit)
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm');

    return res
        .status(200)
        .json(successResponse({ data: DealData, message: 'Deal Data' }));
});
