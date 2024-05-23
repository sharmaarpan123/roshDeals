import brandController from '@/controllers/BrandConroller/brandController';
import express from 'express';

const BrandRouter = express.Router();

BrandRouter.get('/getAllBrands', brandController.getAllBrandController);
BrandRouter.get('/getActiveBrands', brandController.getActiveBrandController);

export default BrandRouter;
