import express from 'express';
import AdminAccessMiddleware from '../utilities/Middlewares/AdminAccessMiddleware.js';
import { permissionsLevelKey } from '../utilities/Const.js';
import SubAdminDealController from '../controllers/SubAdminController/DealController/DealController.js';
import { dashboardController } from '../controllers/SubAdminController/DashboardController/dashboardController.js';

const SubAdminRouter = express.Router();

const canSubAdminAccess = true;
const canAdminAccess = true;

SubAdminRouter.post(
    '/dashboard',
    AdminAccessMiddleware({
        uniqueSlug: 'dashboard',
        key: permissionsLevelKey.canAdd,
        canSubAdminAccess,
        canAdminAccess,
    }),
    dashboardController,
);

SubAdminRouter.post(
    '/deal/clone',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
        canSubAdminAccess,
        canAdminAccess,
    }),
    SubAdminDealController.cloneDealController,
);

SubAdminRouter.post(
    '/myAgencyDealAsMed/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
        canSubAdminAccess,
        canAdminAccess,
    }),
    SubAdminDealController.getDealOfAdminsWithFilters,
);

SubAdminRouter.post(
    '/myDealsAsMed/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canSubAdminAccess,
        canAdminAccess,
    }),
    SubAdminDealController.getMyDealAsMedWithFilters,
);

SubAdminRouter.post(
    '/myMedDealsAsAgency/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canAdminAccess,
    }),
    SubAdminDealController.getDealsOfSubAdminsAsAgencyWithFilters,
);

SubAdminRouter.get(
    '/myAgencyDealAsMed/detail/:dealId',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canSubAdminAccess,
        canAdminAccess,
    }),
    SubAdminDealController.getAgencyDealDetailsAsMed,
);

SubAdminRouter.get(
    '/myDealAsMed/detail/:dealId',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canSubAdminAccess,
        canAdminAccess,
    }),
    SubAdminDealController.getAgencyDealDetailsAsMed,
);

export default SubAdminRouter;
// # sourceMappingURL=SubAdminRouter.js.map
