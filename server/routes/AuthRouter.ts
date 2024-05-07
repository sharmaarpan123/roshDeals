import forgetPasswordController from '@/controllers/AuthContoller/forgetPasswordController';
import resetPasswordController from '@/controllers/AuthContoller/resetPassword';
import signInController from '@/controllers/AuthContoller/signInController';
import signupController from '@/controllers/AuthContoller/signupConrollers';
import express from 'express';

const AuthRouter = express.Router();

AuthRouter.post('/signUp', signupController);
AuthRouter.post('/signIn', signInController);
AuthRouter.post('/forgetPassword', forgetPasswordController);
AuthRouter.post('/resetPassword', resetPasswordController);

export default AuthRouter;
