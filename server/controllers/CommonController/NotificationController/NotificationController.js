import Notifications from '../../../database/models/Notifications.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ROLE_TYPE_ENUM } from '../../../utilities/commonTypes.js';
import { sendSuccessResponse } from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

export const getAllNotifications = catchAsync(async (req, res) => {
    const { offset, limit } = filterSchema.parse(req.body);

    const { roles, _id, currentAdminReference } = req.user;

    const query = {};

    if (roles.includes(ROLE_TYPE_ENUM.USER)) {
        query['$or'] = [
            { sendFromSuperAdmin: true, userId: _id },
            {
                userId: _id,
                userCurrentAdminReference: currentAdminReference?._id,
            },
        ];
    } else {
        query.adminId = _id;
    }

    const notificationsPromise = Notifications.find(query)
        .populate('dealId')
        .populate({
            path: 'orderId',
            populate: {
                path: 'dealId',
                populate: {
                    path: 'parentDealId',
                },
            },
        })
        .populate('brandId')
        .sort({ createdAt: -1 })
        .skip(offset || 0)
        .limit(limit || 30);

    const totalCountPromise = Notifications.find(query).countDocuments();

    const [notifications, totalCount] = await Promise.all([
        notificationsPromise,
        totalCountPromise,
    ]);

    return sendSuccessResponse({
        res,
        data: notifications,
        total: totalCount,
        message: 'All Notifications',
    });
});
