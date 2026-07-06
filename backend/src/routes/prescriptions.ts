import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getPrescriptions, createPrescription, voiceToPrescription } from '../controllers/prescriptionsController';

const router = Router();

router.get('/', authenticate, getPrescriptions);
router.post('/', authenticate, requireRole('doctor', 'admin'), createPrescription);
router.post('/voice', authenticate, requireRole('doctor', 'admin'), voiceToPrescription);

export default router;
