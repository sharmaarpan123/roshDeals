"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDealsController = exports.dealDetails = exports.editDealController = exports.addDealController = void 0;
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const Responses_1 = require("@/utilities/Responses");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const schema_1 = require("./schema");
const validations_1 = require("@/utilities/validations");
const ValidationSchema_1 = require("@/utilities/ValidationSchema");
exports.addDealController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.addDealSchema.parse(req.body);
    const { actualPrice, brand, cashBack, dealCategory, platForm, postUrl, productCategories, productName, slotAlloted, isActive, termsAndCondition, } = body;
    const newDeal = await Deal_1.default.create({
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
        isActive: isActive === false ? false : true, // we want by default  active true  so if
        //on add time isActive is  false it will false other wise it will be all time true
        // we can edit on edit api
    });
    const DealRes = await newDeal.save();
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Deal  Added successfully',
        data: DealRes,
    }));
});
exports.editDealController = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.editDealSchema.parse(req.body);
    const { dealId, actualPrice, brand, cashBack, dealCategory, platForm, postUrl, productCategories, productName, slotAlloted, isActive, termsAndCondition, } = body;
    // validating the brandId ,  dealCategoryId ,  platFormId ,  that they are existing on our db
    const inValidMongoIdMessage = await (0, validations_1.validatingMongoObjectIds)({
        brand,
        dealCategory,
        platForm,
    });
    if (inValidMongoIdMessage) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: inValidMongoIdMessage,
        }));
    }
    const dealUpdated = await Deal_1.default.findOneAndUpdate({
        _id: dealId,
    }, {
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
        ...(isActive && { isActive }),
    }, {
        new: true,
    });
    if (dealUpdated) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'updated successfully',
            data: dealUpdated,
        }));
    }
    else {
        return res.status(404).json((0, Responses_1.errorResponse)({
            message: 'Not found any Data with this deal id',
        }));
    }
});
exports.dealDetails = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.getDeal.parse(req.params);
    const { dealId } = body;
    const DealRes = await Deal_1.default.findOne({ _id: dealId })
        .populate('dealCategory')
        .populate('platForm')
        .populate('brand');
    if (!DealRes) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'No Data Found',
        }));
    }
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'Deal Fetched',
        data: DealRes,
    }));
});
exports.activeDealsController = (0, catchAsync_1.default)(async (req, res) => {
    const { limit, offset, search } = ValidationSchema_1.filterSchema.parse(req.body);
    const activelyDeals = Deal_1.default.find({
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
    const total = Deal_1.default.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
        ...(search && { productName: { $regex: search, $options: 'i' } }),
    }).countDocuments();
    const data = await Promise.all([activelyDeals, total]);
    if (activelyDeals) {
        return res.status(200).json((0, Responses_1.successResponse)({
            message: 'Deals Fetched',
            data: data[0],
            total: data[1],
        }));
    }
});
//# sourceMappingURL=dealController.js.map