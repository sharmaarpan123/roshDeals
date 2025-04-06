import Admin from '../../database/models/Admin.js';
import catchAsync from '../../utilities/catchAsync.js';
import { verifyJwt } from '../../utilities/jwt.js';
import {
    errorResponse,
    sendSuccessResponse,
    successResponse,
} from '../../utilities/Responses.js';
import { AdminMeQuerySchema } from './Schema.js';

export const adminMeQueryController = catchAsync(async (req, res) => {
    const { token } = AdminMeQuerySchema.parse(req.body);

    const verifiedData = verifyJwt(token);

    if (!verifiedData?.data) {
        return res.status(401).json(
            errorResponse({
                message: 'In valid token',
            }),
        );
    }

    const user = await Admin.findById(verifiedData?.data?._id);

    if (!user || !user?.isActive) {
        return res.status(401).json(
            errorResponse({
                message: !user
                    ? 'Admin Not exists'
                    : 'Admin is inActive please contact SUPER admin',
            }),
        );
    }

    return res.status(200).json(
        successResponse({
            message: 'User Details',
            data: user,
        }),
    );
});

export const adminLogout = catchAsync(async (req, res) => {
    const user = await Admin.findOneAndUpdate(
        { _id: req?.user?._id },
        {
            $pull: {
                fcmTokens: req.body.fcmToken,
            },
        },
        { new: true },
    );

    if (user) {
        return sendSuccessResponse({
            res,
            message: 'Logout successfully',
        });
    }
});
