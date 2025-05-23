import Deal from '../../../database/models/Deal.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    addDealSchema,
    allDealsListSchema,
    BulkAddDealSchema,
    DealApiAccessingAsEnum,
    editDealSchema,
    getDeal,
    getDealsWithBrandIdSchema,
    paymentStatusChangeSchema,
    statusChangeSchema,
} from './schema.js';
import { validatingMongoObjectIds } from '../../../utilities/validations.js';
import { sendNotification } from '../../../utilities/sendNotification.js';
import User from '../../../database/models/User.js';
import Brand from '../../../database/models/Brand.js';
import moment from 'moment';
import { filterSchema } from '../../../utilities/ValidationSchema.js';
import {
    isAdminAccessingApi,
    isAdminOrSubAdminAccessingApi,
    isSuperAdminAccessingApi,
    MongooseObjectId,
} from '../../../utilities/utilitis.js';
import mongoose from 'mongoose';
import AdminSubAdminLinker from '../../../database/models/AdminSubAdminLinker.js';
import Notifications, {
    notificationType,
} from '../../../database/models/Notifications.js';
import { extractProductImage } from '../../../utilities/extractProductImage.js';

export const dealPaymentStatusChangeController = catchAsync(
    async (req, res) => {
        const { dealId, status } = paymentStatusChangeSchema.parse(req.body);
        const inValidMessage = await validatingMongoObjectIds({ deal: dealId });

        if (inValidMessage) {
            return res.status(400).json(
                errorResponse({
                    message: inValidMessage,
                }),
            );
        }
        const updatedDeal = await Deal.findOneAndUpdate(
            { _id: dealId },
            {
                paymentStatus: status,
                ...(status === 'paid' && {
                    paymentDate: moment().utc().toDate(),
                }),
            },
            { new: true },
        );

        return res.status(200).json(
            successResponse({
                message: 'Payment status Updated successfully.!',
                data: updatedDeal,
            }),
        );
    },
);

export const dealStatusChangeController = catchAsync(async (req, res) => {
    const { dealId, status } = statusChangeSchema.parse(req.body);
    const inValidMessage = await validatingMongoObjectIds({ deal: dealId });

    if (inValidMessage) {
        return res.status(400).json(
            errorResponse({
                message: inValidMessage,
            }),
        );
    }
    const updatedDeal = await Deal.findOneAndUpdate(
        { _id: dealId },
        { isActive: status },
        { new: true },
    );

    return res.status(200).json(
        successResponse({
            message: 'status Updated successfully.!',
            data: updatedDeal,
        }),
    );
});

