import express from 'express';
import sellerController from '../controllers/SellerController/SelllerController.js';
import {
    sellerLogout,
    sellerMeQueryController,
} from '../controllers/AdminController/sellerMeQuery.js';
const SellerRouter = express.Router();

// dashboard

SellerRouter.post('/me', sellerMeQueryController);
SellerRouter.post('/logout', sellerLogout);

// Orders
SellerRouter.post('/orders', sellerController.getSellerOrdersByDealId);
SellerRouter.post(
    '/getSellerDeals',
    sellerController.getSellerDealsWithFilters,
);

export default SellerRouter;
