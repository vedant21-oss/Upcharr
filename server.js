const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize SQLite database connection
const dbPath = path.join(__dirname, 'upchaar.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Seed data and create tables if not exists
function initializeDatabase() {
  db.serialize(() => {
    // 1. Appointments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_id TEXT NOT NULL UNIQUE,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_email TEXT,
        patient_phone TEXT,
        date_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Waiting'
      )
    `);

    // 2. Queue Status Table
    db.run(`
      CREATE TABLE IF NOT EXISTS queue_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        active_token TEXT NOT NULL,
        estimated_wait_mins INTEGER NOT NULL
      )
    `);

    // Seed initial queue state if empty
    db.get('SELECT COUNT(*) as count FROM queue_state', (err, row) => {
      if (row && row.count === 0) {
        db.run('INSERT INTO queue_state (active_token, estimated_wait_mins) VALUES (?, ?)', ['#A-14', 12]);
      }
    });

    // Seed mock initial appointments if table is empty
    db.get('SELECT COUNT(*) as count FROM appointments', (err, row) => {
      if (row && row.count === 0) {
        const initialAppointments = [
          { ref: 'UPC-47201', docId: 'dr-sharma', docName: 'Dr. Aarav Sharma', name: 'Rahul Verma', email: 'rahul@gmail.com', phone: '+91 9988776655', time: 'Tomorrow at 09:00 AM', status: 'In Consultation' },
          { ref: 'UPC-28491', docId: 'dr-sharma', docName: 'Dr. Aarav Sharma', name: 'Priya Sen', email: 'priya@gmail.com', phone: '+91 8877665544', time: 'Tomorrow at 10:00 AM', status: 'Waiting' },
          { ref: 'UPC-93048', docId: 'dr-mehta', docName: 'Dr. Vikram Mehta', name: 'Amit Sharma', email: 'amit@gmail.com', phone: '+91 7766554433', time: 'Tomorrow at 11:30 AM', status: 'Waiting' }
        ];

        const stmt = db.prepare('INSERT INTO appointments (reference_id, doctor_id, doctor_name, patient_name, patient_email, patient_phone, date_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        initialAppointments.forEach(app => {
          stmt.run(app.ref, app.docId, app.docName, app.name, app.email, app.phone, app.time, app.status);
        });
        stmt.finalize();
        console.log('Seeded database with initial mock appointments.');
      }
    });
  });
}

// ==========================================================================
// API ENDPOINTS
// ==========================================================================

// 1. Get all appointments
app.get('/api/appointments', (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. Book new appointment
app.post('/api/appointments', (req, res) => {
  const { doctorId, doctorName, patientName, patientEmail, patientPhone, dateTime } = req.body;

  if (!doctorId || !doctorName || !patientName || !dateTime) {
    return res.status(400).json({ error: 'Missing required appointment fields.' });
  }

  const referenceId = `UPC-${Math.floor(10000 + Math.random() * 90000)}`;

  db.run(
    `INSERT INTO appointments (reference_id, doctor_id, doctor_name, patient_name, patient_email, patient_phone, date_time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [referenceId, doctorId, doctorName, patientName, patientEmail || '', patientPhone || '', dateTime],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        referenceId,
        doctorId,
        doctorName,
        patientName,
        patientEmail,
        patientPhone,
        dateTime,
        status: 'Waiting'
      });
    }
  );
});

// 3. Get current queue status
app.get('/api/queue', (req, res) => {
  db.get('SELECT * FROM queue_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || { active_token: '#A-14', estimated_wait_mins: 12 });
  });
});

