import Notifications from '../../../database/models/Notifications.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { sendSuccessResponse } from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

export const getAllNotifications = catchAsync(async (req, res) => {
    const { offset, limit } = filterSchema.parse(req.body);

    const notifications = await Notifications.find({
        $or: [{ userId: req.user._id }, { adminId: req.user._id }],
    })
        .populate('dealId')
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(offset || 0)
        .limit(limit || 30);

    return sendSuccessResponse({
        res,
        data: notifications,
        message: 'All Notifications',
    });
});
