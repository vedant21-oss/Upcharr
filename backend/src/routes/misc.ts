import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { aiChat, ocrScan, getNotifications, markNotificationsRead } from '../controllers/aiController';
import { getBilling, createBill, recordPayment, getReports, uploadReport, getAnalytics } from '../controllers/billingController';

const router = Router();

// AI routes
router.post('/ai/chat', aiChat);
router.post('/ai/ocr', authenticate, ocrScan);

// Notifications
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/read', authenticate, markNotificationsRead);

// Billing & Payments
router.get('/billing', authenticate, getBilling);
router.post('/billing', authenticate, requireRole('admin', 'receptionist'), createBill);
router.post('/billing/:id/pay', authenticate, requireRole('admin', 'receptionist'), recordPayment);

// Reports & Records
router.get('/reports', authenticate, getReports);
router.post('/reports', authenticate, uploadReport);

// Analytics
router.get('/analytics', authenticate, requireRole('admin'), getAnalytics);

export default router;
