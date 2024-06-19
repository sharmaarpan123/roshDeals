import {
    OrderCreateController,
    OrderFromUpdate,
    OrderList,
    reviewFromSubmitController,
} from '@/controllers/Order/OrderController';
import express from 'express';

const OrderRouter = express.Router();

OrderRouter.post('/create', OrderCreateController);
OrderRouter.post('/update', OrderFromUpdate);
OrderRouter.get('/getOrderList', OrderList);
OrderRouter.post('/reviewFormSubmit', reviewFromSubmitController);

export default OrderRouter;
