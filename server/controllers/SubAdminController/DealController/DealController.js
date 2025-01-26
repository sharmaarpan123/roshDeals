import mongoose from 'mongoose';
import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
import Deal from '../../../database/models/Deal.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    sendErrorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import {
    getAccessorId,
    isSuperAdminAccessingApi,
} from '../../../utilities/utilitis.js';
import SubAdminDealSchema from './schema.js';
import User from '../../../database/models/User.js';

class SubAdminDealControllerClass {
    cloneDealController = catchAsync(async (req, res) => {
        const body = SubAdminDealSchema?.cloneDealSchema.parse(req.body);

        const {
            dealId,
            lessAmount,
            adminCommission,
            finalCashBackForUser,
            commissionValue,
        } = body;

        const clonedDeal = await Deal.findOne({ _id: dealId });

        if (!clonedDeal) {
            return res.status(400).json(
                errorResponse({
                    message: 'Deal  Not Found',
                    data: DealRes,
                }),
            );
        }

        if (clonedDeal?.isCommissionDeal && !commissionValue) {
            return sendErrorResponse({
                res,
                message: 'Please  send commission value',
            });
        }

        const newDeal = await Deal.create({
            parentDealId: clonedDeal?._id,
            lessAmount,
            adminCommission,
            finalCashBackForUser,
            commissionValue,
            adminId: req?.user?._id,
        });

        const DealRes = await newDeal.save();

        const users = await User.find({
            historyAdminReferences: req?.user?._id,
        }).select('fcmToken');

        const adminsFireBaseTokens = users.map((i) => i?.fcmToken) || [];

        sendNotification({
            notification: {
                body: 'New Deal',
                title: req?.user?.userName + ' has posted a New Deal',
            },
            tokens: adminsFireBaseTokens,
        });

        return res.status(200).json(
            successResponse({
                message: 'Deal  Cloned successfully',
                data: DealRes,
            }),
        );
    });
    getDealOfAdminsWithFilters = catchAsync(async (req, res) => {
        const {
            offset,
            limit,
            search,
            status,
            paymentStatus,
            isSlotCompleted,
        } = SubAdminDealSchema.allDealsListSchema.parse(req.body);

        const adminIds = await AdminSubAdminLinker.find({
            subAdminId: req?.user?._id,
            isActive: true,
        }).select('adminId');

        const query = {
            adminId: { $in: adminIds?.map((i) => i?.adminId) },
            ...(search && { productName: { $regex: search, $options: 'i' } }),
            ...(status && { isActive: Boolean(+status) }),
            ...(paymentStatus && { paymentStatus }),
            ...(isSlotCompleted === 'completed' && { isSlotCompleted: true }),
            ...(isSlotCompleted === 'uncompleted' && {
                isSlotCompleted: false,
            }),
            showToSubAdmins: true,
        };

        const dealData = Deal.find(query)
            .populate('brand')
            .populate('parentDealId')
            .populate('dealCategory')
            .populate('platForm')
            .skip(offset || 0)
            .limit(limit || 20)
            .sort({ createdAt: -1 });

        const totalCount = Deal.find(query).countDocuments();

        const data = await Promise.all([dealData, totalCount]);

        return res.status(200).json(
            successResponse({
                data: data[0],
                message: 'Deal Data',
                total: data[1],
            }),
        );
    });
    getDealsOfSubAdminsAsAgencyWithFilters = catchAsync(async (req, res) => {
        const {
            offset,
            limit,
            search,
            status,
            paymentStatus,
            isSlotCompleted,
        } = SubAdminDealSchema.allDealsListSchema.parse(req.body);

        let adminIds;

        const isSuperAdminAccessing = isSuperAdminAccessingApi(req);
        if (!isSuperAdminAccessing) {
            adminIds = await AdminSubAdminLinker.find({
                adminId: req?.user?._id,
            }).select('subAdminId');
        }

        console.log(isSuperAdminAccessing, 'accesrror');

        let aggregatePipelines = [
            ...(isSuperAdminAccessing
                ? [
                      {
                          $match: {
                              parentDealId: { $exists: true }, // all the deal
                          },
                      },
                  ]
                : [
                      {
                          $match: {
                              adminId: {
                                  $in: adminIds?.map((i) => i?.subAdminId),
                              },
                          },
                      },
                  ]),

            {
                $lookup: {
                    from: 'deals',
                    foreignField: '_id',
                    localField: 'parentDealId',
                    as: 'parentDealId',
                },
            },
            {
                $unwind: {
                    path: '$parentDealId',
                },
            },
            {
                $match: {
                    ...(!isSuperAdminAccessing && {
                        'parentDealId.adminId': new mongoose.Types.ObjectId(
                            req?.user?._id,
                        ),
                    }),
                    ...(search && {
                        'parentDealId.productName': {
                            $regex: search,
                            $options: 'i',
                        },
                    }),
                    ...(status && { isActive: Boolean(+status) }),
                    ...(paymentStatus && {
                        'parentDealId.paymentStatus': paymentStatus,
                    }),
                    ...(isSlotCompleted === 'completed' && {
                        'parentDealId.isSlotCompleted': true,
                    }),
                    ...(isSlotCompleted === 'uncompleted' && {
                        'parentDealId.isSlotCompleted': false,
                    }),
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    foreignField: '_id',
                    localField: 'parentDealId.brand',
                    as: 'parentDealId.brand',
                },
            },
            {
                $lookup: {
                    from: 'dealcategories',
                    foreignField: '_id',
                    localField: 'parentDealId.dealCategory',
                    as: 'parentDealId.dealCategory',
                },
            },
            {
                $lookup: {
                    from: 'platforms',
                    foreignField: '_id',
                    localField: 'parentDealId.platForm',
                    as: 'parentDealId.platForm',
                },
            },
            {
                $lookup: {
                    from: 'admins',
                    foreignField: '_id',
                    localField: 'adminId',
                    as: 'adminId',
                },
            },
            {
                $unwind: {
                    path: '$adminId',
                },
            },
            {
                $unwind: {
                    path: '$parentDealId.brand',
                },
            },
            {
                $unwind: {
                    path: '$parentDealId.dealCategory',
                },
            },
            {
                $unwind: {
                    path: '$parentDealId.platForm',
                },
            },
            {
                $count: 'totalCount',
            },
        ];

        console.log(aggregatePipelines);

        const totalCount = Deal.aggregate(aggregatePipelines);

        aggregatePipelines.pop();

        const paginationAndSortingPipeLine = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: offset || 0,
            },
            {
                $limit: limit || 20,
            },
        ];

