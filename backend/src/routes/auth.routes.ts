import { Router } from 'express';
import { login, register, getMe, updateMe, changeMyPassword } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/me', authenticateJWT, getMe);
router.put('/me', authenticateJWT, updateMe);
router.put('/me/password', authenticateJWT, changeMyPassword);

export default router;
