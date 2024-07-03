"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const schema_1 = require("./schema");
const Deal_1 = __importDefault(require("@/database/models/Deal"));
const Responses_1 = require("@/utilities/Responses");
exports.default = (0, catchAsync_1.default)(async (req, res) => {
    const body = schema_1.activeDealByBrandAndCategory.parse(req.body);
    const { type, id, offset, limit } = body;
    const DealData = await Deal_1.default.find({
        isDeleted: false,
        isActive: true,
        isSlotCompleted: false,
        ...(type === schema_1.SearchEnumType.brand && { brand: id }),
        ...(type === schema_1.SearchEnumType.dealCategory && { dealCategory: id }),
    })
        .populate('brand')
        .populate('dealCategory')
        .populate('platForm')
        .skip(offset)
        .limit(limit);
    return res
        .status(200)
        .json((0, Responses_1.successResponse)({ data: DealData, message: 'Deal Data' }));
});
//# sourceMappingURL=activeDealByBrandAndCategory.js.map