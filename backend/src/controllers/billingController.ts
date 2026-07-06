import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

// GET /api/billing
export const getBilling = async (req: Request, res: Response) => {
  try {
    const { patient_id, status } = req.query;
    let query = supabaseAdmin
      .from('billing')
      .select('*, patients(name, phone), appointments(date_time, doctors(name)), payments(*)')
      .order('created_at', { ascending: false });

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/billing
export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_id, patient_id, total_amount, discount } = req.body;

    const { data, error } = await supabaseAdmin
      .from('billing')
      .insert({ appointment_id, patient_id, total_amount, discount: discount || 0 })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/billing/:id/pay
export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount_paid, payment_method, transaction_ref } = req.body;

    const { data: payment, error: payError } = await supabaseAdmin
      .from('payments')
      .insert({ bill_id: parseInt(id), amount_paid, payment_method, transaction_ref })
      .select()
      .single();

    if (payError) throw payError;

    const { data: bill } = await supabaseAdmin
      .from('billing')
      .update({ status: 'Paid' })
      .eq('id', id)
      .select()
      .single();

    res.json({ bill, payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reports
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id } = req.query;
    let query = supabaseAdmin
      .from('patient_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (patient_id) query = query.eq('patient_id', patient_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/reports - Upload report (file URL from Supabase Storage)
export const uploadReport = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, record_type, file_url, file_name } = req.body;

    const { data, error } = await supabaseAdmin
      .from('patient_records')
      .insert({ patient_id, record_type, file_url, file_name, uploaded_by: req.user?.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics - Admin analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      { count: totalPatients },
      { count: totalAppointments },
      { count: todayAppointments },
      { data: revenueData },
    ] = await Promise.all([
      supabaseAdmin.from('patients').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true })
        .gte('date_time', new Date().toISOString().split('T')[0] + 'T00:00:00'),
      supabaseAdmin.from('billing').select('total_amount, discount, status').eq('status', 'Paid'),
    ]);

    const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount - b.discount), 0) || 0;

    res.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalRevenue,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
