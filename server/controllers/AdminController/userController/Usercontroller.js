import User from '../../../database/models/User.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ADMIN_ROLE_TYPE_ENUM } from '../../../utilities/commonTypes.js';
import { hashPassword } from '../../../utilities/hashPassword.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { isAdminOrSubAdminAccessingApi } from '../../../utilities/utilitis.js';
import {
    activeInActiveSchema,
    getAllUserSchema,
    updateUserSchema,
    userIdSchema,
} from './schema.js';

export const getAllUsersController = catchAsync(async (req, res) => {
    const { offset, limit, search, status } = getAllUserSchema.parse(req.body);

    const adminId = isAdminOrSubAdminAccessingApi(req);

    const query = {
        ...(status && { isActive: Boolean(+status) }),
        ...(search && {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ],
        }),
        ...(adminId && {
            historyAdminReferences: adminId,
        }),
    };

    let AllDAta = User.find(query).sort({ createdAt: -1 });

    if (typeof offset !== 'undefined') {
        AllDAta = AllDAta.skip(offset);
    }

    if (typeof limit !== 'undefined') {
        AllDAta = AllDAta.limit(limit);
    }

    const total = User.find(query).countDocuments();

    const data = await Promise.all([AllDAta, total]);

    return res.status(200).json(
        successResponse({
            message: 'All users',
            data: data[0],
            total: data[1],
        }),
    );
});

export const activeInActiveUserController = catchAsync(async (req, res) => {
    const { status, userId } = activeInActiveSchema.parse(req.body);

    const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { isActive: status },
    );

    if (!updatedUser) {
        return res.status(200).json(
            errorResponse({
                message: 'user not found',
            }),
        );
    }

    return res.status(200).json(
        successResponse({
            message: 'status Updated successfully.',
        }),
    );
});

export const updateUserController = catchAsync(async (req, res) => {
    const { status, userId, email, name, phoneNumber, password } =
        updateUserSchema.parse(req.body);

    const body = { isActive: status, email, name, phoneNumber };

    if (password) {
        const hashedPassword = await hashPassword(password);
        body.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate({ _id: userId }, body, {
        new: true,
    });

    if (!updatedUser) {
        return res.status(200).json(
            errorResponse({
                message: 'user not found',
            }),
        );
    }

    return res.status(200).json(
        successResponse({
            message: 'user Updated successfully.',
        }),
    );
});

export const getUserByIdController = catchAsync(async (req, res) => {
    const { userId } = userIdSchema.parse(req.params);

    const user = await User.findOne({ _id: userId });

    if (!user) {
        return res.status(200).json(
            errorResponse({
                message: 'user not found',
            }),
        );
    }
    return res.status(200).json(
        successResponse({
            message: 'user  found',
            data: user,
        }),
    );
});
