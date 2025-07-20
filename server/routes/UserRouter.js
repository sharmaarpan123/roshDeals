import {
    addPaymentDetails,
    editPaymentDetails,
    getPaymentDetails,
} from '../controllers/UserContorller/paymentDeails/paymentDeails.js';
import PosterController from '../controllers/UserContorller/PosterController/PosterController.js';
import express from 'express';
import UserController from '../controllers/UserContorller/UserController.js';
import {
    activeDealsController,
    dealDetails,
} from '../controllers/UserContorller/DealController/dealController.js';
import brandController from '../controllers/UserContorller/BrandConroller/brandController.js';
import dealCategoryController from '../controllers/UserContorller/DealCategoryController/dealCategoryController.js';
import {
    getOrderById,
    OrderCreateController,
    OrderFromUpdate,
    OrderList,
    reviewFromSubmitController,
    UserEarning,
} from '../controllers/UserContorller/Order/OrderController.js';
import platFormController from '../controllers/UserContorller/PlatFormController/platFormController.js';
import GetHomeResult from '../controllers/UserContorller/GetHomeResult.js';
import activeDealByBrandAndCategory from '../controllers/UserContorller/getDeals/activeDealByBrandAndCategory.js';

const UserRouter = express.Router();
// payment details
UserRouter.get('/me', UserController.meQueryController);
UserRouter.post('/logout', UserController.logout);
// payment
UserRouter.post('/paymentDetails/add', addPaymentDetails);
UserRouter.post('/paymentDetails/edit', editPaymentDetails);
UserRouter.get('/getPaymentDetails', getPaymentDetails);
// posters
UserRouter.get('/getActivePosters', PosterController.getActivePosters);
// support chat
UserRouter.post(
    '/supportChatHistory',
    UserController.supportChatHistoryController,
);

// deal
UserRouter.get('/deal/detail/:dealId', dealDetails);
UserRouter.post('/deal/activeDeals', activeDealsController);
UserRouter.post('/deal/getDealsByIds', activeDealByBrandAndCategory);

// deal category

UserRouter.get(
    '/dealCategory/getAllDealCategories',
    dealCategoryController.getAllDealCategoryController,
);
UserRouter.get(
    '/dealCategory/getActiveDealCategories',
    dealCategoryController.getActiveDealCategoriesController,
);

// brand

UserRouter.post('/brand/getAllBrands', brandController.getAllBrandController);
UserRouter.post(
    '/brand/getActiveBrands',
    brandController.getActiveBrandController,
);

// order

UserRouter.post('/order/create', OrderCreateController);
UserRouter.post('/order/update', OrderFromUpdate);
UserRouter.post('/order/getOrderList', OrderList);
UserRouter.post('/order/reviewFormSubmit', reviewFromSubmitController);
UserRouter.get('/order/userEarning', UserEarning);
UserRouter.get('/order/getOrderById/:orderId', getOrderById);

// plat form
UserRouter.get(
    '/platForm/getAllPlatForms',
    platFormController.getAllPlatFormController,
);
// home data
UserRouter.get('/getHomeData', GetHomeResult);

export default UserRouter;
//# sourceMappingURL=UserRouter.js.map
