import dealCategoryController from '@/controllers/DealCategoryController/dealCategoryController';
import express from 'express';

const DealCategoryRouter = express.Router();

DealCategoryRouter.get(
    '/getAllDealCategories',
    dealCategoryController.getAllDealCategoryController,
);
DealCategoryRouter.get(
    '/getActiveDealCategories',
    dealCategoryController.getActiveDealCategoriesController,
);

export default DealCategoryRouter;
