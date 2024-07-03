"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const platFormController_1 = __importDefault(require("@/controllers/PlatFormController/platFormController"));
const express_1 = __importDefault(require("express"));
const PlatFromRouter = express_1.default.Router();
PlatFromRouter.get('/getAllPlatForms', platFormController_1.default.getAllPlatFormController);
exports.default = PlatFromRouter;
//# sourceMappingURL=PlatFromRouter.js.map