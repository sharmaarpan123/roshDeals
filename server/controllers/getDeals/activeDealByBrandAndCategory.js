import catchAsync from '../../utilities/catchAsync.js';
import { SearchEnumType, activeDealByBrandAndCategory } from './schema.js';
import Deal from '../../database/models/Deal.js';
import { successResponse } from '../../utilities/Responses.js';
export default catchAsync(async (req, res) => {
    const body = activeDealByBrandAndCategory.parse(req.body);
    const { type, id, offset, limit } = body;
    const DealData = Deal.find({
        isActive: true,
        isSlotCompleted: false,
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .skip(offset)
        .limit(limit);

    const total = Deal.find({
        isActive: true,
        isSlotCompleted: false,
        ...(type === SearchEnumType.brand && { brand: id }),
        ...(type === SearchEnumType.dealCategory && { dealCategory: id }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .countDocuments();

    const data = await Promise.all([DealData, total]);

    return res.status(200).json(
        successResponse({
            data: data[0],
            total: data[1],
            message: 'Deal Data',
        }),
    );
});
//# sourceMappingURL=activeDealByBrandAndCategory.js.map
