import Admin from '../../../database/models/Admin.js';
import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
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
import { v4 as uuidv4 } from 'uuid';

function generateAlphabeticUUID() {
    const uuid = uuidv4(); // Generates a UUID
    return uuid.replace(/[^A-Za-z]/g, '').slice(0, 5); // Keep only alphabets and limit to 12 chars
}

class subAdminController {
    getSubAdminListWithFilter = catchAsync(async (req, res) => {
        const { offset, limit, search } = filterSchema.parse(req.query);

        const isAdminAccessingApi = req?.user?.roles?.includes(
            ADMIN_ROLE_TYPE_ENUM.ADMIN,
        );

        let subAdminList;

        if (isAdminAccessingApi) {
            subAdminList = await AdminSubAdminLinker.find({
                adminId: req?.user?._id,
            });
        }

        let AllDAta = Admin.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
            ...(isAdminAccessingApi && {
                // if admin access this api show only subAdmin link to him
                _id: { $in: [subAdminList?.map((i) => i.subAdminId)] },
            }),
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
        const body = {
            ...req.body,
            apiAccessorRoles: req?.user?.roles,
        };

        console.log(body, 'body');

        const validatedBody =
            subAdminValidationSchema.addSubAdminSchema.parse(body);

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

        let uniqueCode;

        // make sure unique code is not repeated in db
        const findingUniqueCodeDoNotRepeat = async () => {
            uniqueCode = `${validatedBody?.name}-${generateAlphabeticUUID()}`;
            const uniqueCodeExists = await Admin.findOne(
                {
                    uniqueId: uniqueCode,
                },
                { uniqueId: 1, _id: 0 },
            );

            if (uniqueCodeExists?.uniqueId) {
                await findingUniqueCodeDoNotRepeat();
            }
        };

        await findingUniqueCodeDoNotRepeat();

        const newSubAdmin = new Admin({
            ...validatedBody,
            password: hashedPassword,
            ...(uniqueCode && { uniqueId: uniqueCode }),
        });

        await newSubAdmin.save();

        if (
            validatedBody?.roles?.includes(ADMIN_ROLE_TYPE_ENUM?.SUBADMIN) &&
            req?.user?.roles?.includes(ADMIN_ROLE_TYPE_ENUM?.ADMIN)
        ) {
            // if admin is creating subAdmin then make the entries in the admin linkers
            const adminSubAdminLink = new AdminSubAdminLinker({
                subAdminId: newSubAdmin?._id,
                adminId: req?.user?._id,
            });

            await adminSubAdminLink.save();
        }

        setSubAdminCaches(); // updating the admin cache

        return res.status(200).json(
            successResponse({
                data: newSubAdmin,
                message: 'Successfully created',
            }),
        );
    });

    updateSubAdminController = catchAsync(async (req, res) => {
        const { adminId, ...restBody } =
            subAdminValidationSchema.updateSubAdminSchema.parse({
                ...req.body,
                apiAccessorRoles: req?.user?.roles,
            });

        const isAlreadyExists = await Admin.findOne(
            {
                $or: [
                    { email: restBody?.email },
                    { phoneNumber: restBody?.phoneNumber },
                ],
            },
            {
                phoneNumber: 1,
                email: 1,
            },
        );

        if (
            isAlreadyExists &&
            ((isAlreadyExists?.email === restBody?.email &&
                isAlreadyExists._id.toString() !== adminId) ||
                (isAlreadyExists?.phoneNumber === restBody?.phoneNumber &&
                    isAlreadyExists._id.toString() !== adminId))
        ) {
            return res.status(400).json(
                errorResponse({
                    message: `${(isAlreadyExists?.email === restBody?.email && 'This Email ') || 'This Phone Number '} is already exists`,
                }),
            );
        }

        if (restBody?.password) {
            restBody.password = await hashPassword(restBody?.password);
        }

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
                message: 'Successfully updated',
            }),
        );
    });
}

export default new subAdminController();
