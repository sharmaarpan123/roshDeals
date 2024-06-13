import {
    OrderCreateController,
    OrderList,
} from '@/controllers/Order/OrderController';
import express from 'express';

const OrderRouter = express.Router();

OrderRouter.post('/create', OrderCreateController);
OrderRouter.get('/getOrderList', OrderList);

export default OrderRouter;
