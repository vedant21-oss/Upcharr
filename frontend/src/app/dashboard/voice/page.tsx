'use client';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, MicOff, Loader2, CheckCircle, Download, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VoicePrescriptionPage() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    supabase.from('patients').select('id, name').then(({ data }) => setPatients(data || []));
  }, []);

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Try Chrome browser.'); return; }
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) setTranscript(prev => prev + ' ' + finalTranscript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setResult(null);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const processPrescription = async () => {
    if (!transcript.trim()) { alert('Please record a prescription first.'); return; }
    setProcessing(true);
    try {
      const doctorRow = await supabase.from('doctors').select('id').eq('user_id', user?.id).single();
      const doctor_id = doctorRow.data?.id || 1;

      const data = await api.voiceToPrescription({
        transcript: transcript.trim(),
        doctor_id,
        patient_id: selectedPatient ? parseInt(selectedPatient) : null,
        appointment_id: null
      });
      setResult(data);
    } catch (err: any) {
      alert('Processing failed: ' + err.message);
    } finally { setProcessing(false); }
  };

  const clearAll = () => { setTranscript(''); setResult(null); setIsRecording(false); };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voice Prescription</h1>
        <p className="text-gray-500 text-sm mt-1">Speak your diagnosis — AI converts it to a structured prescription</p>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient (Optional)</label>
        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="form-input">
          <option value="">Select patient...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Recording */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${
          isRecording ? 'bg-red-100 scale-110 pulse-teal' : 'bg-teal-50'
        }`}>
          <button onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
            } shadow-lg`}>
            {isRecording ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
          </button>
        </div>

        <p className="font-semibold text-gray-900 mb-1">
          {isRecording ? '🔴 Recording... Speak now' : 'Click to start recording'}
        </p>
        <p className="text-sm text-gray-400">
          {isRecording ? 'Click again to stop' : 'Speak the diagnosis, medicines, dosage, and advice'}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Transcript</h3>
            <button onClick={() => setTranscript('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl p-3 resize-none h-28 outline-none border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
          <div className="flex gap-3 mt-3">
            <button onClick={clearAll} className="btn-secondary text-sm">Clear</button>
            <button onClick={processPrescription} disabled={processing}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              {processing ? <><Loader2 size={16} className="animate-spin" />Processing...</> : '✨ Generate Prescription'}
            </button>
          </div>
        </div>
      )}

      {/* AI Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="bg-teal-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle size={20} />
              <span className="font-semibold">Prescription Generated</span>
            </div>
            <button className="btn-secondary text-xs py-1.5 flex items-center gap-1">
              <Download size={14} /> Download PDF
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Diagnosis</p>
              <p className="text-gray-900 font-medium">{result.structured?.diagnosis || '—'}</p>
            </div>
            {result.structured?.medicines?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Medicines</p>
                <div className="space-y-2">
                  {result.structured.medicines.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
                      <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.dosage} • {m.duration} • {m.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.structured?.advice && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Advice</p>
                <p className="text-gray-700 text-sm">{result.structured.advice}</p>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-700">Saved to patient record • Follow-up in {result.structured?.follow_up_days || 7} days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
