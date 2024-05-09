import brandController from '@/controllers/BrandConroller/brandController';
import dealCategoryController from '@/controllers/DealCategoryController/dealCategoryController';
import platFormController from '@/controllers/PlatFormController/platFormController';
import express from 'express';

const AdminRouter = express.Router();

// platforms routes
AdminRouter.post('/platForm/add', platFormController.addPlatFormController);
AdminRouter.post('/platForm/edit', platFormController.editPlatFormController);
AdminRouter.post(
    '/platForm/delete',
    platFormController.deletePlatFormController,
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
    '/dealCategory/delete',
    dealCategoryController.deleteDealCategoryController,
);

// category routes
AdminRouter.post('/brand/add', brandController.addBrandController);
AdminRouter.post('/brand/edit', brandController.editBrandController);
AdminRouter.post('/brand/delete', brandController.deleteBrandController);

export default AdminRouter;
