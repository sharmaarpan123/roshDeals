import express from 'express';
import AdminModuleController from '../controllers/AdminController/AdminModule/AdminModuleController.js';
import { dashboardController } from '../controllers/AdminController/dashBoardController.js';
import subAdminController from '../controllers/AdminController/SubAdmin/SubAdminController.js';
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
import { sendNotificationController } from '../controllers/NotificationController/NotificationCotroller.js';
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
} from '../controllers/AdminController/userController/Usercontroller.js';
import { permissionsLevelKey } from '../utilities/Const.js';
import AdminAccessMiddleware from '../utilities/Middlewares/AdminAccessMiddleware.js';
import AdminDealCategoryController from '../controllers/AdminController/dealCategory/DealCategoryController.js';
import adminBrandController from '../controllers/AdminController/Brand/BrandController.js';
import chatController from '../controllers/AdminController/ChatController/ChatController.js';
const AdminRouter = express.Router();

// dashboard

AdminRouter.post(
    '/dashboard',
    AdminAccessMiddleware({
        uniqueSlug: 'dashboard',
        key: permissionsLevelKey.canView,
    }),
    dashboardController,
);

//  subAdmin

AdminRouter.post(
    '/add/subAdmin',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canAdd,
    }),
    subAdminController.addSubAdminController,
);
AdminRouter.get(
    '/subAdmin/getAllWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canViewList,
    }),
    subAdminController.getSubAdminListWithFilter,
);
AdminRouter.get(
    '/subAdmin/getById/:adminId',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canView,
    }),
    subAdminController.getSubAdminById,
);
AdminRouter.post(
    '/update/subAdmin',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canEdit,
    }),
    subAdminController.updateSubAdminController,
);

// admin modules
AdminRouter.post(
    '/add/subAdminModule',
    AdminAccessMiddleware({
        uniqueSlug: 'adminModules',
        key: permissionsLevelKey.canAdd,
    }),
    AdminModuleController.AddAdminModuleController,
);

AdminRouter.get(
    '/subAdminModule/getAllWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'adminModules',
        key: permissionsLevelKey.canViewList,
    }),
    AdminModuleController.getAdminModulesListWithFilter,
);
AdminRouter.get(
    '/subAdminModule/getById/:moduleId',
    AdminAccessMiddleware({
        uniqueSlug: 'adminModules',
        key: permissionsLevelKey.canView,
    }),
    AdminModuleController.getAdminModuleById,
);
AdminRouter.post(
    '/update/subAdminModule',
    AdminAccessMiddleware({
        uniqueSlug: 'adminModules',
        key: permissionsLevelKey.canEdit,
    }),
    AdminModuleController.updateAdminModuleController,
);

// user
AdminRouter.post(
    '/user/getAllUsers/withFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'manage-user',
        key: permissionsLevelKey.canViewList,
    }),
    getAllUsersController,
);
AdminRouter.post(
    '/user/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'manage-user',
        key: permissionsLevelKey.canEdit,
    }),
    activeInActiveUserController,
);
AdminRouter.get(
    '/user/getUserById/:userId',
    AdminAccessMiddleware({
        uniqueSlug: 'manage-user',
        key: permissionsLevelKey.canView,
    }),
    getUserByIdController,
);
AdminRouter.post(
    '/user/updateUser',
    AdminAccessMiddleware({
        uniqueSlug: 'manage-user',
        key: permissionsLevelKey.canEdit,
    }),
    updateUserController,
);

// platforms routes
AdminRouter.post(
    '/platForm/add',
    AdminAccessMiddleware({
        uniqueSlug: 'platForm',
        key: permissionsLevelKey.canAdd,
    }),
    platFormController.addPlatFormController,
);

AdminRouter.get(
    '/platForm/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'platForm',
        key: permissionsLevelKey.canViewList,
    }),
    platFormController.getAllPlatFormWithFiltersController,
);
AdminRouter.post(
    '/platForm/edit',
    AdminAccessMiddleware({
        uniqueSlug: 'platForm',
        key: permissionsLevelKey.canEdit,
    }),
    platFormController.editPlatFormController,
);
AdminRouter.post(
    '/platForm/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'platForm',
        key: permissionsLevelKey.canEdit,
    }),
    platFormController.platFormStatusChangeController,
);
AdminRouter.get(
    '/platForm/getById/:platFormId',
    AdminAccessMiddleware({
        uniqueSlug: 'platForm',
        key: permissionsLevelKey.canView,
    }),
    platFormController.getPlatFormById,
);
// category routes

