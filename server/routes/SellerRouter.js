import express from 'express';
import sellerController from '../controllers/AdminController/Seller/sellerController.js';
const AdminRouter = express.Router();

// dashboard

AdminRouter.post('/add', sellerController.createSeller);

AdminRouter.post('/link', sellerController.linkSellerDeals);

AdminRouter.post('/getById', sellerController.getSellerById);

AdminRouter.post('/update', sellerController.updateSeller);

AdminRouter.get('/getAllWithFilters', sellerController.getSellerListWithFilter);
AdminRouter.post('/getSellerDeals', sellerController.getSellerDeals);
AdminRouter.post('/removeSellerDeal', sellerController.removeSellerDeal);
AdminRouter.post('/addSellerDeal', sellerController.addSellerDeal);

