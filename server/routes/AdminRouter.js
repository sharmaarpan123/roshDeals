import brandController from '../controllers/BrandConroller/brandController.js';
import dealCategoryController from '../controllers/DealCategoryController/dealCategoryController.js';
import { addDealController, editDealController, } from '../controllers/DealController/dealController.js';
import { acceptRejectOrder } from '../controllers/Order/OrderController.js';
import platFormController from '../controllers/PlatFormController/platFormController.js';
import PosterController from '../controllers/PosterController/PosterController.js';
import express from 'express';
const AdminRouter = express.Router();
// platforms routes
AdminRouter.post('/platForm/add', platFormController.addPlatFormController);
AdminRouter.post('/platForm/edit', platFormController.editPlatFormController);
AdminRouter.post('/platForm/delete', platFormController.deletePlatFormController);
AdminRouter.get('/platForm/getById/:platFormId', platFormController.getPlatFormById);
// category routes
AdminRouter.post('/dealCategory/add', dealCategoryController.addDealCategoryController);
AdminRouter.post('/dealCategory/edit', dealCategoryController.editDealCategoryController);
AdminRouter.post('/dealCategory/delete', dealCategoryController.deleteDealCategoryController);
AdminRouter.get('/dealCategory/getById/:dealCategoryId', dealCategoryController.getDealCategoryByIdController);
// category routes
AdminRouter.post('/brand/add', brandController.addBrandController);
AdminRouter.post('/brand/edit', brandController.editBrandController);
AdminRouter.post('/brand/delete', brandController.deleteBrandController);
AdminRouter.get('/brand/getById/:brandId', brandController.geBrandByIdController);
// category routes
AdminRouter.post('/poster/add', PosterController.addPosterController);
AdminRouter.post('/poster/edit', PosterController.editPosterController);
AdminRouter.post('/poster/delete', PosterController.deletePosterController);
AdminRouter.post('/poster/statusChange', PosterController.statusChangeController);
AdminRouter.get('/poster/getAllPosters', PosterController.getAllPosterController);
//  deal
AdminRouter.post('/deal/add', addDealController);
AdminRouter.post('/deal/edit', editDealController);
// orders
AdminRouter.post('/order/acceptOrder', acceptRejectOrder);
export default AdminRouter;
//# sourceMappingURL=AdminRouter.js.map