AdminRouter.get(
    '/dealCategory/getAllDealCategories',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canViewList,
    }),
    AdminDealCategoryController.getAllDealCategoryWithFilters,
);

AdminRouter.post(
    '/dealCategory/add',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canAdd,
    }),
    dealCategoryController.addDealCategoryController,
);
AdminRouter.post(
    '/dealCategory/edit',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canEdit,
    }),
    dealCategoryController.editDealCategoryController,
);
AdminRouter.post(
    '/dealCategory/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canEdit,
    }),
    dealCategoryController.DealCategoryUpdateStatusController,
);
AdminRouter.get(
    '/dealCategory/getById/:dealCategoryId',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canView,
    }),
    dealCategoryController.getDealCategoryByIdController,
);
// brand routes

AdminRouter.post(
    '/brand/getAllWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canViewList,
    }),
    adminBrandController.getAllBrandWithCFilters,
);
AdminRouter.post(
    '/brand/add',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canAdd,
    }),
    brandController.addBrandController,
);
AdminRouter.post(
    '/brand/edit',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canEdit,
    }),
    brandController.editBrandController,
);
AdminRouter.post(
    '/brand/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canEdit,
    }),
    brandController.updateStatusController,
);
AdminRouter.get(
    '/brand/getById/:brandId',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canView,
    }),
    brandController.geBrandByIdController,
);
// poster routes
AdminRouter.post(
    '/poster/add',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canAdd,
    }),
    PosterController.addPosterController,
);
AdminRouter.post(
    '/poster/edit',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canEdit,
    }),
    PosterController.editPosterController,
);
AdminRouter.post(
    '/poster/delete',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canEdit,
    }),
    PosterController.deletePosterController,
);
AdminRouter.post(
    '/poster/statusChange',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canEdit,
    }),
    PosterController.statusChangeController,
);
AdminRouter.get(
    '/poster/getAllPosters',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canViewList,
    }),
    PosterController.getAllPosterController,
);
AdminRouter.get(
    '/poster/getById/:posterId',
    AdminAccessMiddleware({
        uniqueSlug: 'poster',
        key: permissionsLevelKey.canView,
    }),
    PosterController.getPosterById,
);
//  deal
AdminRouter.post(
    '/deal/add',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
    }),
    addDealController,
);
AdminRouter.post(
    '/deal/bulk-add',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
    }),
    bulkAddDealController,
);
AdminRouter.post(
    '/deal/edit',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canEdit,
    }),
    editDealController,
);
AdminRouter.post(
    '/deal/all/withFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canViewList,
    }),
    dealDetailsWithFilters,
);
AdminRouter.get(
    '/deal/all/allDeals',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canViewList,
    }),
    allDeals,
);

AdminRouter.get(
    '/deal/getDealWithBrandId/:brandId',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
    }),
    getDealsWithBrandId,
);
AdminRouter.post(
    '/deal/updatePaymentStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canEdit,
    }),
    dealPaymentStatusChangeController,
);
AdminRouter.post(
    '/deal/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canEdit,
    }),
    dealStatusChangeController,
);

// orders
AdminRouter.post(
    '/order/acceptRejectOrder',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
    }),
    acceptRejectOrder,
);
AdminRouter.post(
    '/orders/all',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canViewList,
    }),
    getAllOrders,
);
AdminRouter.post(
    '/order/paymentStatusUpdate',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
    }),
    paymentStatusUpdate,
);
AdminRouter.post(
    '/order/bulkPaymentStatusUpdate',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
    }),
    bulkPaymentStatusUpdate,
);

// notification

AdminRouter.post(
    '/notification/send',
    AdminAccessMiddleware({
        uniqueSlug: 'notification',
        key: permissionsLevelKey.canAdd,
    }),
    sendNotificationController,
);

// support chat

AdminRouter.post(
    '/support/ChatList',
    AdminAccessMiddleware({
        uniqueSlug: 'supportChat',
        key: permissionsLevelKey.canView,
    }),
    chatController.getChatList,
);

AdminRouter.post(
    '/support/ChatHistory',
    AdminAccessMiddleware({
        uniqueSlug: 'supportChat',
        key: permissionsLevelKey.canView,
    }),
    chatController.getChatHistory,
);

export default AdminRouter;
// # sourceMappingURL=AdminRouter.js.map