        aggregatePipelines = [
            ...aggregatePipelines,
            ...paginationAndSortingPipeLine,
        ];

        const dealData = Deal.aggregate(aggregatePipelines);

        const data = await Promise.all([dealData, totalCount]);

        return res.status(200).json(
            successResponse({
                data: data[0],
                message: 'Deal Data',
                total:
                    (totalCount[1] &&
                        totalCount[1][0] &&
                        totalCount[1][0]?.totalCount) ||
                    0,
            }),
        );
    });
    getMyDealAsMedWithFilters = catchAsync(async (req, res) => {
        const {
            offset,
            limit,
            search,
            status,
            paymentStatus,
            isSlotCompleted,
        } = SubAdminDealSchema.allDealsListSchema.parse(req.body);

        const subAdminId = getAccessorId(req);

        const query = {
            ...(search && { productName: { $regex: search, $options: 'i' } }),
            ...(status && { isActive: Boolean(+status) }),
            ...(paymentStatus && { paymentStatus }),
            ...(isSlotCompleted === 'completed' && { isSlotCompleted: true }),
            ...(isSlotCompleted === 'uncompleted' && {
                isSlotCompleted: false,
            }),
            parentDealId: { $exists: true },
            adminId: new mongoose.Types.ObjectId(subAdminId),
        };

        const dealData = Deal.find(query)
            .populate('brand')
            .populate({
                path: 'parentDealId',
                populate: [
                    { path: 'dealCategory' },
                    { path: 'platForm' },
                    { path: 'brand' },
                ],
            })
            .populate('dealCategory')
            .populate('platForm')
            .skip(offset || 0)
            .limit(limit || 20)
            .sort({ createdAt: -1 });

        const totalCount = Deal.find(query).countDocuments();

        const data = await Promise.all([dealData, totalCount]);

        return res.status(200).json(
            successResponse({
                data: data[0],
                message: 'Deal Data',
                total: data[1],
            }),
        );
    });
    getAgencyDealDetailsAsMed = catchAsync(async (req, res) => {
        const body = SubAdminDealSchema?.getDeal.parse(req.params);
        const { dealId } = body;
        const DealRes = await Deal.findOne({ _id: dealId })
            .populate('dealCategory')
            .populate('platForm')
            .populate('brand')
            .populate({
                path: 'parentDealId',
                populate: {
                    path: 'brand dealCategory platForm',
                },
            })
            .lean();

        if (!DealRes) {
            return res.status(400).json(
                errorResponse({
                    message: 'No Data Found',
                }),
            );
        }

        const isClonedAlready = await Deal.findOne({
            parentDealId: DealRes?._id,
            adminId: new mongoose.Types.ObjectId(req?.user?._id),
        });

        if (isClonedAlready) {
            DealRes.isClonedAlready = true;
        }

        return res.status(200).json(
            successResponse({
                message: 'Deal Fetched',
                data: DealRes,
            }),
        );
    });
}

const SubAdminDealController = new SubAdminDealControllerClass();

export default SubAdminDealController;