export const dealDetailsWithFilters = catchAsync(async (req, res) => {
    const {
        offset,
        limit,
        search,
        status,
        paymentStatus,
        isSlotCompleted,
        selectedBrandFilter,
        selectedCategoryFilter,
        selectedPlatformFilter,
    } = allDealsListSchema.parse(req.body);

    const adminId = isAdminAccessingApi(req);

    const query = {
        ...(search && { productName: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: Boolean(+status) }),
        ...(paymentStatus && { paymentStatus }),
        ...(isSlotCompleted === 'completed' && { isSlotCompleted: true }),
        ...(isSlotCompleted === 'uncompleted' && {
            isSlotCompleted: false,
        }),
        ...(adminId && {
            adminId: new mongoose.Types.ObjectId(adminId),
        }),
        ...(selectedBrandFilter?.length && {
            brand: {
                $in: selectedBrandFilter?.map((i) => i),
            },
        }),
        ...(selectedCategoryFilter?.length && {
            dealCategory: {
                $in: selectedCategoryFilter?.map((i) => i),
            },
        }),
        ...(selectedPlatformFilter?.length && {
            platForm: {
                $in: selectedPlatformFilter?.map((i) => i),
            },
        }),

        parentDealId: { $exists: false },
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

export const allDeals = catchAsync(async (req, res) => {
    const { search, offset, limit } = filterSchema.parse(req.body);
    const adminOrSubAdminId = isAdminOrSubAdminAccessingApi(req);
    const dealData = await Deal.find(
        {
            isActive: true,
            ...(search && { productName: { $regex: search, $options: 'i' } }),
            ...(adminOrSubAdminId && {
                adminId: MongooseObjectId(adminOrSubAdminId),
            }),
        },
        { _id: 1, productName: 1 },
    )
        .sort({
            createdAt: -1,
        })
        .skip(offset || 0)
        .limit(limit || 30);

    return res.status(200).json(
        successResponse({
            data: dealData,
            message: 'Deal Data',
        }),
    );
});

export const addDealController = catchAsync(async (req, res) => {
    const validatedBody = addDealSchema.parse(req.body);
    let {
        actualPrice,
        brand,
        lessAmount,
        lessAmountToSubAdmin,
        dealCategory,
        platForm,
        postUrl,
        productName,
        slotAlloted,
        isActive,
        termsAndCondition,
        adminCommission,
        uniqueIdentifier,
        refundDays,
        imageUrl,
        exchangeDealProducts,
        finalCashBackForUser,
        commissionValue,
        commissionValueToSubAdmin,
        isCommissionDeal,
        showToUsers,
        showToSubAdmins,
    } = validatedBody;
    if (Number(lessAmount) + Number(adminCommission) >= Number(actualPrice)) {
        return res.status(400).json(
            errorResponse({
                message:
                    'Buyr less (incl. Platform Fee) should be less than the actual price.',
            }),
        );
    }
    if (Number(lessAmountToSubAdmin) >= Number(actualPrice)) {
        return res.status(400).json(
            errorResponse({
                message: 'Mediator less should be less than the actual price.',
            }),
        );
    }
    if (!imageUrl) {
        // if we did not get the image url from the frontend we should scrap it
        imageUrl = await extractProductImage(postUrl);
    }

    const newDeal = await Deal.create({
        actualPrice,
        brand,
        lessAmount,
        lessAmountToSubAdmin,
        dealCategory,
        platForm,
        postUrl,
        productName,
        slotAlloted,
        termsAndCondition,
        adminCommission,
        uniqueIdentifier,
        imageUrl: imageUrl || '',
        refundDays,
        exchangeDealProducts,
        finalCashBackForUser,
        commissionValue,
        isCommissionDeal,
        showToUsers,
        showToSubAdmins,
        commissionValueToSubAdmin,
        adminId: req?.user?._id,
        isActive: isActive === false ? false : true, // we want by default  active true  so if
        //on add time isActive is  false it will false other wise it will be all time true
        // we can edit on edit api
    });
    const DealRes = await newDeal.save();

    let firebaseTokens = [];

    let subAdmins = [];

    let users = [];

    if (showToSubAdmins) {
        subAdmins = await AdminSubAdminLinker.find({
            adminId: req?.user?._id,
        })
            .populate('subAdminId')
            .select('subAdminId');

        const tokens =
            subAdmins.map((i) => i?.subAdminId?.fcmTokens).flat() || [];

        firebaseTokens = [...tokens];
    }

    if (showToUsers) {
        users = await User.find({
            currentAdminReference: req?.user?._id,
        }).select('fcmToken');

        const tokens = users.map((i) => i.fcmToken).flat() || [];

        firebaseTokens = [...firebaseTokens, ...tokens];
    }

    const body = 'New Deal';
    const title =
        `${req?.user?.name} (${req?.user?.userName})` +
        ' has Create a New Deal';

    sendNotification({
        notification: {
            title,
            body,
        },
        tokens: firebaseTokens,
    });

    Notifications.insertMany([
        // for the subAdmins
        ...subAdmins.map((i) => ({
            adminId: i?.subAdminId?._id,
            body,
            title,
            dealId: DealRes?._id,
            type: notificationType.deal,
        })),
        // for the users
        ...users.map((i) => ({
            userId: i?._id,
            body,
            title,
            dealId: DealRes?._id,
            type: notificationType.deal,
            userCurrentAdminReference: req?.user?._id,
        })),
    ]);

    return res.status(200).json(
        successResponse({
            message: 'Deal  Added successfully',
            data: DealRes,
        }),
    );
});

export const bulkAddDealController = catchAsync(async (req, res) => {
    let bulkAddArr = BulkAddDealSchema.parse(req.body);

    bulkAddArr = bulkAddArr.map((item) => ({
        ...item,
        adminId: req?.user?._id,
    }));

    const showToUsers = bulkAddArr.some((item) => item?.showToUsers);
    const showToMediators = bulkAddArr.some((item) => item?.showToSubAdmins);

    const newDeal = await Deal.insertMany(bulkAddArr);

    const data = await Promise.all([
        User.find(
            { historyAdminReferences: req?.user?._id },
            { fcmToken: 1, _id: 1 },
        ),
        Brand.findOne({
            _id: bulkAddArr[0].brand,
        }),
        AdminSubAdminLinker.find({ adminId: req?.user?._id }).populate(
            'subAdminId',
        ),
    ]);

    const userFilterToken =
        data[0].filter((i) => i.fcmToken).map((i) => i.fcmToken) || []; // user fireBase tokens

    const adminFilterToken =
        data[2]
            .filter((i) => i?.subAdminId?.fcmTokens?.length > 0)
            .map((i) => i?.subAdminId?.fcmTokens)
            ?.flat() || []; // admins fireBase tokens

    const body = 'New Deals';
    const userTitle = data[1].name + " brand 's deal  are Launched";
    const AdminTitle =
        req?.user?.name + ' has Launched ' + data[1].name + " brand 's deals ";

    // sending the user push notify if show  deals is show to users is true
    showToUsers &&
        sendNotification({
            notification: {
                body,
                title: userTitle,
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
            android: {
                notification: {
                    imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
                },
            },
            tokens: userFilterToken,
        });

    // sending the mediators push notify if show  deals is show to mediator is true
    showToMediators &&
        sendNotification({
            notification: {
                body,
                title: AdminTitle,
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
            android: {
                notification: {
                    imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
                },
            },
            tokens: adminFilterToken,
        });

    Notifications.insertMany([
        // for the subAdmins
        ...(showToMediators
            ? data[2].map((i) => ({
                  adminId: i?.subAdminId?._id,
                  body,
                  title: AdminTitle,
                  brandId: data[1]?._id,
                  type: notificationType.newBrandDealCreated,
              }))
            : []),
        // for the users
        ...(showToUsers
            ? data[0].map((i) => ({
                  userId: i?._id,
                  body,
                  title: userTitle,
                  brandId: data[1]?._id,
                  type: notificationType.newBrandDealCreated,
                  userCurrentAdminReference: req?.user?._id,
              }))
            : []),
    ]);

    return res.status(200).json(
        successResponse({
            message: 'Deal  Added successfully',
            data: newDeal,
        }),
    );
});
export const editDealController = catchAsync(async (req, res) => {
    const body = editDealSchema.parse(req.body);
    const {
        dealId,
        actualPrice,
        brand,
        lessAmount,
        dealCategory,
        platForm,
        postUrl,
        productName,
        slotAlloted,
        isActive,
        termsAndCondition,
        adminCommission,
        uniqueIdentifier,
        imageUrl,
        exchangeDealProducts,
        finalCashBackForUser,
        refundDays,
        commissionValue,
        isCommissionDeal,
        lessAmountToSubAdmin,
        commissionValueToSubAdmin,
        showToSubAdmins,
        showToUsers,
        shouldScrapProductImage,
    } = body;
    // validating the brandId ,  dealCategoryId ,  platFormId ,  that they are existing on our db
    const inValidMongoIdMessage = await validatingMongoObjectIds({
        brand,
        dealCategory,
        platForm,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json(
            errorResponse({
                message: inValidMongoIdMessage,
            }),
        );
    }

    let finalImageUrl = '';
    let scrapImageUrl = '';

    if (shouldScrapProductImage) {
        scrapImageUrl = await extractProductImage(postUrl);
    }

    if (scrapImageUrl) {
        finalImageUrl = scrapImageUrl;
    } else {
        finalImageUrl = imageUrl;
    }

    const dealUpdated = await Deal.findOneAndUpdate(
        {
            _id: dealId,
        },
        {
            actualPrice,
            brand,
            lessAmount,
            dealCategory,
            platForm,
            postUrl,
            lessAmountToSubAdmin,
            commissionValueToSubAdmin,
            showToSubAdmins,
            showToUsers,
            productName,
            slotAlloted,
            termsAndCondition,
            adminCommission,
            uniqueIdentifier,
            imageUrl: finalImageUrl || '',
            exchangeDealProducts,
            finalCashBackForUser,
            refundDays,
            commissionValue,
            isCommissionDeal,
            ...(typeof isActive === 'boolean' && { isActive }),
        },
        {
            new: true,
        },
    );
    if (dealUpdated) {
        return res.status(200).json(
            successResponse({
                message: 'Updated successfully.',
                data: dealUpdated,
            }),
        );
    } else {
        return res.status(404).json(
            errorResponse({
                message: 'Not found any Data with this deal id',
            }),
        );
    }
});
export const dealDetails = catchAsync(async (req, res) => {
    const body = getDeal.parse(req.params);
    const { dealId } = body;
    const DealRes = await Deal.findOne({ _id: dealId })
        .populate('dealCategory')
        .populate('platForm')
        .populate('brand');
    if (!DealRes) {
        return res.status(400).json(
            errorResponse({
                message: 'No Data Found',
            }),
        );
    }
    return res.status(200).json(
        successResponse({
            message: 'Deal Fetched',
            data: DealRes,
        }),
    );
});

export const getDealsWithBrandId = catchAsync(async (req, res) => {
    const { brandId, apiAccessingAs, search } = getDealsWithBrandIdSchema.parse(
        req.body,
    );

    let med = [];

    const isSuperAdminAccessing = isSuperAdminAccessingApi(req);

    if (!isSuperAdminAccessing) {
        med = await AdminSubAdminLinker.find({
            adminId: req.user._id,
        }).select('subAdminId');
    }

    const dealsAsAgencyAggregation = [
        {
            $match: {
                ...(search && {
                    productName: { $regex: search, $options: 'i' },
                }),
                ...(!isSuperAdminAccessing && {
                    adminId: MongooseObjectId(req.user._id),
                }),
                brand: MongooseObjectId(brandId),
                parentDealId: { $exists: false },
            },
        },
    ];

    const medDealsAsAgencyAggregation = [
        {
            $match: {
                ...(!isSuperAdminAccessing && {
                    adminId: {
                        $in: med?.map((i) => i.subAdminId) || [],
                    },
                }),
                parentDealId: { $exists: true },
            },
        },
        {
            $lookup: {
                from: 'deals',
                localField: 'parentDealId',
                foreignField: '_id',
                as: 'parentDealId',
            },
        },
        {
            $match: {
                ...(!isSuperAdminAccessing && {
                    'parentDealId.adminId': MongooseObjectId(req.user._id),
                }),
                'parentDealId.brand': MongooseObjectId(brandId),
                ...(search && {
                    'parentDealId.productName': {
                        $regex: search,
                        $options: 'i',
                    },
                }),
            },
        },
        {
            $unwind: {
                path: '$parentDealId',
            },
        },
    ];

    const dealAsMedAggregation = [
        {
            $match: {
                ...(!isSuperAdminAccessing && {
                    adminId: MongooseObjectId(req.user._id),
                }),
                parentDealId: { $exists: true },
            },
        },
        {
            $lookup: {
                from: 'deals',
                localField: 'parentDealId',
                foreignField: '_id',
                as: 'parentDealId',
            },
        },
        {
            $match: {
                'parentDealId.brand': MongooseObjectId(brandId),
                ...(search && {
                    'parentDealId.productName': {
                        $regex: search,
                        $options: 'i',
                    },
                }),
            },
        },
        {
            $unwind: {
                path: '$parentDealId',
            },
        },
    ];

    let aggregation;
    if (apiAccessingAs === DealApiAccessingAsEnum.medDealsAsAgency) {
        aggregation = medDealsAsAgencyAggregation;
    } else if (apiAccessingAs === DealApiAccessingAsEnum.dealAsMed) {
        aggregation = dealAsMedAggregation;
    } else {
        // as dealsAsAgency
        aggregation = dealsAsAgencyAggregation;
    }


    const deals = await Deal.aggregate(aggregation);

    return res.status(200).json(
        successResponse({
            message: 'Deals Fetched of brand!',
            data: deals,
        }),
    );
});
//# sourceMappingURL=dealController.js.map
