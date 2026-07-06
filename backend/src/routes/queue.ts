import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getQueue, addToQueue, callNextPatient, completeQueueEntry } from '../controllers/queueController';

const router = Router();

router.get('/', authenticate, getQueue);
router.post('/', authenticate, addToQueue);
router.put('/:id/call', authenticate, callNextPatient);
router.put('/:id/complete', authenticate, completeQueueEntry);

export default router;
