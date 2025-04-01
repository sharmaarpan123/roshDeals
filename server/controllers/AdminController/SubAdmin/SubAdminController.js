import mongoose from 'mongoose';
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
import {
    getAccessorId,
    isSuperAdminAccessingApi,
} from '../../../utilities/utilitis.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import subAdminValidationSchema from './schema.js';

class subAdminController {
    getSubAdminListWithFilter = catchAsync(async (req, res) => {
        const { offset, limit, search, status } = filterSchema.parse(req.query);

        const isAdminAccessingApi = req?.user?.roles?.includes(
            ADMIN_ROLE_TYPE_ENUM.ADMIN,
        );

        let pipeline = [
            // Match admins based on search criteria
            ...(isAdminAccessingApi // if  admin accessing  just to include subAdmin relation status
                ? [
                      {
                          $lookup: {
                              from: 'adminsubadminlinkers', // AdminSubAdminLinker collection name
                              let: { subAdminId: '$_id' }, // Reference to the current admin's _id
                              pipeline: [
                                  {
                                      $match: {
                                          $expr: {
                                              $eq: [
                                                  '$subAdminId',
                                                  '$$subAdminId',
                                              ],
                                          },
                                      },
                                  },
                              ],
                              as: 'adminSubAdminLinkerInfo',
                          },
                      },
                      {
                          $unwind: {
                              path: '$adminSubAdminLinkerInfo',
                              preserveNullAndEmptyArrays: false,
                          },
                      },
                      {
                          $match: {
                              'adminSubAdminLinkerInfo.adminId':
                                  new mongoose.Types.ObjectId(req?.user?._id),
                              ...(search && {
                                  name: { $regex: search, $options: 'i' },
                              }),
                          },
                      },
                  ]
                : // if super admin accessing
                  [
                      {
                          $match: {
                              ...(search && {
                                  name: { $regex: search, $options: 'i' },
                              }),
                              ...(status && {
                                  isActive: Boolean(+status),
                              }),
                          },
                      },
                  ]),
        ];

        const total = Admin.aggregate([
            // pipeline for only to count total
            ...pipeline,
            {
                $count: 'totalCount',
            },
        ]);

        pipeline = [
            // pipeline with pagination
            ...pipeline,
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: +offset || 0,
            },
            {
                $limit: +limit || 10,
            },
        ];

        const AllDAta = Admin.aggregate(pipeline);

        const data = await Promise.all([total, AllDAta]);
        return res.status(200).json(
            successResponse({
                message: 'All SubAdmins',
                data: data[1],
                total: (data[0] && data[0][0] && data[0][0]?.totalCount) || 0,
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

    checkIsUserNameExists = catchAsync(async (req, res) => {
        const { userName } = req.body;

        if (!userName || !(userName && userName?.trim())) {
            return res.status(400).json(
                errorResponse({
                    message: `User Name is required`,
                }),
            );
        }

        const isAlreadyExists = await Admin.findOne(
            {
                userName,
            },
            {
                userName: 1,
            },
        );

        if (isAlreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: `This User Name is already exists`,
                    others: { data: { userName } },
                }),
            );
        } else {
            return res.status(200).json(
                successResponse({
                    message: `You can try this User Name!`,
                    others: { data: { userName } },
                }),
            );
        }
    });

    addSubAdminController = catchAsync(async (req, res) => {
        const body = {
            ...req.body,
            apiAccessorRoles: req?.user?.roles,
        };

        const validatedBody =
            subAdminValidationSchema.addSubAdminSchema.parse(body);

        const isAlreadyExists = await Admin.findOne(
            {
                $or: [
                    { email: validatedBody?.email },
                    { phoneNumber: validatedBody?.phoneNumber },
                    {
                        userName: validatedBody?.userName,
                    },
                ],
            },
            {
                phoneNumber: 1,
                email: 1,
                userName: 1,
            },
        );
        if (isAlreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: `${
                        isAlreadyExists?.email === validatedBody?.email
                            ? 'This Email '
                            : isAlreadyExists?.phoneNumber ===
                                validatedBody?.phoneNumber
                              ? 'This Phone Number '
                              : 'This User Name '
                    }
                     is already exists`,
                }),
            );
        }

