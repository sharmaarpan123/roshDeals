import platFormController from '../controllers/PlatFormController/platFormController.js';
import express from 'express';
const PlatFromRouter = express.Router();
PlatFromRouter.get('/getAllPlatForms', platFormController.getAllPlatFormController);
export default PlatFromRouter;
//# sourceMappingURL=PlatFromRouter.js.map