import dealCategoryController from '../controllers/DealCategoryController/dealCategoryController.js';
import express from 'express';
const DealCategoryRouter = express.Router();
DealCategoryRouter.get('/getAllDealCategories', dealCategoryController.getAllDealCategoryController);
DealCategoryRouter.get('/getActiveDealCategories', dealCategoryController.getActiveDealCategoriesController);
export default DealCategoryRouter;
//# sourceMappingURL=DealCategoryRouter.js.map