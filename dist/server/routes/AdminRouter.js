"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brandController_1 = __importDefault(require("@/controllers/BrandConroller/brandController"));
const dealCategoryController_1 = __importDefault(require("@/controllers/DealCategoryController/dealCategoryController"));
const dealController_1 = require("@/controllers/DealController/dealController");
const OrderController_1 = require("@/controllers/Order/OrderController");
const platFormController_1 = __importDefault(require("@/controllers/PlatFormController/platFormController"));
const PosterController_1 = __importDefault(require("@/controllers/PosterController/PosterController"));
const express_1 = __importDefault(require("express"));
const AdminRouter = express_1.default.Router();
// platforms routes
AdminRouter.post('/platForm/add', platFormController_1.default.addPlatFormController);
AdminRouter.post('/platForm/edit', platFormController_1.default.editPlatFormController);
AdminRouter.post('/platForm/delete', platFormController_1.default.deletePlatFormController);
// category routes
AdminRouter.post('/dealCategory/add', dealCategoryController_1.default.addDealCategoryController);
AdminRouter.post('/dealCategory/edit', dealCategoryController_1.default.editDealCategoryController);
AdminRouter.post('/dealCategory/delete', dealCategoryController_1.default.deleteDealCategoryController);
// category routes
AdminRouter.post('/brand/add', brandController_1.default.addBrandController);
AdminRouter.post('/brand/edit', brandController_1.default.editBrandController);
AdminRouter.post('/brand/delete', brandController_1.default.deleteBrandController);
// category routes
AdminRouter.post('/poster/add', PosterController_1.default.addPosterController);
AdminRouter.post('/poster/edit', PosterController_1.default.editPosterController);
AdminRouter.post('/poster/delete', PosterController_1.default.deletePosterController);
AdminRouter.post('/poster/statusChange', PosterController_1.default.statusChangeController);
AdminRouter.get('/poster/getAllPosters', PosterController_1.default.getAllPosterController);
//  deal
AdminRouter.post('/deal/add', dealController_1.addDealController);
AdminRouter.post('/deal/edit', dealController_1.editDealController);
// orders
AdminRouter.post('/order/acceptOrder', OrderController_1.acceptRejectOrder);
exports.default = AdminRouter;
//# sourceMappingURL=AdminRouter.js.map