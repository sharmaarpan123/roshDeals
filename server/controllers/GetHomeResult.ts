import Brand from '@/database/models/Brand';
import Deal from '@/database/models/Deal';
import { successResponse } from '@/utilities/Responses';
import { filterSchema } from '@/utilities/ValidationSchema';
import catchAsync from '@/utilities/catchAsync';
import { Request, Response } from 'express';
import { z } from 'zod';

const schema = z.object({
    dealsFilter: filterSchema.optional(),
    brandFilter: filterSchema.optional(),
});

export default catchAsync(async (req: Request, res: Response) => {
    const { dealsFilter, brandFilter } = schema.parse(req.body);

    const activelyDeals = await Deal.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
    })
        .skip(dealsFilter?.offset || 0)
        .limit(dealsFilter?.limit || 10);

    const BrandData = await Brand.find({
        isDeleted: false,
    })
        .skip(brandFilter?.offset || 0)
        .limit(brandFilter?.limit || 10);

    if (activelyDeals) {
        return res.status(200).json(
            successResponse({
                message: 'Deals Fetched',
                data: {
                    activelyDeals: activelyDeals,
                    BrandData,
                },
            }),
        );
    }
});
