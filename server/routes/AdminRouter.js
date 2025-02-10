import express from 'express';
import AdminModuleController from '../controllers/AdminController/AdminModule/AdminModuleController.js';
import brandController from '../controllers/AdminController/BrandConroller/brandController.js';
import chatController from '../controllers/AdminController/ChatController/ChatController.js';
import { dashboardController } from '../controllers/AdminController/dashBoardController.js';
import dealCategoryController from '../controllers/AdminController/DealCategoryController/dealCategoryController.js';
import {
    addDealController,
    allDeals,
    bulkAddDealController,
    dealDetails,
    dealDetailsWithFilters,
    dealPaymentStatusChangeController,
    dealStatusChangeController,
    editDealController,
    getDealsWithBrandId,
} from '../controllers/AdminController/DealController/dealController.js';
import { adminMeQueryController } from '../controllers/AdminController/meQuery.js';
import { sendNotificationController } from '../controllers/AdminController/NotificationController/NotificationCotroller.js';
import {
    acceptRejectOrder,
    bulkPaymentStatusUpdate,
    getAllOrders,
    getAllOrdersOfMedAsAgency,
    getAllOrdersOfMedAsMed,
    paymentStatusUpdate,
} from '../controllers/AdminController/Order/OrderController.js';
import platFormController from '../controllers/AdminController/PlatFormController/platFormController.js';
import PosterController from '../controllers/AdminController/PosterController/PosterController.js';
import subAdminController from '../controllers/AdminController/SubAdmin/SubAdminController.js';
import {
    activeInActiveUserController,
    getAllUsersController,
    getUserByIdController,
    updateUserController,
} from '../controllers/AdminController/userController/Usercontroller.js';
import { permissionsLevelKey } from '../utilities/Const.js';
import AdminAccessMiddleware from '../utilities/Middlewares/AdminAccessMiddleware.js';
const AdminRouter = express.Router();

// dashboard

const canAdminAccess = true;
const canSubAdminAccess = true;

AdminRouter.post('/me', adminMeQueryController);

AdminRouter.post(
    '/dashboard',
    AdminAccessMiddleware({
        uniqueSlug: 'dashboard',
        key: permissionsLevelKey.canView,
        canAdminAccess,
    }),
    dashboardController,
);

//  subAdmin

AdminRouter.post(
    '/add/subAdmin',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canAdd,
        canAdminAccess,
    }),
    subAdminController.addSubAdminController,
);

AdminRouter.post(
    '/isUserNameExists',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canView,
        canAdminAccess,
    }),
    subAdminController.checkIsUserNameExists,
);

AdminRouter.get(
    '/subAdmin/getAllWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
    }),
    subAdminController.getSubAdminListWithFilter,
);
AdminRouter.get(
    '/subAdmin/getById/:adminId',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canView,
        canAdminAccess,
    }),
    subAdminController.getSubAdminById,
);
AdminRouter.post(
    '/update/subAdmin',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
    }),
    subAdminController.updateSubAdminController,
);

AdminRouter.post(
    '/manageAdminSubAdminRelation',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
    }),
    subAdminController.manageAdminSubAdminRelation,
);

AdminRouter.post(
    '/linkedSubAdmin',
    AdminAccessMiddleware({
        uniqueSlug: 'systemAccess',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
    }),
    subAdminController.linkSubAdminByAdmin,
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
        canAdminAccess,
        canSubAdminAccess,
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
        canAdminAccess,
        canSubAdminAccess,
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
        canAdminAccess,
        canSubAdminAccess,
    }),
    platFormController.getPlatFormById,
);
// category routes

AdminRouter.get(
    '/dealCategory/getAllDealCategories',
    AdminAccessMiddleware({
        uniqueSlug: 'dealCategory',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
    }),
    dealCategoryController.getAllDealCategoryWithFilters,
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
        canAdminAccess,
        canSubAdminAccess,
    }),
    dealCategoryController.getDealCategoryByIdController,
);
// brand routes

AdminRouter.post(
    '/brand/getAllWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'brand',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
    }),
    brandController.getAllBrandWithCFilters,
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
        canAdminAccess,
        canSubAdminAccess,
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
        canAdminAccess,
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
        canAdminAccess,
    }),
    editDealController,
);
AdminRouter.post(
    '/deal/all/withFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
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
    '/deal/detail/:dealId',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canAdminAccess,
    }),
    dealDetails,
);

AdminRouter.post(
    '/deal/getDealWithBrandId',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canAdminAccess,
        canSubAdminAccess,
    }),
    getDealsWithBrandId,
);
AdminRouter.post(
    '/deal/updatePaymentStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
        canSubAdminAccess,
    }),
    dealPaymentStatusChangeController,
);
AdminRouter.post(
    '/deal/updateStatus',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
        canSubAdminAccess,
    }),
    dealStatusChangeController,
);

// orders
AdminRouter.post(
    '/order/acceptRejectOrder',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
        canSubAdminAccess,
    }),
    acceptRejectOrder,
);
AdminRouter.post(
    '/orders/all',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
    }),
    getAllOrders,
);

AdminRouter.post(
    '/ordersOfMedAsAgency/all',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
    }),
    getAllOrdersOfMedAsAgency,
);

AdminRouter.post(
    '/ordersOfMedAsMed/all',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
    }),
    getAllOrdersOfMedAsMed,
);

AdminRouter.post(
    '/medOrdersAsAgency/all',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canViewList,
        canAdminAccess,
        canSubAdminAccess,
    }),
    getAllOrdersOfMedAsAgency,
);
AdminRouter.post(
    '/order/paymentStatusUpdate',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
        canSubAdminAccess,
    }),
    paymentStatusUpdate,
);
AdminRouter.post(
    '/order/bulkPaymentStatusUpdate',
    AdminAccessMiddleware({
        uniqueSlug: 'order',
        key: permissionsLevelKey.canEdit,
        canAdminAccess,
        canSubAdminAccess,
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
