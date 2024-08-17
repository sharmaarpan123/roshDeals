import express from 'express';
import brandController from '../controllers/BrandConroller/brandController.js';
import dealCategoryController from '../controllers/DealCategoryController/dealCategoryController.js';
import {
    addDealController,
    allDeals,
    bulkAddDealController,
    dealDetailsWithFilters,
    dealPaymentStatusChangeController,
    dealStatusChangeController,
    editDealController,
    getDealsWithBrandId,
} from '../controllers/DealController/dealController.js';
import {
    acceptRejectOrder,
    bulkPaymentStatusUpdate,
    getAllOrders,
    paymentStatusUpdate,
} from '../controllers/Order/OrderController.js';
import platFormController from '../controllers/PlatFormController/platFormController.js';
import PosterController from '../controllers/PosterController/PosterController.js';
import {
    activeInActiveUserController,
    getAllUsersController,
    getUserByIdController,
    updateUserController,
} from '../controllers/userController/userController.js'; 
const AdminRouter = express.Router();

// user
AdminRouter.post('/user/getAllUsers/withFilters', getAllUsersController);
AdminRouter.post('/user/updateStatus', activeInActiveUserController);
AdminRouter.get('/user/getUserById/:userId', getUserByIdController);
AdminRouter.post('/user/updateUser', updateUserController);

// platforms routes
AdminRouter.post('/platForm/add', platFormController.addPlatFormController);
AdminRouter.post('/platForm/edit', platFormController.editPlatFormController);
AdminRouter.post(
    '/platForm/updateStatus',
    platFormController.platFormStatusChangeController,
);
AdminRouter.get(
    '/platForm/getById/:platFormId',
    platFormController.getPlatFormById,
);
// category routes
AdminRouter.post(
    '/dealCategory/add',
    dealCategoryController.addDealCategoryController,
);
AdminRouter.post(
    '/dealCategory/edit',
    dealCategoryController.editDealCategoryController,
);
AdminRouter.post(
    '/dealCategory/updateStatus',
    dealCategoryController.DealCategoryUpdateStatusController,
);
AdminRouter.get(
    '/dealCategory/getById/:dealCategoryId',
    dealCategoryController.getDealCategoryByIdController,
);
// category routes
AdminRouter.post('/brand/add', brandController.addBrandController);
AdminRouter.post('/brand/edit', brandController.editBrandController);
AdminRouter.post('/brand/updateStatus', brandController.updateStatusController);
AdminRouter.get(
    '/brand/getById/:brandId',
    brandController.geBrandByIdController,
);
// category routes
AdminRouter.post('/poster/add', PosterController.addPosterController);
AdminRouter.post('/poster/edit', PosterController.editPosterController);
AdminRouter.post('/poster/delete', PosterController.deletePosterController);
AdminRouter.post(
    '/poster/statusChange',
    PosterController.statusChangeController,
);
AdminRouter.get(
    '/poster/getAllPosters',
    PosterController.getAllPosterController,
);
AdminRouter.get('/poster/getById/:posterId', PosterController.getPosterById);
//  deal
AdminRouter.post('/deal/add', addDealController);
AdminRouter.post('/deal/bulk-add', bulkAddDealController);
AdminRouter.post('/deal/edit', editDealController);
AdminRouter.post('/deal/all/withFilters', dealDetailsWithFilters);
AdminRouter.get('/deal/all/allDeals', allDeals);

AdminRouter.get('/deal/getDealWithBrandId/:brandId', getDealsWithBrandId);
AdminRouter.post(
    '/deal/updatePaymentStatus',
    dealPaymentStatusChangeController,
);
AdminRouter.post('/deal/updateStatus', dealStatusChangeController);

// orders
AdminRouter.post('/order/acceptRejectOrder', acceptRejectOrder);
AdminRouter.post('/orders/all', getAllOrders);
AdminRouter.post('/order/paymentStatusUpdate', paymentStatusUpdate);
AdminRouter.post('/order/bulkPaymentStatusUpdate', bulkPaymentStatusUpdate);

export default AdminRouter;
// # sourceMappingURL=AdminRouter.js.map
