import {
    activeDealsController,
    dealDetails,
} from '../controllers/DealController/dealController';
import express from 'express';

const DealRouter = express.Router();

DealRouter.get('/detail/:dealId', dealDetails);
DealRouter.post('/activeDeals', activeDealsController);

export default DealRouter;
