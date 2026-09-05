import { Router } from 'express';
import {
  login, register, getMe, updateMe, changeMyPassword,
  requestLoginOtp, loginWithOtp, requestPasswordResetOtp, resetPasswordWithOtp,
} from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/me', authenticateJWT, getMe);
router.put('/me', authenticateJWT, updateMe);
router.put('/me/password', authenticateJWT, changeMyPassword);

router.post('/login-otp/request', requestLoginOtp);
router.post('/login-otp/verify', loginWithOtp);
router.post('/password-reset/request', requestPasswordResetOtp);
router.post('/password-reset/confirm', resetPasswordWithOtp);

export default router;
