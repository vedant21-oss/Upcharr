import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientsController';

const router = Router();

router.get('/', authenticate, getPatients);
router.get('/:id', authenticate, getPatientById);
router.post('/', authenticate, requireRole('admin', 'receptionist', 'doctor'), createPatient);
router.put('/:id', authenticate, requireRole('admin', 'receptionist', 'doctor'), updatePatient);
router.delete('/:id', authenticate, requireRole('admin'), deletePatient);

export default router;
