'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none',
  transition: 'border-color 0.2s',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, padding: '28px', marginBottom: 20,
};

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [tab, setTab] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile || {});
    }
  }

  async function saveProfile() {
    setSaving(true);
    const token = localStorage.getItem('token');
    const { education, experience, projects, certifications, ...profileData } = profile;
    await fetch(`${API}/api/profile`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const set = (key: string, val: any) => setProfile((p: any) => ({ ...p, [key]: val }));
  const addSkill = () => { if (newSkill.trim()) { set('skills', [...(profile.skills || []), newSkill.trim()]); setNewSkill(''); } };
  const removeSkill = (s: string) => set('skills', (profile.skills || []).filter((x: string) => x !== s));

  const tabs = [
    { key: 'personal', label: 'Personal Info', icon: '👤' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'skills', label: 'Skills & Links', icon: '🛠️' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Your Profile</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>This data powers the autofill engine across all job portals.</p>
        </div>
        <button onClick={saveProfile} disabled={saving}
          style={{ padding: '11px 24px', background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none', borderRadius: 10, color: saved ? '#10b981' : '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.3s', boxShadow: saved ? 'none' : '0 4px 15px rgba(99,102,241,0.3)' }}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 6 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === t.key ? '#818cf8' : '#64748b', fontSize: 13, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Personal Tab */}
      {tab === 'personal' && (
        <div style={cardStyle}>
          <SectionHeader title="Personal Information" icon="👤" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="First Name"><input style={inputStyle} value={profile.firstName || ''} onChange={e => set('firstName', e.target.value)} placeholder="John" /></Field>
            <Field label="Last Name"><input style={inputStyle} value={profile.lastName || ''} onChange={e => set('lastName', e.target.value)} placeholder="Doe" /></Field>
            <Field label="Phone"><input style={inputStyle} value={profile.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" /></Field>
            <Field label="Location"><input style={inputStyle} value={profile.location || ''} onChange={e => set('location', e.target.value)} placeholder="San Francisco, CA" /></Field>
            <Field label="City"><input style={inputStyle} value={profile.city || ''} onChange={e => set('city', e.target.value)} placeholder="San Francisco" /></Field>
            <Field label="State"><input style={inputStyle} value={profile.state || ''} onChange={e => set('state', e.target.value)} placeholder="California" /></Field>
            <Field label="Country"><input style={inputStyle} value={profile.country || ''} onChange={e => set('country', e.target.value)} placeholder="United States" /></Field>
            <Field label="Zip Code"><input style={inputStyle} value={profile.zipCode || ''} onChange={e => set('zipCode', e.target.value)} placeholder="94105" /></Field>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Headline"><input style={inputStyle} value={profile.headline || ''} onChange={e => set('headline', e.target.value)} placeholder="Software Engineer | Full-Stack | Open to Remote" /></Field>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Professional Summary">
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={profile.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="A brief summary of your professional background and goals..." />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {tab === 'skills' && (
        <div style={cardStyle}>
          <SectionHeader title="Skills & Online Presence" icon="🛠️" />
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Type a skill and press Enter..." />
              <button onClick={addSkill} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(profile.skills || []).map((s: string) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, fontSize: 13, color: '#818cf8' }}>
                  {s}
                  <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
              {(!profile.skills?.length) && <span style={{ color: '#334155', fontSize: 13 }}>No skills added yet.</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="LinkedIn URL"><input style={inputStyle} value={profile.linkedinUrl || ''} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourname" /></Field>
            <Field label="GitHub URL"><input style={inputStyle} value={profile.githubUrl || ''} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/yourname" /></Field>
            <Field label="Portfolio / Website"><input style={inputStyle} value={profile.portfolioUrl || ''} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com" /></Field>
            <Field label="Years of Experience"><input style={inputStyle} type="number" value={profile.yearsOfExp || ''} onChange={e => set('yearsOfExp', parseInt(e.target.value))} placeholder="3" /></Field>
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {tab === 'experience' && (
        <div style={cardStyle}>
          <SectionHeader title="Work Experience" icon="💼" />
          {(profile.experience || []).length === 0
            ? <p style={{ color: '#475569', fontSize: 14 }}>No experience added. Upload a resume to auto-populate, or add manually.</p>
            : (profile.experience || []).map((exp: any, i: number) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>{exp.title}</div>
                <div style={{ color: '#6366f1', fontSize: 13, marginTop: 2 }}>{exp.company}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</div>
                {exp.description && <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{exp.description}</p>}
              </div>
            ))
          }
          <p style={{ color: '#475569', fontSize: 13, marginTop: 12 }}>💡 Tip: Upload a resume to auto-populate your experience.</p>
        </div>
      )}

      {/* Education Tab */}
      {tab === 'education' && (
        <div style={cardStyle}>
          <SectionHeader title="Education" icon="🎓" />
          {(profile.education || []).length === 0
            ? <p style={{ color: '#475569', fontSize: 14 }}>No education added. Upload a resume to auto-populate.</p>
            : (profile.education || []).map((edu: any, i: number) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>{edu.institution}</div>
                <div style={{ color: '#6366f1', fontSize: 13, marginTop: 2 }}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{edu.startDate} — {edu.current ? 'Present' : edu.endDate} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
