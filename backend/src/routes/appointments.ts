import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentsController';

const router = Router();

router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, createAppointment);
router.put('/:id', authenticate, updateAppointment);
router.delete('/:id', authenticate, requireRole('admin', 'receptionist'), deleteAppointment);

export default router;
