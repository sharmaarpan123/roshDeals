"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrderController_1 = require("@/controllers/Order/OrderController");
const express_1 = __importDefault(require("express"));
const OrderRouter = express_1.default.Router();
OrderRouter.post('/create', OrderController_1.OrderCreateController);
OrderRouter.post('/update', OrderController_1.OrderFromUpdate);
OrderRouter.get('/getOrderList', OrderController_1.OrderList);
OrderRouter.post('/reviewFormSubmit', OrderController_1.reviewFromSubmitController);
exports.default = OrderRouter;
//# sourceMappingURL=OrderRouter.js.map