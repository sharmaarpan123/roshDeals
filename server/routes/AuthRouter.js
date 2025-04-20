import forgetPasswordController from '../controllers/AuthContoller/forgetPasswordController.js';
import resetPasswordController from '../controllers/AuthContoller/resetPassword.js';
import signInController from '../controllers/AuthContoller/signInController.js';
import signupController from '../controllers/AuthContoller/signupConrollers.js';
import express from 'express';
import SlowRateMiddleWare from '../utilities/Middlewares/SlowRateMiddleWare.js';
import adminSignInController from '../controllers/AuthContoller/adminSignInConroller.js';
import AdminForgetPasswordController from '../controllers/AuthContoller/adminforgetPasswordController.js';
import adminResetPassword from '../controllers/AuthContoller/adminResetPassword.js';
import adminChangePassword from '../controllers/AuthContoller/adminChangePassword.js';
import AuthMiddleware from '../utilities/Middlewares/AuthMiddleware.js';
import { ADMIN_ROLE_TYPE_ENUM, SELLER_ROLE_TYPE_ENUM } from '../utilities/commonTypes.js';
import sellerSignInController from '../controllers/AuthContoller/sellerSignInController.js';
import sellerForgetPasswordController from '../controllers/AuthContoller/sellerforgetPasswordController.js';
import sellerResetPassword from '../controllers/AuthContoller/sellerResetPassword.js';
import sellerChangePassword from '../controllers/AuthContoller/sellerChangePassword.js';
const AuthRouter = express.Router();

AuthRouter.post('/signUp', signupController);
AuthRouter.post('/signIn', signInController);
AuthRouter.post('/forgetPassword',SlowRateMiddleWare(),forgetPasswordController);
AuthRouter.post('/resetPassword', resetPasswordController);
AuthRouter.post('/admin/singIn', adminSignInController);
AuthRouter.post(
    '/admin/forgetPassword',
    SlowRateMiddleWare(),
    AdminForgetPasswordController,
);
AuthRouter.post('/admin/resetPassword', adminResetPassword);
AuthRouter.post(
    '/admin/changePassword',
    AuthMiddleware(Object.values(ADMIN_ROLE_TYPE_ENUM)?.map((role) => role)),
    adminChangePassword,
);

AuthRouter.post('/seller/singIn', sellerSignInController);
AuthRouter.post('/seller/forgetPassword', sellerForgetPasswordController);
AuthRouter.post('/seller/resetPassword', sellerResetPassword);
AuthRouter.post(
    '/seller/changePassword',
    AuthMiddleware(Object.values(SELLER_ROLE_TYPE_ENUM)?.map((role) => role)),
    sellerChangePassword,
);
export default AuthRouter;
//# sourceMappingURL=AuthRouter.js.map
