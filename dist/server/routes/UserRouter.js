import { addPaymentDetails, editPaymentDetails, getPaymentDetails, } from '../controllers/userController/paymentDeails/paymentDeails.js';
import express from 'express';
const UserRouter = express.Router();
// payment details
UserRouter.post('/paymentDetails/add', addPaymentDetails);
UserRouter.post('/paymentDetails/edit', editPaymentDetails);
UserRouter.get('/getPaymentDetails', getPaymentDetails);
export default UserRouter;
//# sourceMappingURL=UserRouter.js.map