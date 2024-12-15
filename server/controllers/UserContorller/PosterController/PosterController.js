import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import Poster from '../../../database/models/Poster.js';

import { filterSchema } from '../../../utilities/ValidationSchema.js';

const getActivePosters = catchAsync(async (req, res) => {
    const { offset, limit } = filterSchema.parse(req.body);
    const AllData = Poster.find({ isActive: true })
        .populate('brand')
        .populate({
            path: 'deal',
            populate: {
                path: 'brand dealCategory platForm',
            },
        })
        .populate('dealCategory')
        .sort({ createdAt: -1 });

    if (limit && offset) {
        AllData.skip(offset).limit(limit);
    }

    const total = Poster.find({
        isActive: true,
    }).countDocuments();
    const data = await Promise.all([AllData, total]);
    return res.status(200).json(
        successResponse({
            message: 'All Posters',
            data: data[0],
            total: data[1],
        }),
    );
});

export default {
    getActivePosters,
};
//# sourceMappingURL=PosterController.js.map
