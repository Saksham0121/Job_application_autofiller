'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchResumes(); }, []);

  async function fetchResumes() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/resume`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setResumes((await res.json()).resumes || []);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
      const res = await fetch(`${API}/api/resume/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      const data = await res.json();
      await fetchResumes();
      setSelectedResume(data.resume);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function setDefault(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/resume/${id}/default`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchResumes();
  }

  async function deleteResume(id: string) {
    if (!confirm('Delete this resume?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/resume/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchResumes();
    if (selectedResume?.id === id) setSelectedResume(null);
  }

  const formatSize = (bytes: number) => bytes ? `${(bytes / 1024).toFixed(0)} KB` : '';

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Resumes</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Upload your resume — Gemini AI will parse it and auto-populate your profile.</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          {uploading ? '⏳ Parsing...' : '⬆ Upload Resume'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fb7185', fontSize: 14 }}>⚠️ {error}</div>}

      {/* Upload zone */}
      {resumes.length === 0 && !uploading && (
        <div onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 20, padding: '60px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 24 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Upload your first resume</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>PDF, DOC or DOCX · Max 10MB · AI-powered parsing</p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Gemini AI is parsing your resume...</h3>
          <p style={{ color: '#64748b', fontSize: 13 }}>Extracting skills, experience, education and contact details</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedResume ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Resume list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {resumes.map(r => (
            <div key={r.id}
              onClick={() => setSelectedResume(r)}
              style={{ background: selectedResume?.id === r.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedResume?.id === r.id ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '18px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.name}
                    {r.isDefault && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: 100, border: '1px solid rgba(16,185,129,0.3)' }}>DEFAULT</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{formatSize(r.fileSize)} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!r.isDefault && (
                    <button onClick={e => { e.stopPropagation(); setDefault(r.id); }}
                      style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>
                      Set Default
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); deleteResume(r.id); }}
                    style={{ padding: '5px 10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 8, color: '#f87171', fontSize: 11, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Parsed data preview */}
        {selectedResume?.parsedData && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', height: 'fit-content', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#818cf8', marginBottom: 16 }}>🧠 AI Parsed Data</h3>
            {selectedResume.parsedData.firstName && <p style={{ fontSize: 13, color: '#94a3b8' }}><strong style={{ color: '#64748b' }}>Name:</strong> {selectedResume.parsedData.firstName} {selectedResume.parsedData.lastName}</p>}
            {selectedResume.parsedData.email && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}><strong style={{ color: '#64748b' }}>Email:</strong> {selectedResume.parsedData.email}</p>}
            {selectedResume.parsedData.skills?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>SKILLS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedResume.parsedData.skills.slice(0, 20).map((s: string) => (
                    <span key={s} style={{ padding: '3px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, fontSize: 11, color: '#818cf8' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedResume.parsedData.experience?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>EXPERIENCE</p>
                {selectedResume.parsedData.experience.map((e: any, i: number) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{e.title}</p>
                    <p style={{ fontSize: 12, color: '#6366f1' }}>{e.company}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
