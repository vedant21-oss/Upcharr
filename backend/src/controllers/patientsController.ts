import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLog';

// GET /api/patients
export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const from = (parseInt(page as string) - 1) * parseInt(limit as string);
    const to = from + parseInt(limit as string) - 1;

    let query = supabaseAdmin.from('patients').select('*, abha_profiles(*)').range(from, to).order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ data, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/patients/:id
export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        abha_profiles(*),
        medical_history(*),
        appointments(*, doctors(name, specialty)),
        patient_records(*),
        lab_reports(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Patient not found' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/patients
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, date_of_birth, gender, blood_group, address } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const { data, error } = await supabaseAdmin
      .from('patients')
      .insert({ name, email, phone, date_of_birth, gender, blood_group, address })
      .select()
      .single();

    if (error) throw error;
    await logAudit(req, 'CREATE_PATIENT', 'patients', data.id, `Created patient: ${name}`);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/patients/:id
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logAudit(req, 'UPDATE_PATIENT', 'patients', parseInt(id), 'Patient updated');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/patients/:id
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('patients').delete().eq('id', id);
    if (error) throw error;
    await logAudit(req, 'DELETE_PATIENT', 'patients', parseInt(id), 'Patient deleted');
    res.json({ message: 'Patient deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
