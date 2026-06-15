'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CoverLetterPage() {
  const [form, setForm] = useState({ jobTitle: '', company: '', jobDescription: '', tone: 'professional' });
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState('');
  const [error, setError] = useState('');

  async function generate() {
    if (!form.jobDescription) { setError('Job description is required'); return; }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/ai/cover-letter`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setLetter(data.coverLetter);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(letter);
    alert('Copied to clipboard!');
  };

  const inputStyle = { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none' };

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Cover Letter AI</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Generate a highly personalized cover letter based on your profile and the job description.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: letter ? '1fr 1fr' : '1fr', gap: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
          {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '10px', marginBottom: 16, color: '#fb7185', fontSize: 13 }}>⚠️ {error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Job Title</label>
              <input style={inputStyle} value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} placeholder="e.g. Frontend Engineer" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Company</label>
              <input style={inputStyle} value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="e.g. Acme Corp" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Tone</label>
            <select style={inputStyle} value={form.tone} onChange={e => setForm({...form, tone: e.target.value})}>
              <option value="professional">Professional & Formal</option>
              <option value="enthusiastic">Enthusiastic & Energetic</option>
              <option value="concise">Concise & Direct (Short)</option>
              <option value="creative">Creative & Unique</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Job Description (Paste here) *</label>
            <textarea style={{ ...inputStyle, minHeight: 180, resize: 'vertical' }} value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} placeholder="Paste the full job description here..." required />
          </div>

          <button onClick={generate} disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            {loading ? '🧠 Generating with Gemini...' : '✨ Generate Cover Letter'}
          </button>
        </div>

        {letter && (
          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#818cf8' }}>Your Cover Letter</h3>
              <button onClick={copy} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12, cursor: 'pointer' }}>📋 Copy</button>
            </div>
            <textarea readOnly value={letter} style={{ ...inputStyle, flex: 1, minHeight: 300, background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)', lineHeight: 1.6, resize: 'none' }} />
          </div>
        )}
      </div>
    </div>
  );
}
