import express from 'express';
import sellerController from '../controllers/AdminController/Seller/sellerController.js';
import { sellerLogout, sellerMeQueryController } from '../controllers/AdminController/sellerMeQuery.js';
const SellerRouter = express.Router();

// dashboard

SellerRouter.post('/me', sellerMeQueryController);
SellerRouter.post('/logout', sellerLogout);

// Orders
SellerRouter.get('/orders', sellerController.getSellerOrdersByDealId);

export default SellerRouter;

