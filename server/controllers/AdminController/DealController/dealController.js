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
                message: 'Payment status updated successfully!',
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
            message: 'status updated successfully!',
            data: updatedDeal,
        }),
    );
});

export const dealDetailsWithFilters = catchAsync(async (req, res) => {
    const { offset, limit, search, status, paymentStatus, isSlotCompleted } =
        allDealsListSchema.parse(req.body);

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
                adminId: mongoose.Types.ObjectId(adminOrSubAdminId),
            }),
        },
        { _id: 1, productName: 1 },
    )
        .sort({
            createdAt: -1,
        })
        .skip(offset || 0)
        .limit(limit || 10);

    return res.status(200).json(
        successResponse({
            data: dealData,
            message: 'Deal Data',
        }),
    );
});

export const addDealController = catchAsync(async (req, res) => {
    const validatedBody = addDealSchema.parse(req.body);
    const {
        actualPrice,
        brand,
        lessAmount,
        lessAmountToSubAdmin,
        dealCategory,
        platForm,
        postUrl,
        productCategories,
        productName,
        slotAlloted,
        isActive,
        termsAndCondition,
        adminCommission,
        uniqueIdentifier,
        refundDays,
        exchangeDealProducts,
        finalCashBackForUser,
        commissionValue,
        commissionValueToSubAdmin,
        isCommissionDeal,
        showToUsers,
        showToSubAdmins,
    } = validatedBody;

    const imageUrl = await extractProductImage(postUrl);

    const newDeal = await Deal.create({
        actualPrice,
        brand,
        lessAmount,
        lessAmountToSubAdmin,
        dealCategory,
        platForm,
        postUrl,
        productCategories,
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
    const title = req?.user?.userName + ' has Create a New Deal';

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
    const bulkAddArr = BulkAddDealSchema.parse(req.body);

    const newDeal = await Deal.insertMany(bulkAddArr);

    const data = await Promise.all([
        User.find({}, { fcmToken: 1, _id: 0 }),
        Brand.findOne({
            _id: bulkAddArr[0].brand,
        }),
    ]);

    const filterToken = data[0]
        .filter((i) => i.fcmToken)
        .map((i) => i.fcmToken);

    sendNotification({
        notification: {
            body: 'New Deals',
            title: data[1].name + " brand 's deal  are Launched",
            imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
        },
        android: {
            notification: {
                imageUrl: `${process.env.BASE_URL}/images/logo.jpeg`,
            },
        },
        tokens: filterToken,
    });

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
        productCategories,
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
            productCategories,
            productName,
            slotAlloted,
            termsAndCondition,
            adminCommission,
            uniqueIdentifier,
            imageUrl,
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
                message: 'updated successfully',
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
    // const apiAccessingAs = {
    //     dealsAsAgency: 'dealsAsAgency',
    //     medDealsAsAgency: 'medDealsAsAgency',
    //     dealAsMed: 'dealAsMed',
    // };
    const { brandId } = getDealsWithBrandIdSchema.parse({
        ...req.params,
    });

    // const isSuperAdminAccessing = isSuperAdminAccessingApi(req);

    const deals = await Deal.find({ ...(brandId && { brand: brandId }) });

    return res.status(200).json(
        successResponse({
            message: 'Deals Fetched of brand!',
            data: deals,
        }),
    );
});
//# sourceMappingURL=dealController.js.map
