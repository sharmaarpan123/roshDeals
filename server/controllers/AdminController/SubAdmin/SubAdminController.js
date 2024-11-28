import Admin from '../../../database/models/Admin.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { ADMIN_ROLE_TYPE_ENUM } from '../../../utilities/commonTypes.js';
import { setSubAdminCaches } from '../../../utilities/getInitialCacheValues.js';
import { hashPassword } from '../../../utilities/hashPassword.js';
import {
    successResponse,
    errorResponse,
} from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import subAdminValidationSchema from './schema.js';

class subAdminController {
    getSubAdminListWithFilter = catchAsync(async (req, res) => {
        const { offset, limit, search } = filterSchema.parse(req.query);

        let AllDAta = Admin.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        })
            .populate('permissions.moduleId')
            .sort({ createdAt: -1 });

        if (typeof offset !== 'undefined') {
            AllDAta = AllDAta.skip(offset);
        }

        if (typeof limit !== 'undefined') {
            AllDAta = AllDAta.limit(limit);
        }

        const total = Admin.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).countDocuments();
        const data = await Promise.all([AllDAta, total]);
        return res.status(200).json(
            successResponse({
                message: 'All SubAdmins',
                data: data[0],
                total: data[1],
            }),
        );
    });

    getSubAdminById = catchAsync(async (req, res) => {
        const { adminId } = subAdminValidationSchema.getByIdSchema.parse(
            req.params,
        );

        const data = await Admin.findOne({
            _id: adminId,
        }).populate('permissions.moduleId');

        return res.status(200).json(
            successResponse({
                message: 'Admin get successfully',
                data: data,
            }),
        );
    });

    addSubAdminController = catchAsync(async (req, res) => {
        const validatedBody = subAdminValidationSchema.addSubAdminSchema.parse(
            req.body,
        );

        const isAlreadyExists = await Admin.findOne(
            {
                $or: [
                    { email: validatedBody?.email },
                    { phoneNumber: validatedBody?.phoneNumber },
                ],
            },
            {
                phoneNumber: 1,
                email: 1,
            },
        );
        if (isAlreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: `${(isAlreadyExists?.email === validatedBody?.email && 'This Email ') || 'This Phone Number '} is already exists`,
                }),
            );
        }
        const hashedPassword = await hashPassword(validatedBody?.password);

        const newSubAdmin = await Admin.create({
            roles: [ADMIN_ROLE_TYPE_ENUM.SUBADMIN],
            ...validatedBody,
            password: hashedPassword,
        });

        const data = await newSubAdmin.save();

        setSubAdminCaches(); // updating the admin cache

        return res.status(200).json(
            successResponse({
                data,
                message: 'sub admin successfully created',
            }),
        );
    });

    updateSubAdminController = catchAsync(async (req, res) => {
        const { adminId, ...restBody } =
            subAdminValidationSchema.updateSubAdminSchema.parse(req.body);

        const updatedAdmin = await Admin.findOneAndUpdate(
            {
                _id: adminId,
            },
            { ...restBody },
            {
                new: true,
            },
        );

        if (
            restBody?.permissions &&
            updatedAdmin?.permissions &&
            JSON.stringify(restBody?.permissions) !==
                JSON.stringify(updatedAdmin?.permissions)
        ) {
            setSubAdminCaches(); // updating the admin cache
        }

        return res.status(200).json(
            successResponse({
                data: updatedAdmin,
                message: 'sub admin successfully created',
            }),
        );
    });
}

export default new subAdminController();
