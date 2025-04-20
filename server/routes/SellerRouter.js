import express from 'express';
import sellerController from '../controllers/AdminController/Seller/sellerController.js';
import { sellerLogout, sellerMeQueryController } from '../controllers/AdminController/sellerMeQuery.js';
const AdminRouter = express.Router();

// dashboard

SellerRouter.post('/me', sellerMeQueryController);
SellerRouter.post('/logout', sellerLogout);

