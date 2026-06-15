'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  async function fetchApplications() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/applications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setApplications((await res.json()).applications || []);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }

  async function deleteApp(id: string) {
    if (!confirm('Delete this application?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchApplications();
  }

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/applications/${id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchApplications();
  }

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'applied': return { bg: 'rgba(56,189,248,0.15)', text: '#38bdf8', border: 'rgba(56,189,248,0.3)' };
      case 'interview': return { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' };
      case 'offer': return { bg: 'rgba(139,92,246,0.15)', text: '#a5b4fc', border: 'rgba(139,92,246,0.3)' };
      case 'rejected': return { bg: 'rgba(244,63,94,0.15)', text: '#fb7185', border: 'rgba(244,63,94,0.3)' };
      default: return { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)' };
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Applications</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Applications you autofill via the extension appear here automatically.</p>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading...</p>
      ) : applications.length === 0 ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>No applications yet</h3>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Use the extension to auto-fill a job form, and it will be saved here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {applications.map(app => {
            const colors = getStatusColor(app.status);
            return (
              <div key={app.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{app.role}</h3>
                    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, textTransform: 'capitalize', fontWeight: 600 }}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>
                    <strong style={{ color: '#cbd5e1' }}>{app.company}</strong>
                    {app.portal && ` · via ${app.portal}`}
                    {app.jobUrl && <span> · <a href={app.jobUrl} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>View Job ↗</a></span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', padding: '6px 10px', fontSize: 13, outline: 'none' }}>
                    <option value="pending">Pending</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={() => deleteApp(app.id)} style={{ padding: '7px 12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#fb7185', fontSize: 13, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
