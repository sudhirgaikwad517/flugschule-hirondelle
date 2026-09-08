import { Router } from 'express';
import {
  login, register, getMe, updateMe, changeMyPassword,
  requestLoginOtp, loginWithOtp, requestPasswordResetOtp, resetPasswordWithOtp,
} from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { loginRateLimit, otpRequestRateLimit, otpVerifyRateLimit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/login', loginRateLimit, login);
router.post('/register', register);

router.get('/me', authenticateJWT, getMe);
router.put('/me', authenticateJWT, updateMe);
router.put('/me/password', authenticateJWT, changeMyPassword);

router.post('/login-otp/request', otpRequestRateLimit, requestLoginOtp);
router.post('/login-otp/verify', otpVerifyRateLimit, loginWithOtp);
router.post('/password-reset/request', otpRequestRateLimit, requestPasswordResetOtp);
router.post('/password-reset/confirm', otpVerifyRateLimit, resetPasswordWithOtp);

export default router;
