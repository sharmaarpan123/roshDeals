import Admin from '../../database/models/Admin.js';
import User from '../../database/models/User.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import { requiredString } from '../../utilities/ValidationSchema.js';
import catchAsync from '../../utilities/catchAsync.js';
import { hashPassword } from '../../utilities/hashPassword.js';
import { jwtGen } from '../../utilities/jwt.js';
import { z } from 'zod';
const schema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .trim()
        .min(1, { message: 'name should have at least one character' }),
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
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
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
const signupController = catchAsync(async (req, res) => {
    const body = schema.parse(req.body);
    const {
        name,
        email,
        password,
        phoneNumber,
        fcmToken,
        currentAdminReference,
    } = body;
    const isAlreadyExists = await User.findOne(
        {
            $or: [{ email }, { phoneNumber }],
        },
        {
            phoneNumber: 1,
            email: 1,
        },
    );
    if (isAlreadyExists) {
        return res.status(400).json(
            errorResponse({
                message: `${(isAlreadyExists.email === email && 'This Email ') || 'This Phone Number '} is already exists`,
            }),
        );
    }

    const adminCheck = await Admin.findOne({ userName: currentAdminReference });

    if (!adminCheck?._id || !adminCheck.isActive) {
        return res.status(400).json(
            errorResponse({
                message: 'Your Reference Code is In valid',
            }),
        );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        currentAdminReference: adminCheck?._id,
        historyAdminReferences: [adminCheck?._id],
    });

    await user.save();

    const updatedUser = await User.findOneAndUpdate(
        {
            phoneNumber,
        },
        {
            fcmToken: fcmToken,
        },
        {
            new: true,
        },
    )
        .populate('currentAdminReference')
        .populate('historyAdminReferences');

    const token = jwtGen(updatedUser);

    return res.status(200).json(
        successResponse({
            message: 'Sign up successfully',
            others: {
                user: updatedUser,
                token,
            },
        }),
    );
});
export default signupController;
//# sourceMappingURL=signupConrollers.js.map
