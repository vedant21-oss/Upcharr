import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLog';

// GET /api/queue
export const getQueue = async (req: Request, res: Response) => {
  try {
    const { doctor_id } = req.query;
    let query = supabaseAdmin
      .from('queue')
      .select('*, appointments(*, patients(name, phone)), doctors(name)')
      .eq('status', 'Waiting')
      .order('position', { ascending: true });

    if (doctor_id) query = query.eq('doctor_id', doctor_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/queue
export const addToQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_id, doctor_id, token_number } = req.body;

    // Get current max position
    const { data: existing } = await supabaseAdmin
      .from('queue')
      .select('position')
      .eq('doctor_id', doctor_id)
      .eq('status', 'Waiting')
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 1;

    const { data, error } = await supabaseAdmin
      .from('queue')
      .insert({ appointment_id, doctor_id, token_number, position: nextPosition })
      .select()
      .single();

    if (error) throw error;

    // Update waiting time
    await supabaseAdmin.from('waiting_time').upsert({
      doctor_id,
      average_mins: nextPosition * 12,
      updated_at: new Date().toISOString()
    }, { onConflict: 'doctor_id' });

    await logAudit(req, 'ADD_TO_QUEUE', 'queue', data.id, `Token: ${token_number}`);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/queue/:id/call - Call next patient
export const callNextPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('queue')
      .update({ status: 'Calling' })
      .eq('id', id)
      .select('*, appointments(*, patients(name))')
      .single();

    if (error) throw error;

    // Notify patient
    if (data.appointments?.patients?.name) {
      await supabaseAdmin.from('notifications').insert({
        title: 'Your Turn',
        message: `${data.appointments.patients.name}, please proceed to the doctor's cabin. Token: ${data.token_number}`,
        type: 'Queue'
      });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/queue/:id/complete - Mark complete
export const completeQueueEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data: queueItem } = await supabaseAdmin
      .from('queue')
      .update({ status: 'Completed' })
      .eq('id', id)
      .select()
      .single();

    // Update appointment status
    if (queueItem?.appointment_id) {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'Completed' })
        .eq('id', queueItem.appointment_id);
    }

    res.json({ message: 'Queue entry completed', data: queueItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
