import Order from '../../../database/models/Order.js';
import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import { sendNotificationSchema } from './schema.js';

export const sendNotificationController = catchAsync(async (req, res) => {
    const data = sendNotificationSchema.parse(req.body);

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

    if (data.type === 'all') {
        const tokens = await User.find({}, { _id: 0, fcmToken: 1 });
        const token = tokens
            .filter((item) => item.fcmToken)
            .map((item) => item.fcmToken);
        messageBody.tokens = token;
        await sendNotification(messageBody);
        return res.status(200).json(
            successResponse({
                message: 'Notification sent successfully',
            }),
        );
    }
    if (data.type === 'dealOrderStatus') {
        const tokens = await Order.find({
            orderFormStatus: data.orderStatus,
            dealId: data.dealId,
        }).populate({ path: 'userId', select: 'fcmToken' });

        if (!tokens.length) {
            return res.status(400).json(
                errorResponse({
                    message: 'No order found with this status',
                }),
            );
        }

        messageBody.tokens = tokens.map((item) => item?.userId?.fcmToken);
        sendNotification(messageBody);
        return res.status(200).json(
            successResponse({
                message: 'notification sended successfully',
            }),
        );
    }
});
