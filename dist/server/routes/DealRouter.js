"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dealController_1 = require("@/controllers/DealController/dealController");
const express_1 = __importDefault(require("express"));
const DealRouter = express_1.default.Router();
DealRouter.get('/detail/:dealId', dealController_1.dealDetails);
DealRouter.post('/activeDeals', dealController_1.activeDealsController);
exports.default = DealRouter;
//# sourceMappingURL=DealRouter.js.map