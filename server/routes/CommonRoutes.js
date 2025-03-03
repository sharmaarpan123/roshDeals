import { getAllNotifications } from '../controllers/CommonController/NotificationController/NotificationController.js';
import express from 'express';

const CommonRouter = express.Router();
// notifications
CommonRouter.post('/getAllNotifications', getAllNotifications);

export default CommonRouter;
//# sourceMappingURL=AuthRouter.js.map
