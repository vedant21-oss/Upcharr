const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const ROOT = path.resolve(__dirname);

// ── Supabase ──────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(ROOT));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'Supabase PostgreSQL', timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role: role || 'patient' }
    });
    if (authError) throw new Error(authError.message);

    // Also insert into patients or staff table
    const userId = authData.user.id;
    try {
      if (role === 'patient' || !role) {
        await supabase.from('patients').insert({ user_id: userId, name, email });
      } else if (role === 'doctor') {
        await supabase.from('doctors').insert({ user_id: userId, name, email });
      } else {
        await supabase.from('staff').insert({ user_id: userId, name, email, role });
      }
    } catch (_) { /* ignore profile insert errors */ }

    res.status(201).json({ success: true, message: 'Account created. You can now sign in.' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = data.user;
    const role = user.user_metadata?.role || 'patient';
    const name = user.user_metadata?.name || email.split('@')[0];

    res.json({
      success: true,
      token: data.session.access_token,
      user: { id: user.id, email: user.email, name, role }
    });
  } catch (err) { res.status(401).json({ error: err.message }); }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) await supabase.auth.admin.signOut(token).catch(() => {});
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { res.json({ success: true }); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.user_metadata?.name, role: user.user_metadata?.role || 'patient' } });
  } catch (err) { res.status(401).json({ error: err.message }); }
});

// ── Seed demo accounts ─────────────────────────────────────
app.post('/api/auth/seed-demo', async (req, res) => {
  const demoAccounts = [
    { email: 'admin@upchaar.in',     name: 'Admin User',     role: 'admin' },
    { email: 'doctor@upchaar.in',    name: 'Dr. Aarav Demo', role: 'doctor' },
    { email: 'reception@upchaar.in', name: 'Priya Reception', role: 'receptionist' },
    { email: 'patient@upchaar.in',   name: 'Rahul Patient',  role: 'patient' },
  ];
  const results = [];
  for (const acc of demoAccounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email, password: 'Upchaar@123', email_confirm: true,
      user_metadata: { name: acc.name, role: acc.role }
    });
    results.push({ email: acc.email, status: error ? error.message : 'created' });
  }
  res.json({ success: true, results });
});

// ══════════════════════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════════════════════

