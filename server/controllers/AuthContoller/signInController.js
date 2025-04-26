import Admin from '../../database/models/Admin.js';
import User from '../../database/models/User.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import { comparePassword } from '../../utilities/hashPassword.js';
import { jwtGen } from '../../utilities/jwt.js';
import { z } from 'zod';
const schema = z
    .object({
        phoneNumber: z
            .string()
            .trim()
            .min(1, { message: 'Phone Number is required' })
            .refine((data) => /^\d+$/.test(data), {
                message: 'Phone Number should be Numeric',
            })
            .optional(),
        email: z
            .string()
            .trim()
            .email({ message: 'Invalid email address' })
            .optional(),
        currentAdminReference: z
            .string({
                required_error: 'Current Reference Code is required',
            })
            .trim()
            .min(1, { message: 'Current Reference Code is required' }),
        password: z
            .string({
                required_error: 'Password is required',
            })
            .trim()
            .min(1, { message: 'Password is required' })
            .refine(
                (data) =>
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/.test(
                        data,
                    ),
                {
                    message:
                        'Password must have Lowercase, Uppercase, Number, Symbol or special char',
                },
            ),
        fcmToken: z.string().optional(),
    })
    .refine((data) => data.phoneNumber || data.email, {
        message: 'Either phone number or email is required',
        path: ['phoneNumber', 'email'],
    });
const signInController = catchAsync(async (req, res) => {
    const body = schema.parse(req.body);
    const { password, phoneNumber, email, fcmToken, currentAdminReference } = body;
    const user = await User.findOne(
        phoneNumber
            ? { phoneNumber }
            : email
            ? { email }
            : null,
    );
    if (!user) {
        return res.status(400).json(
            errorResponse({
                message: 'This account is not registered, please sign up',
            }),
        );
    }
    const isMatched = await comparePassword(password, user.password);

    if (!isMatched) {
        return res.status(400).json(
            errorResponse({
                message: 'Wrong password',
            }),
        );
    }

    if (!user.isActive) {
        return res.status(400).json(
            errorResponse({
                message:
                    'Your account has been deactivated by the super Admin, please contact your Admin',
            }),
        );
    }
    const adminCheck = await Admin.findOne({ userName: currentAdminReference });

    if (!adminCheck?._id || !adminCheck.isActive) {
        return res.status(400).json(
            errorResponse({
                message: 'Your Reference Code is invalid',
            }),
        );
    }

    const updatedUser = await User.findOneAndUpdate(
        phoneNumber ? { phoneNumber } : { email },
        {
            $set: {
                fcmToken: fcmToken,
                currentAdminReference: adminCheck?._id,
            },
            $addToSet: {
                historyAdminReferences: adminCheck?._id, // Adds the value only if it doesn't already exist
            },
        },
        {
            new: true,
        },
    )
        .populate('currentAdminReference')
        .select('currentAdminReference _id name roles email phoneNumber');

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
