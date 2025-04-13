import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
import Notifications, {
    notificationType,
} from '../../../database/models/Notifications.js';
import Order from '../../../database/models/Order.js';
import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    sendErrorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import {
    getAccessorId,
    isSuperAdminAccessingApi,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';
import { sendNotificationSchema } from './schema.js';

export const sendNotificationController = catchAsync(async (req, res) => {
    const data = sendNotificationSchema.parse(req.body);

    const adminId = getAccessorId(req);

    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);

    const messageBody = {
        notification: {
            body: data.body,
            title: data.title,
            imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
        },
        android: {
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
        },
    };

    if (data.type === 'users') {
        const users = await User.find(
            {
                ...(!isSuperAdminAccessing && {
                    historyAdminReferences: adminId,
                }),
            },
            { fcmToken: 1 },
        );
        const token = users
            .filter((item) => item.fcmToken)
            .map((item) => item.fcmToken);
        messageBody.tokens = token;

        sendNotification(messageBody);

        Notifications.insertMany(
            users?.map((item) => {
                return {
                    userId: item?._id,
                    body: data.body,
                    title: data.title,
                    type: notificationType.information,
                    ...(isSuperAdminAccessing && {
                        sendFromSuperAdmin: true,
                    }),
                    ...(!isSuperAdminAccessing && {
                        userCurrentAdminReference: adminId,
                    }),
                };
            }) || [],
        );

        return res.status(200).json(
            successResponse({
                message: 'Notification sent to users successfully',
            }),
        );
    }
    if (data.type === 'toMed') {
        const mediators = await AdminSubAdminLinker.aggregate([
            {
                $match: {
                    ...(!isSuperAdminAccessing && {
                        adminId: MongooseObjectId(adminId),
                    }),
                },
            },
            {
                $group: {
                    _id: '$subAdminId', // Group by adminId
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    foreignField: '_id',
                    localField: '_id',
                    as: 'subAdminId',
                },
            },
            {
                $unwind: {
                    path: '$subAdminId',
                },
            },
            {
                $project: {
                    subAdminId: { fcmTokens: 1, _id: 1 },
                },
            },
        ]);

        const tokens = mediators
            ?.map((item) => item?.subAdminId?.fcmTokens)
            ?.flat();
        const token = tokens.filter((item) => item).map((item) => item);
        messageBody.tokens = token;
        sendNotification(messageBody);

        Notifications.insertMany(
            mediators?.map((item) => {
                return {
                    adminId: item?.subAdminId?._id,
                    body: data.body,
                    title: data.title,
                    type: notificationType.information,
                    ...(isSuperAdminAccessing && {
                        sendFromSuperAdmin: true,
                    }),
                };
            }) || [],
        );

        return res.status(200).json(
            successResponse({
                message: 'Notification sent Mediator successfully',
            }),
        );
    }
    if (data.type === 'toAgency') {
        if (!isSuperAdminAccessing) {
            return sendErrorResponse({
                res,
                message: 'You are not authorized to send messages to agencies',
            });
        }
        const agencies = await AdminSubAdminLinker.aggregate([
            {
                $group: {
                    _id: '$adminId',
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    foreignField: '_id',
                    localField: '_id',
                    as: 'adminId',
                },
            },
            {
                $unwind: {
                    path: '$adminId',
                },
            },
            {
                $project: {
                    adminId: { fcmTokens: 1, _id: 1 },
                },
            },
        ]);

        const tokens = agencies
            ?.map((item) => item?.adminId?.fcmTokens)
            ?.flat();
        const token = tokens.filter((item) => item).map((item) => item);
        messageBody.tokens = token;
        sendNotification(messageBody);

        Notifications.insertMany(
            agencies?.map((item) => {
                return {
                    adminId: item?.adminId?._id,
                    body: data.body,
                    title: data.title,
                    type: notificationType.information,
                    ...(isSuperAdminAccessing && {
                        sendFromSuperAdmin: true,
                    }),
                };
            }) || [],
        );

        return res.status(200).json(
            successResponse({
                message: 'Notification sent to Agencies successfully',
            }),
        );
    }
    if (data.type === 'dealOrderStatus') {
        const tokens = await Order.find(
            {
                orderFormStatus: data.orderStatus,
                dealId: data.dealId,
                ...(!isSuperAdminAccessing && {
                    dealOwner: adminId,
                }),
            },
            {
                userId: 1,
            },
        ).populate({ path: 'userId', select: 'fcmToken _id' });

        if (!tokens.length) {
            return res.status(400).json(
                errorResponse({
                    message: 'No order found with this status',
                }),
            );
        }

        messageBody.tokens = tokens.map((item) => item?.userId?.fcmToken);
        sendNotification(messageBody);

        Notifications.insertMany(
            tokens?.map((item) => {
                return {
                    userId: item?.userId?._id,
                    orderId: item?._id,
                    body: data.body,
                    title: data.title,
                    type: notificationType.orderFormUpdate,
                    ...(isSuperAdminAccessing && {
                        sendFromSuperAdmin: true,
                    }),
                    ...(!isSuperAdminAccessing && {
                        userCurrentAdminReference: adminId,
                    }),
                };
            }) || [],
        );

        return res.status(200).json(
            successResponse({
                message: 'notification sended successfully',
            }),
        );
    }
});
