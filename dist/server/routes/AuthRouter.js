"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgetPasswordController_1 = __importDefault(require("@/controllers/AuthContoller/forgetPasswordController"));
const resetPassword_1 = __importDefault(require("@/controllers/AuthContoller/resetPassword"));
const signInController_1 = __importDefault(require("@/controllers/AuthContoller/signInController"));
const signupConrollers_1 = __importDefault(require("@/controllers/AuthContoller/signupConrollers"));
const express_1 = __importDefault(require("express"));
const AuthRouter = express_1.default.Router();
AuthRouter.post('/signUp', signupConrollers_1.default);
AuthRouter.post('/signIn', signInController_1.default);
AuthRouter.post('/forgetPassword', forgetPasswordController_1.default);
AuthRouter.post('/resetPassword', resetPassword_1.default);
exports.default = AuthRouter;
//# sourceMappingURL=AuthRouter.js.map