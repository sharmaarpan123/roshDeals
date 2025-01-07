import express from 'express';
import AdminAccessMiddleware from '../utilities/Middlewares/AdminAccessMiddleware.js';
import { permissionsLevelKey } from '../utilities/Const.js';
import SubAdminDealController from '../controllers/SubAdminController/DealController/DealController.js';

const SubAdminRouter = express.Router();

const canSubAdminAccess = true;
const canAdminAccess = true;

SubAdminRouter.post(
    '/deal/clone',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
        canSubAdminAccess,
    }),
    SubAdminDealController.cloneDealController,
);

SubAdminRouter.post(
    '/myAgencyDealAsMed/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canAdd,
        canSubAdminAccess,
    }),
    SubAdminDealController.getDealOfAdminsWithFilters,
);

SubAdminRouter.get(
    '/myDealsAsMed/getWithFilters',
    AdminAccessMiddleware({
        uniqueSlug: 'deal',
        key: permissionsLevelKey.canView,
        canSubAdminAccess,
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
    }),
    SubAdminDealController.getAgencyDealDetailsAsMed,
);

export default SubAdminRouter;
// # sourceMappingURL=SubAdminRouter.js.map
