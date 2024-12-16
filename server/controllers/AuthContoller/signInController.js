import Admin from '../../database/models/Admin.js';
import User from '../../database/models/User.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import { comparePassword } from '../../utilities/hashPassword.js';
import { jwtGen } from '../../utilities/jwt.js';
import { z } from 'zod';
const schema = z.object({
    phoneNumber: z
        .string({
            required_error: 'Phone Number is required',
        })
        .trim()
        .min(1, { message: 'Phone Number is required' })
        .refine((data) => /^\d+$/.test(data), {
            message: 'phone Number should be Numeric',
        }),
    currentAdminReference: z
        .string({
            required_error: 'Current  Reference Code is required',
        })
        .min(1, { message: 'Current Reference Code is required' }),
    password: z
        .string({
            required_error: 'Password is required',
        })
        .trim()
        .min(1, { message: 'password is required' })
        .refine(
            (data) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                    data,
                ),
            {
                message:
                    'Password Must have Lowercase, Uppercase, Number, Symbol or special char',
            },
        ),
    fcmToken: z.string().optional(),
});
const signInController = catchAsync(async (req, res) => {
    schema.parse(req.body);
    const { password, phoneNumber, fcmToken, currentAdminReference } = req.body;
    const user = await User.findOne({
        phoneNumber,
    });
    if (!user) {
        return res.status(400).json(
            errorResponse({
                message: 'This Phone Number is not registered , please sign up',
            }),
        );
    }
    const isMatched = await comparePassword(password, user.password);
    if (!isMatched) {
        return res.status(400).json(
            errorResponse({
                message: 'wrong password',
            }),
        );
    }

    if (!user.isActive) {
        return res.status(400).json(
            errorResponse({
                message:
                    'Your account has been deactivated by the admin ,  please contact your admin',
            }),
        );
    }
    const adminCheck = await Admin.findOne({ uniqueId: currentAdminReference });

    if (!adminCheck?._id || !adminCheck.isActive) {
        return res.status(400).json(
            errorResponse({
                message: 'Your Reference Code is In valid',
            }),
        );
    }

    const updatedUser = await User.findOneAndUpdate(
        {
            phoneNumber,
        },
        {
            $set: {
                fcmToken: fcmToken,
                currentAdminReference: currentAdminReference,
            },
            $addToSet: {
                historyAdminReferences: currentAdminReference, // Adds the value only if it doesn't already exist
            },
        },
        {
            new: true,
        },
    );
    const token = jwtGen(updatedUser);
    return res.status(200).json(
        successResponse({
            message: 'Sign in successfully',
            others: { user: updatedUser, token },
        }),
    );
});
export default signInController;
//# sourceMappingURL=signInController.js.map
