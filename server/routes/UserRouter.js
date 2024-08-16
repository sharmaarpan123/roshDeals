import {
    addPaymentDetails,
    editPaymentDetails,
    getPaymentDetails,
} from '../controllers/paymentDeails/paymentDeails.js';
import PosterController from '../controllers/PosterController/PosterController.js';
import express from 'express';
const UserRouter = express.Router();
// payment details
UserRouter.post('/paymentDetails/add', addPaymentDetails);
UserRouter.post('/paymentDetails/edit', editPaymentDetails);
UserRouter.get('/getPaymentDetails', getPaymentDetails);
UserRouter.get('/getActivePosters', PosterController.getActivePosters);

export default UserRouter;
//# sourceMappingURL=UserRouter.js.map
