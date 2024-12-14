import {
    activeDealsController,
    dealDetails,
} from '../controllers/AdminController/DealController/dealController.js';
import express from 'express';
const DealRouter = express.Router();
DealRouter.get('/detail/:dealId', dealDetails);
// DealRouter.post('/activeDeals', activeDealsController);
export default DealRouter;
//# sourceMappingURL=DealRouter.js.map
