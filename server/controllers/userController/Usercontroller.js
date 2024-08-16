import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';

export const getAllUsersController = catchAsync(async (req, res) => {
    const { offset, limit, search } = filterSchema.parse(req.body);

    let AllDAta = User.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
    });

    if (typeof offset !== 'undefined') {
        AllDAta = AllDAta.skip(offset);
    }

    if (typeof limit !== 'undefined') {
        AllDAta = AllDAta.limit(limit);
    }

    const total = User.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
    }).countDocuments();

    const data = await Promise.all([AllDAta, total]);

    return res.status(200).json(
        successResponse({
            message: 'All Brands',
            data: data[0],
            total: data[1],
        }),
    );
});
