import {
    addPaymentDetails,
    editPaymentDetails,
    getPaymentDetails,
} from '@/controllers/userController/paymentDeails/paymentDeails';
import express from 'express';

const UserRouter = express.Router();

// payment details
UserRouter.post('/paymentDetails/add', addPaymentDetails);
UserRouter.post('/paymentDetails/edit', editPaymentDetails);
UserRouter.get('/getPaymentDetails', getPaymentDetails);

export default UserRouter;
