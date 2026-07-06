import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLog';

// GET /api/appointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { doctor_id, patient_id, status, date } = req.query;
    let query = supabaseAdmin
      .from('appointments')
      .select('*, patients(name, phone, email), doctors(name, specialty)')
      .order('date_time', { ascending: true });

    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (status) query = query.eq('status', status);
    if (date) {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;
      query = query.gte('date_time', startOfDay).lte('date_time', endOfDay);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/appointments/:id
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*, patients(*), doctors(*), prescriptions(*), queue(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/appointments
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, doctor_id, date_time, appointment_type, reason } = req.body;
    if (!patient_id || !doctor_id || !date_time) {
      return res.status(400).json({ error: 'patient_id, doctor_id, and date_time are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({ patient_id, doctor_id, date_time, appointment_type: appointment_type || 'Online', reason })
      .select('*, patients(name), doctors(name)')
      .single();

    if (error) throw error;

    // Create queue token
    const tokenNumber = `A-${String(Math.floor(Math.random() * 900) + 100)}`;
    const { data: queueEntry } = await supabaseAdmin.from('queue').insert({
      appointment_id: data.id,
      doctor_id,
      token_number: tokenNumber,
      position: data.id
    }).select().single();

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      user_id: req.user?.id,
      title: 'Appointment Confirmed',
      message: `Your appointment with ${data.doctors?.name} on ${new Date(date_time).toLocaleString()} has been confirmed. Token: ${tokenNumber}`,
      type: 'Appointment'
    });

    await logAudit(req, 'CREATE_APPOINTMENT', 'appointments', data.id, `Appointment for patient ${patient_id}`);
    res.status(201).json({ ...data, queue: queueEntry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/appointments/:id
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id; delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAudit(req, 'UPDATE_APPOINTMENT', 'appointments', parseInt(id), `Status: ${updates.status}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/appointments/:id
export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('appointments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Appointment cancelled' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