        const hashedPassword = await hashPassword(validatedBody?.password);

        const newSubAdmin = new Admin({
            ...validatedBody,
            password: hashedPassword,
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
                $and: [
                    { _id: { $ne: adminId } },
                    {
                        $or: [
                            { email: restBody?.email },
                            { phoneNumber: restBody?.phoneNumber },
                            { userName: restBody?.userName },
                        ],
                    },
                ],
            },
            {
                phoneNumber: 1,
                email: 1,
                userName: 1,
            },
        );

        if (isAlreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: `${
                        isAlreadyExists?.email === restBody?.email
                            ? 'This Email '
                            : isAlreadyExists?.phoneNumber ===
                                restBody?.phoneNumber
                              ? 'This Phone Number '
                              : 'This User Name '
                    }
                     is already exists`,
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
    manageAdminSubAdminRelation = catchAsync(async (req, res) => {
        const isSuperAdminId = isSuperAdminAccessingApi(req);

        const { adminId, subAdminId, isActive } =
            subAdminValidationSchema.manageAdminSubAdminRelation.parse({
                ...req?.body,
                adminId: isSuperAdminId
                    ? req?.body?.adminId
                    : getAccessorId(req),
            });

        const updatedData = await AdminSubAdminLinker.findOneAndUpdate(
            { adminId, subAdminId },
            {
                $set: {
                    isActive,
                },
            },
            { new: true },
        );

        if (updatedData) {
            return res.status(200).json(
                successResponse({
                    message: 'Updated successfully',
                }),
            );
        }
        return res.status(400).json(
            errorResponse({
                message: 'Something went wrong while updating!',
            }),
        );
    });

    linkSubAdminByAdmin = catchAsync(async (req, res) => {
        const { subAdminUserName, adminUserName } =
            subAdminValidationSchema.linkAdminSubAdmin.parse({
                ...req?.body,
            });

        const isUserNameExistsPromise = [
            Admin.findOne({ userName: adminUserName }),
            Admin.findOne({ userName: subAdminUserName }),
        ];

        const isUserNamesExists = await Promise.all(isUserNameExistsPromise);

        if (!isUserNamesExists[0]) {
            return res.status(400).json(
                errorResponse({
                    message: 'In Valid Agency User Name',
                }),
            );
        }

        if (!isUserNamesExists[1]) {
            return res.status(400).json(
                errorResponse({
                    message: 'In Valid Med User Name',
                }),
            );
        }

        if (
            !isUserNamesExists[1].roles.includes(ADMIN_ROLE_TYPE_ENUM.SUBADMIN)
        ) {
            return res.status(400).json(
                errorResponse({
                    message:
                        'This User is not Become Mediator yet!, Please ask Him to become a Mediator',
                }),
            );
        }

        const isAlreadyLinked = await AdminSubAdminLinker.findOne({
            adminId: isUserNamesExists[0]?._id,
            subAdminId: isUserNamesExists[1]?._id,
        });

        if (isAlreadyLinked) {
            return res.status(400).json(
                errorResponse({
                    message: 'This Mediator is already Added',
                }),
            );
        }

        const adminSubAdminLink = new AdminSubAdminLinker({
            adminId: isUserNamesExists[0]?._id,
            subAdminId: isUserNamesExists[1]?._id,
        });

        const data = await adminSubAdminLink.save();

        if (data) {
            return res.status(200).json(
                successResponse({
                    message: 'Successfully Added',
                }),
            );
        }

        return res.status(400).json(
            errorResponse({
                message: 'Something went wrong while Adding!',
            }),
        );
    });
}

export default new subAdminController();
