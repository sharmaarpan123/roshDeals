import { z } from 'zod';
import Seller from '../../database/models/Seller.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import {
    optionalEmailString,
    optionalPhoneNUmber
} from '../../utilities/ValidationSchema.js';
import catchAsync from '../../utilities/catchAsync.js';
import { comparePassword } from '../../utilities/hashPassword.js';
import { jwtGen } from '../../utilities/jwt.js';
const schema = z
    .object({
        phoneNumber: optionalPhoneNUmber(),
        email: optionalEmailString(),
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
    })
    .refine(
        (data) => {
            if (!data?.email && !data?.phoneNumber) {
                return false;
            }
            return true;
        },
        {
            message: 'Please send  Email or Phone Number',
        },
    );

const sellerSignInController = catchAsync(async (req, res) => {
    schema.parse(req.body);
    const { password, phoneNumber, fcmToken, email } = req.body;
    const user = await Seller.findOne({
        $or: [{ email }, { phoneNumber }],
    });
    if (!user) {
        return res.status(400).json(
            errorResponse({
                message:
                    'This ' +
                    (email ? 'email' : 'Phone Number') +
                    ' is not registered , please contact admin',
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
                    'Your account has been deactivated by the super admin. Please contact the super admin for assistance.',
            }),
        );
    }

    const updatedUser = await Seller.findOneAndUpdate(
        {
            phoneNumber,
        },
        {
            $addToSet: {
                fcmTokens: fcmToken,
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
export default sellerSignInController;
//# sourceMappingURL=sellerSignInController.js.map
