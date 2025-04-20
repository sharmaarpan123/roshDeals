import Admin from '../../database/models/Admin.js';
import catchAsync from '../../utilities/catchAsync.js';
import { verifyJwt } from '../../utilities/jwt.js';
import {
    errorResponse,
    sendSuccessResponse,
    successResponse,
} from '../../utilities/Responses.js';
import { AdminMeQuerySchema } from './Schema.js';
import Seller from '../../database/models/Seller.js';
export const sellerMeQueryController = catchAsync(async (req, res) => {
    const { token } = AdminMeQuerySchema.parse(req.body);

    const verifiedData = verifyJwt(token);

    if (!verifiedData?.data) {
        return res.status(401).json(
            errorResponse({
                message: 'In valid token',
            }),
        );
    }

    const user = await Seller.findById(verifiedData?.data?._id);

    if (!user || !user?.isActive) {
        return res.status(401).json(
            errorResponse({
                message: !user
                    ? 'Seller Not exists'
                    : 'Seller is inActive please contact SUPER admin',
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

export const sellerLogout = catchAsync(async (req, res) => {
    const user = await Seller.findOneAndUpdate(
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