app.get('/api/patients', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients').select('*, medical_history(*), lab_reports(*)')
      .eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone, date_of_birth, gender, blood_group, address } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const { data, error } = await supabase.from('patients').insert({ name, email, phone, date_of_birth, gender, blood_group, address }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id; delete updates.created_at;
    const { data, error } = await supabase.from('patients').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('patients').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════

app.get('/api/appointments', async (req, res) => {
  try {
    const { doctor_id, patient_id, status, date } = req.query;
    let query = supabase.from('appointments')
      .select('*, patients(name, phone, email), doctors(name, specialty)')
      .order('date_time', { ascending: true });
    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (status) query = query.eq('status', status);
    if (date) query = query.gte('date_time', `${date}T00:00:00`).lte('date_time', `${date}T23:59:59`);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_name, patient_phone, doctor, department, appointment_date, appointment_time, reason, appointment_type } = req.body;

    // Try to find or create patient
    let patient_id = null;
    if (patient_name) {
      let { data: existing } = await supabase.from('patients').select('id').eq('phone', patient_phone || '').single();
      if (existing) {
        patient_id = existing.id;
      } else {
        const { data: newPatient } = await supabase.from('patients').insert({ name: patient_name, phone: patient_phone }).select().single();
        if (newPatient) patient_id = newPatient.id;
      }
    }

    // Find doctor by name
    let doctor_id = null;
    if (doctor) {
      const { data: doc } = await supabase.from('doctors').select('id').ilike('name', `%${doctor}%`).single();
      if (doc) doctor_id = doc.id;
    }

    const date_time = appointment_date && appointment_time
      ? `${appointment_date}T${appointment_time}:00`
      : new Date().toISOString();

    const tokenNumber = `A-${String(Math.floor(Math.random() * 900) + 100)}`;

    const { data, error } = await supabase.from('appointments').insert({
      patient_id, doctor_id, date_time,
      status: 'Scheduled',
      appointment_type: appointment_type || 'Online',
      reason
    }).select('*, patients(name), doctors(name)').single();

    if (error) throw error;

    // Add to queue
    if (doctor_id) {
      const { data: existing } = await supabase.from('queue').select('position').eq('doctor_id', doctor_id).eq('status', 'Waiting').order('position', { ascending: false }).limit(1);
      const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 1;
      await supabase.from('queue').insert({ appointment_id: data.id, doctor_id, token_number: tokenNumber, position: nextPos });
    }

    res.status(201).json({ success: true, data: { ...data, token: tokenNumber } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id; delete updates.created_at;
    const { data, error } = await supabase.from('appointments').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('appointments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// QUEUE
// ══════════════════════════════════════════════════════════

app.get('/api/queue', async (req, res) => {
  try {
    const { doctor_id } = req.query;
    let query = supabase.from('queue')
      .select('*, appointments(*, patients(name, phone)), doctors(name)')
      .in('status', ['Waiting', 'Calling'])
      .order('position', { ascending: true });
    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/queue/checkin', async (req, res) => {
  try {
    const { token_number } = req.body;
    const { data, error } = await supabase.from('queue')
      .select('*, appointments(*, patients(name))')
      .eq('token_number', token_number).single();
    if (error || !data) return res.status(404).json({ success: false, error: 'Token not found' });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/queue/:id/call', async (req, res) => {
  try {
    const { data, error } = await supabase.from('queue').update({ status: 'Calling' }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/queue/:id/complete', async (req, res) => {
  try {
    const { data, error } = await supabase.from('queue').update({ status: 'Completed' }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (data?.appointment_id) {
      await supabase.from('appointments').update({ status: 'Completed' }).eq('id', data.appointment_id);
    }
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// DOCTORS
// ══════════════════════════════════════════════════════════

app.get('/api/doctors', async (req, res) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*').eq('is_available', true);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// AI CHAT (Gemini)
// ══════════════════════════════════════════════════════════

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    let reply;
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are Upchaar AI, a professional healthcare assistant for an Indian clinic management platform.
      Respond in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
      User message: "${message}"
      Provide helpful, empathetic, concise medical guidance. Always remind to consult a doctor for serious issues.`;
      const result = await model.generateContent(prompt);
      reply = result.response.text();
    } catch (aiErr) {
      // Fallback responses
      const msg = message.toLowerCase();
      if (msg.includes('fever') || msg.includes('bukhar')) reply = 'Fever above 38°C needs attention. Stay hydrated and rest. If fever persists more than 3 days or goes above 40°C, please visit a doctor immediately.';
      else if (msg.includes('appointment') || msg.includes('book')) reply = 'You can book an appointment by clicking "Book Appointment" button. Choose your doctor, date, and time. You will receive a token number for the queue!';
      else if (msg.includes('abha')) reply = 'ABHA (Ayushman Bharat Health Account) is your digital health ID. Enter your 14-digit ABHA number in the Digital Health Locker section to link your health records.';
      else if (msg.includes('queue') || msg.includes('wait')) reply = 'You can check the live queue in the Queue Status section. When your token is called, please proceed to the doctor\'s cabin.';
      else reply = 'I\'m Upchaar AI, your healthcare assistant. I can help you with appointments, health tips, ABHA integration, and general health queries. How can I assist you today?';
    }

    // Log to Supabase
    await supabase.from('audit_logs').insert({ action: 'AI_CHAT', table_name: 'chat', details: `Q: ${message.substring(0, 100)}` }).catch(() => {});

    res.json({ success: true, reply });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// BILLING
// ══════════════════════════════════════════════════════════

app.get('/api/billing', async (req, res) => {
  try {
    const { patient_id } = req.query;
    let query = supabase.from('billing').select('*, patients(name, phone), payments(*)').order('created_at', { ascending: false });
    if (patient_id) query = query.eq('patient_id', patient_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/billing', async (req, res) => {
  try {
    const { appointment_id, patient_id, total_amount, discount } = req.body;
    const { data, error } = await supabase.from('billing').insert({ appointment_id, patient_id, total_amount, discount: discount || 0 }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════

app.get('/api/analytics', async (req, res) => {
  try {
    const [
      { count: totalPatients },
      { count: totalAppointments },
      { count: todayAppointments },
      { data: revenue }
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('date_time', new Date().toISOString().split('T')[0] + 'T00:00:00'),
      supabase.from('billing').select('total_amount, discount').eq('status', 'Paid')
    ]);
    const totalRevenue = (revenue || []).reduce((s, b) => s + (b.total_amount - b.discount), 0);
    res.json({ success: true, data: { totalPatients, totalAppointments, todayAppointments, totalRevenue } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ══════════════════════════════════════════════════════════

app.get('/api/prescriptions', async (req, res) => {
  try {
    const { patient_id } = req.query;
    let query = supabase.from('prescriptions').select('*, patients(name), doctors(name), prescription_items(*)').order('created_at', { ascending: false });
    if (patient_id) query = query.eq('patient_id', patient_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/prescriptions', async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, diagnosis, advice, follow_up_date } = req.body;
    const { data, error } = await supabase.from('prescriptions').insert({ appointment_id, doctor_id, patient_id, diagnosis, advice, follow_up_date }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════

app.post('/api/notifications', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const { data, error } = await supabase.from('notifications').insert({ title, message, type: type || 'General' }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ══════════════════════════════════════════════════════════
// Serve static frontend (original index.html)
// ══════════════════════════════════════════════════════════
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

// ══════════════════════════════════════════════════════════
// START SERVER — local only (Vercel uses module.exports)
// ══════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 UPCHAAR BACKEND RUNNING: http://localhost:${PORT}`);
    console.log(`📦 Database: Supabase PostgreSQL (Cloud)`);
    console.log(`🔗 ${process.env.SUPABASE_URL}`);
    console.log('==================================================');
  });
}

// Export for Vercel serverless
module.exports = app;

