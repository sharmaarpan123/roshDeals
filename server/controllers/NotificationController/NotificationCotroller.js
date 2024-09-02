import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';
import { successResponse } from '../../utilities/Responses.js';
import { sendNotification } from '../../utilities/sendNotification.js';
import { sendNotificationSchema } from './schema.js';

export const sendNotificationController = catchAsync(async (req, res) => {
    const data = sendNotificationSchema.parse(req.body);

    if (data.type === 'all') {
        const tokens = await User.find({}, { _id: 0, fcmToken: 1 });

        sendNotification({
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
            tokens: tokens.map((item) => item.fcmToken),
        });
    }

    return res.status(200).json(
        successResponse({
            message: 'notification sended successfully',
        }),
    );
});
