import forgetPasswordController from '../controllers/AuthContoller/forgetPasswordController.js';
import resetPasswordController from '../controllers/AuthContoller/resetPassword.js';
import signInController from '../controllers/AuthContoller/signInController.js';
import signupController from '../controllers/AuthContoller/signupConrollers.js';
import express from 'express';
const AuthRouter = express.Router();
AuthRouter.post('/signUp', signupController);
AuthRouter.post('/signIn', signInController);
AuthRouter.post('/forgetPassword', forgetPasswordController);
AuthRouter.post('/resetPassword', resetPasswordController);
export default AuthRouter;
//# sourceMappingURL=AuthRouter.js.map
