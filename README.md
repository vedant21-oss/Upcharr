# Upchaar - Intelligent Clinic Management Platform

Upchaar is a next-generation, premium AI-powered Smart Clinic Management SaaS platform designed to streamline administrative operations and elevate the patient consulting experience. Styled with a minimalist, high-fidelity light/dark-mode aesthetic.

---

## ⚡ Key Features

1. **AI Voice Prescriptions:** Simulates speech-to-text transcribing and extracts symptoms, diagnoses, and medical prescriptions.
2. **ABHA Health ID Sync:** Secure lookup simulator for government health records and digital ID validation.
3. **Contactless QR Code Check-ins:** Allows patients to scan a barcode at the front desk and join the queue.
4. **Interactive Waiting Queue:** Ticks down estimated waiting times and updates status indicators dynamically.
5. **Role-Based Portals:** Multi-perspective dashboards for Doctors, Receptionists, and Patients.
6. **Multilingual Localizations:** Instantly translates headers and details between English, Hindi, Marathi, and Gujarati.
7. **Node.js Express Backend:** SQLite database storage for appointments, check-ins, and analytics.

---

## 🛠️ Local Development & Execution

To run the full Upchaar website and Express server locally:

### 1. Install Node Dependencies
Initialize npm dependencies (Express, SQLite, CORS, Dotenv, and Google Gen AI SDK):
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Create a `.env` file in the root directory to configure the Gemini AI Key for real conversational AI responses:
```env
PORT=5001
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(If no API Key is provided, the backend automatically switches to simulated clinical assistant mode).*

### 3. Launch the Server
Run the Node.js server:
```bash
npm start
```
Or run in development watch mode:
```bash
npm run dev
```

Open your browser to:
👉 **[http://localhost:5001](http://localhost:5001)**

---

## 🚀 Deploying to Production (Render)

To deploy the backend API and database to **Render**:
1. Log into your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** > **Web Service**.
3. Link your GitHub repository (`Upcharr`).
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `npm start`
6. In the **Environment** tab, click **Add Environment Variable**:
   - Key: `GEMINI_API_KEY`
   - Value: `(Your Gemini API Key)`
7. Click **Deploy Web Service**.