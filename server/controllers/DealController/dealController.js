import Deal from '../../database/models/Deal.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import catchAsync from '../../utilities/catchAsync.js';
import {
    addDealSchema,
    allDealsListSchema,
    BulkAddDealSchema,
    editDealSchema,
    getDeal,
    getDealsWithBrandIdSchema,
    paymentStatusChangeSchema,
} from './schema.js';
import { validatingMongoObjectIds } from '../../utilities/validations.js';
import { filterSchema } from '../../utilities/ValidationSchema.js';

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
            { paymentStatus: status },
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

export const dealDetailsWithFilters = catchAsync(async (req, res) => {
    const { offset, limit, search, status, paymentStatus, isSlotCompleted } =
        allDealsListSchema.parse(req.body);

    const dealData = Deal.find({
        ...(search && { productName: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: status === 'active' }),
        ...(paymentStatus && { paymentStatus }),
        ...(isSlotCompleted === 'completed' && { isSlotCompleted: true }),
        ...(isSlotCompleted === 'uncompleted' && { isSlotCompleted: false }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .skip(offset || 0)
        .limit(limit || 20)
        .sort({ createdAt: -1 });

    const totalCount = Deal.find({
        ...(search && { productName: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: status === 'active' }),
        ...(paymentStatus && { paymentStatus }),
        ...(isSlotCompleted === 'completed' && { isSlotCompleted: true }),
        ...(isSlotCompleted === 'uncompleted' && { isSlotCompleted: false }),
    }).countDocuments();

    const data = await Promise.all([dealData, totalCount]);

    return res.status(200).json(
        successResponse({
            data: data[0],
            message: 'Deal Data',
            total: data[1],
        }),
    );
});

export const addDealController = catchAsync(async (req, res) => {
    const body = addDealSchema.parse(req.body);
    const {
        actualPrice,
        brand,
        cashBack,
        dealCategory,
        platForm,
        postUrl,
        productCategories,
        productName,
        slotAlloted,
        isActive,
        termsAndCondition,
        adminCommission,
    } = body;
    const newDeal = await Deal.create({
        actualPrice,
        brand,
        cashBack,
        dealCategory,
        platForm,
        postUrl,
        productCategories,
        productName,
        slotAlloted,
        termsAndCondition,
        adminCommission,
        isActive: isActive === false ? false : true, // we want by default  active true  so if
        //on add time isActive is  false it will false other wise it will be all time true
        // we can edit on edit api
    });
    const DealRes = await newDeal.save();
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
        cashBack,
        dealCategory,
        platForm,
        postUrl,
        productCategories,
        productName,
        slotAlloted,
        isActive,
        termsAndCondition,
        adminCommission,
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
            cashBack,
            dealCategory,
            platForm,
            postUrl,
            productCategories,
            productName,
            slotAlloted,
            termsAndCondition,
            adminCommission,
            ...(isActive && { isActive }),
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
export const activeDealsController = catchAsync(async (req, res) => {
    const { limit, offset, search } = filterSchema.parse(req.body);
    const activelyDeals = Deal.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
        ...(search && { productName: { $regex: search, $options: 'i' } }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .sort({ createdAt: -1 })
        .skip(offset || 0)
        .limit(limit || 20);
    const total = Deal.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
        ...(search && { productName: { $regex: search, $options: 'i' } }),
    }).countDocuments();
    const data = await Promise.all([activelyDeals, total]);
    if (activelyDeals) {
        return res.status(200).json(
            successResponse({
                message: 'Deals Fetched',
                data: data[0],
                total: data[1],
            }),
        );
    }
});

export const getDealsWithBrandId = catchAsync(async (req, res) => {
    const { brandId } = getDealsWithBrandIdSchema.parse(req.params);

    const deals = await Deal.find({ ...(brandId && { brand: brandId }) });

    return res.status(200).json(
        successResponse({
            message: 'Deals Fetched of brand!',
            data: deals,
        }),
    );
});
//# sourceMappingURL=dealController.js.map
