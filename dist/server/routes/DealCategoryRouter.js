"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dealCategoryController_1 = __importDefault(require("@/controllers/DealCategoryController/dealCategoryController"));
const express_1 = __importDefault(require("express"));
const DealCategoryRouter = express_1.default.Router();
DealCategoryRouter.get('/getAllDealCategories', dealCategoryController_1.default.getAllDealCategoryController);
DealCategoryRouter.get('/getActiveDealCategories', dealCategoryController_1.default.getActiveDealCategoriesController);
exports.default = DealCategoryRouter;
//# sourceMappingURL=DealCategoryRouter.js.map