import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

export default router;