// 4. Scan check-in (Update queue & checkin list)
app.post('/api/checkin', (req, res) => {
  const { patientName, doctorId, doctorName } = req.body;

  if (!patientName) {
    return res.status(400).json({ error: 'Patient name is required for check-in.' });
  }

  const referenceId = `UPC-${Math.floor(10000 + Math.random() * 90000)}`;
  const mockTime = 'Just Checked In';

  db.serialize(() => {
    // Insert into appointments as lobby checkin
    db.run(
      `INSERT INTO appointments (reference_id, doctor_id, doctor_name, patient_name, status, date_time) VALUES (?, ?, ?, ?, ?, ?)`,
      [referenceId, doctorId || 'dr-sharma', doctorName || 'Dr. Aarav Sharma', patientName, 'Waiting', mockTime]
    );

    // Update queue active token to simulate check-in progression
    db.get('SELECT * FROM queue_state ORDER BY id DESC LIMIT 1', (err, row) => {
      let currentWait = row ? row.estimated_wait_mins : 12;
      let currentTokenNum = row ? parseInt(row.active_token.split('-')[1]) : 14;

      // Increment wait and token num
      const nextToken = `#A-${currentTokenNum + 1}`;
      const nextWait = Math.max(5, currentWait - 1 + Math.floor(Math.random() * 4));

      db.run('UPDATE queue_state SET active_token = ?, estimated_wait_mins = ? WHERE id = 1', [nextToken, nextWait], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({
          status: 'success',
          checkedInPatient: patientName,
          nextToken,
          nextWait,
          referenceId
        });
      });
    });
  });
});

// 5. Secure proxy to Gemini AI chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // If API key is missing, respond with high-quality simulated clinical assistant replies
    console.warn('GEMINI_API_KEY environment variable is missing. Running in simulated AI mode.');
    
    const userMsg = message.toLowerCase();
    let responseText = "I am Upchaar's AI Assistant. How can I help you today?";

    if (userMsg.includes('fever') || userMsg.includes('temperature')) {
      responseText = "A fever is typically a sign that your body is fighting off an infection. Please ensure you stay hydrated, get rest, and monitor your temperature. You can book an appointment with Dr. Aarav Sharma (General Physician) for a clinical evaluation.";
    } else if (userMsg.includes('cough') || userMsg.includes('throat')) {
      responseText = "If you have a cough or sore throat, resting your voice, staying hydrated with warm liquids, and steam inhalations can help. If it persists for over 5 days, please consult a physician. Dr. Aarav Sharma has open slots tomorrow!";
    } else if (userMsg.includes('book') || userMsg.includes('appointment')) {
      responseText = "You can easily schedule a consultation directly on our website! Scroll down to 'Consult Our Verified Clinicians' and click 'Book Now' on any doctor.";
    } else if (userMsg.includes('doctor') || userMsg.includes('specialist')) {
      responseText = "Upchaar connects you with verified specialists: Dr. Aarav Sharma (Internal Medicine), Dr. Ananya Patel (Pediatrics), Dr. Vikram Mehta (Cardiology), and Dr. Meera Nene (Gynecology).";
    } else if (userMsg.includes('abha')) {
      responseText = "ABHA (Ayushman Bharat Health Account) is a unique digital identity that allows you to store and access your medical histories, lab results, and prescriptions digitally across healthcare networks.";
    } else if (userMsg.includes('time') || userMsg.includes('timing') || userMsg.includes('hour')) {
      responseText = "Our physical clinic is open Monday through Saturday, from 8:00 AM to 8:00 PM. AI diagnostics and telemedicine slot booking are online 24/7.";
    }

    return res.json({ response: responseText });
  }

  try {
    // Initialize Gemini AI Client
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Set clinical assistant persona system instructions
    const systemPrompt = `You are Upchaar's intelligent clinic AI Assistant. Keep answers concise, extremely helpful, professional, and medical-focused. Always remind patients that AI insights do not replace real doctor evaluations, and suggest booking an appointment with Upchaar's doctors: Dr. Aarav Sharma (General Physician), Dr. Ananya Patel (Pediatrician), Dr. Vikram Mehta (Cardiologist).`;

    const chatSession = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will act as Upchaar\'s clinic AI assistant.' }] }
      ]
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    res.json({ response: response.text() });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to communicate with AI model.', details: error.message });
  }
});

// ==========================================================================
// SERVE STATIC FILES
// ==========================================================================
// Serve index.html, style.css, app.js statically from root directory
app.use(express.static(__dirname));

// Direct any unrecognized route back to index.html (useful for React/frontend routers)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 UPCHAAR BACKEND RUNNING: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
