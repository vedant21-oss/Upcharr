import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { getGeminiModel } from '../config/gemini';
import { logAudit } from '../utils/auditLog';

// GET /api/prescriptions
export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id } = req.query;
    let query = supabaseAdmin
      .from('prescriptions')
      .select('*, patients(name), doctors(name), prescription_items(*, medicines(name, type))')
      .order('created_at', { ascending: false });

    if (patient_id) query = query.eq('patient_id', patient_id);
    if (doctor_id) query = query.eq('doctor_id', doctor_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/prescriptions
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_id, doctor_id, patient_id, diagnosis, advice, follow_up_date, items } = req.body;

    const { data: prescription, error } = await supabaseAdmin
      .from('prescriptions')
      .insert({ appointment_id, doctor_id, patient_id, diagnosis, advice, follow_up_date })
      .select()
      .single();

    if (error) throw error;

    // Add prescription items (medicines)
    if (items && items.length > 0) {
      const prescriptionItems = items.map((item: any) => ({
        prescription_id: prescription.id,
        medicine_id: item.medicine_id,
        dosage: item.dosage,
        instructions: item.instructions
      }));
      await supabaseAdmin.from('prescription_items').insert(prescriptionItems);
    }

    // Create follow-up if date provided
    if (follow_up_date) {
      await supabaseAdmin.from('followups').insert({
        appointment_id,
        followup_date: follow_up_date,
        notes: `Follow-up for: ${diagnosis}`
      });
    }

    // Notify patient
    await supabaseAdmin.from('notifications').insert({
      title: 'New Prescription Available',
      message: `Your doctor has added a new prescription. Diagnosis: ${diagnosis}`,
      type: 'Medicine'
    });

    await logAudit(req, 'CREATE_PRESCRIPTION', 'prescriptions', prescription.id, `Diagnosis: ${diagnosis}`);
    res.status(201).json(prescription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/prescriptions/voice - AI Voice to Prescription
export const voiceToPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { transcript, doctor_id, patient_id, appointment_id } = req.body;

    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    const model = getGeminiModel();
    let structured: any;

    if (model) {
      const prompt = `You are an expert medical AI. Extract structured prescription data from this doctor's spoken transcript.

Transcript: "${transcript}"

Return ONLY a valid JSON object in this exact format:
{
  "diagnosis": "...",
  "medicines": [
    { "name": "...", "dosage": "...", "duration": "...", "instructions": "..." }
  ],
  "advice": "...",
  "follow_up_days": 7,
  "notes": "..."
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      structured = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!structured) {
      structured = {
        diagnosis: 'Pending review',
        medicines: [],
        advice: transcript,
        follow_up_days: 7,
        notes: 'Manually verify transcript'
      };
    }

    // Auto-save prescription
    const follow_up_date = new Date();
    follow_up_date.setDate(follow_up_date.getDate() + (structured.follow_up_days || 7));

    const { data: prescription, error } = await supabaseAdmin
      .from('prescriptions')
      .insert({
        appointment_id, doctor_id, patient_id,
        diagnosis: structured.diagnosis,
        advice: structured.advice,
        follow_up_date: follow_up_date.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    // Save voice note
    await supabaseAdmin.from('voice_notes').insert({
      doctor_id,
      file_url: 'voice-upload',
      transcript,
      length_seconds: 0
    });

    await logAudit(req, 'VOICE_PRESCRIPTION', 'prescriptions', prescription.id, 'Voice-to-prescription AI generated');
    res.status(201).json({ prescription, structured });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
