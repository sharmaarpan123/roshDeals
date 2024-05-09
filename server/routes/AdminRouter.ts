import dealCategoryController from '@/controllers/DealCategoryController/dealCategoryController';
import platFormController from '@/controllers/PlatFormController/platFormController';
import express from 'express';

const AdminRouter = express.Router();

// platforms routes
AdminRouter.post('/addPlatForm', platFormController.addPlatFormController);
AdminRouter.post('/editPlatForm', platFormController.editPlatFormController);
AdminRouter.post(
    '/deletePlatForm',
    platFormController.deletePlatFormController,
);

AdminRouter.get(
    '/getAllPlatForms',
    platFormController.getAllPlatFormController,
);

// category routes
AdminRouter.post(
    '/addDealCategory',
    dealCategoryController.addDealCategoryController,
);
AdminRouter.post(
    '/editDealCategory',
    dealCategoryController.editDealCategoryController,
);
AdminRouter.post(
    '/deleteDealCategory',
    dealCategoryController.deleteDealCategoryController,
);

AdminRouter.get(
    '/getAllDealCategories',
    dealCategoryController.getAllDealCategoryController,
);

export default AdminRouter;
