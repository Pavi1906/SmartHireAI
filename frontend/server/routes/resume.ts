import { Router } from 'express';
import { resumeController } from '../controllers/resumeController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // All resume routes require auth
router.use(authorize(['STUDENT'])); // Only students manage their resumes

router.post('/upload', resumeController.upload);
router.get('/active', resumeController.getActive);

export default router;
