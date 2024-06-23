"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentDeails_1 = require("@/controllers/userController/paymentDeails/paymentDeails");
const express_1 = __importDefault(require("express"));
const UserRouter = express_1.default.Router();
// payment details
UserRouter.post('/paymentDetails/add', paymentDeails_1.addPaymentDetails);
UserRouter.post('/paymentDetails/edit', paymentDeails_1.editPaymentDetails);
UserRouter.get('/getPaymentDetails', paymentDeails_1.getPaymentDetails);
exports.default = UserRouter;
//# sourceMappingURL=UserRouter.js.map