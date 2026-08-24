import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { authenticateJWT, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);

// Example protected route
router.get('/me', authenticateJWT, (req: AuthRequest, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

export default router;
