import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { getGeminiModel } from '../config/gemini';

// POST /api/ai/chat
export const aiChat = async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const model = getGeminiModel();
    if (!model) {
      // Fallback responses
      const userMsg = message.toLowerCase();
      let response = "I'm Upchaar's AI health assistant. How can I help you today?";
      if (userMsg.includes('fever') || userMsg.includes('temperature')) {
        response = 'A fever above 38°C (100.4°F) may indicate an infection. Stay hydrated, rest well. If it persists beyond 3 days or rises above 40°C, please consult a doctor immediately.';
      } else if (userMsg.includes('book') || userMsg.includes('appointment')) {
        response = 'To book an appointment, go to the Appointments section and choose your preferred doctor and time slot. I can also help you find the right specialist!';
      } else if (userMsg.includes('doctor')) {
        response = 'Upchaar connects you with verified specialists: Dr. Aarav Sharma (General Physician), Dr. Ananya Patel (Pediatrics), Dr. Vikram Mehta (Cardiology), and more.';
      }
      return res.json({ response, source: 'fallback' });
    }

    const systemContext = `You are Upchaar AI, a professional healthcare assistant for a clinic management platform. 
    You respond in ${language === 'en' ? 'English' : language} when asked.
    You help with: appointment booking guidance, symptom assessment, health tips, medicine reminders, and FAQ answers.
    Always remind patients that AI advice does not replace professional medical evaluation.
    Be empathetic, professional, and concise.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'model', parts: [{ text: 'Understood. I am Upchaar AI, ready to assist.' }] },
        ...chatHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    res.json({ response, source: 'gemini' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/ocr-scan
export const ocrScan = async (req: AuthRequest, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', patient_id } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image data required' });

    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) return res.status(503).json({ error: 'AI service unavailable' });

    const prompt = `You are a medical document OCR expert. Extract all relevant medical information from this report/prescription image.
    Return ONLY a valid JSON object with this structure:
    {
      "document_type": "Prescription/Blood Report/X-Ray Report/etc",
      "date": "YYYY-MM-DD or null",
      "doctor_name": "...",
      "patient_name": "...",
      "diagnosis": "...",
      "medicines": [{ "name": "...", "dosage": "..." }],
      "test_results": [{ "test": "...", "result": "...", "normal_range": "..." }],
      "notes": "..."
    }`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } }
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : { notes: text };

    // Store in patient records if patient_id provided
    if (patient_id && extracted.document_type) {
      await supabaseAdmin.from('lab_reports').insert({
        patient_id,
        test_name: extracted.document_type,
        report_date: extracted.date || new Date().toISOString().split('T')[0],
        results: JSON.stringify(extracted),
        status: 'Completed'
      });
    }

    res.json({ extracted, raw: text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user?.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/read
export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user?.id);

    if (error) throw error;
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
