import forgetPasswordController from '@/controllers/AuthContoller/forgetPasswordController';
import resetPasswordController from '@/controllers/AuthContoller/resetPassword';
import signInController from '@/controllers/AuthContoller/signInController';
import signupController from '@/controllers/AuthContoller/signupConrollers';

// import signupController from '../controllers/AuthContoller/signupConrollers';
import express from 'express';
// import signupController from '../controllers/AuthContoller/signupConrollers';

const router = express.Router();

router.post('/signUp', signupController);
router.post('/signIn', signInController);
router.post('/forgetPassword', forgetPasswordController);
router.post('/resetPassword', resetPasswordController);

export default router;
