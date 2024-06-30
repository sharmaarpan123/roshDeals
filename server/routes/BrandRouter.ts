import brandController from '@/controllers/BrandConroller/brandController';
import express from 'express';

const BrandRouter = express.Router();

BrandRouter.post('/getAllBrands', brandController.getAllBrandController);
BrandRouter.post('/getActiveBrands', brandController.getActiveBrandController);

export default BrandRouter;
