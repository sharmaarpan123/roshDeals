import {
    addPaymentDetails,
    editPaymentDetails,
    getPaymentDetails,
} from '../controllers/paymentDeails/paymentDeails.js';
import PosterController from '../controllers/PosterController/PosterController.js';
import express from 'express';
import UserController from '../controllers/UserContorller/UserController.js';
const UserRouter = express.Router();
// payment details
UserRouter.get('/me', UserController.meQueryController);
// payment
UserRouter.post('/paymentDetails/add', addPaymentDetails);
UserRouter.post('/paymentDetails/edit', editPaymentDetails);
UserRouter.get('/getPaymentDetails', getPaymentDetails);
// posters
UserRouter.get('/getActivePosters', PosterController.getActivePosters);
// support chat
UserRouter.post('/supportChatHistory', UserController.supportChatHistoryController);

export default UserRouter;
//# sourceMappingURL=UserRouter.js.map
