'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [statsRes, profileRes] = await Promise.all([
        fetch(`${API}/api/applications/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (profileRes.ok) setProfile((await profileRes.json()).profile);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }

  const statuses = stats?.stats || [];
  const getCount = (s: string) => statuses.find((x: any) => x.status === s)?._count?.status || 0;

  const profileCompletion = profile ? (() => {
    const fields = ['firstName', 'lastName', 'phone', 'headline', 'summary', 'linkedinUrl', 'skills'];
    const filled = fields.filter(f => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : profile[f])).length;
    return Math.round((filled / fields.length) * 100);
  })() : 0;

  const quickActions = [
    { href: '/dashboard/profile', icon: '👤', label: 'Complete Profile', desc: `${profileCompletion}% complete`, color: '#6366f1' },
    { href: '/dashboard/resumes', icon: '📄', label: 'Upload Resume', desc: 'Parse with AI', color: '#8b5cf6' },
    { href: '/dashboard/cover-letter', icon: '✍️', label: 'Generate Cover Letter', desc: 'AI-powered', color: '#10b981' },
    { href: '/dashboard/applications', icon: '📋', label: 'Track Applications', desc: `${stats?.total || 0} total`, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          {user ? `Welcome back, ${user.name?.split(' ')[0] || 'there'} 👋` : 'Dashboard'}
        </h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Here's an overview of your job application activity.</p>
      </div>

      {/* Profile completion banner */}
      {!loading && profileCompletion < 80 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Complete your profile to enable autofill</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>Your profile is {profileCompletion}% complete. Fill in more details for better autofill accuracy.</p>
            <div style={{ marginTop: 12, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, width: 240 }}>
              <div style={{ height: '100%', width: `${profileCompletion}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
          <Link href="/dashboard/profile" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, flexShrink: 0, boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📋" label="Total Applications" value={stats?.total ?? '—'} color="#6366f1" />
        <StatCard icon="⏳" label="Pending Review" value={getCount('pending')} color="#f59e0b" />
        <StatCard icon="🎯" label="In Interview" value={getCount('interview')} color="#10b981" />
        <StatCard icon="🏆" label="Offers Received" value={getCount('offer')} color="#8b5cf6" />
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 40 }}>
        {quickActions.map((a, i) => (
          <Link key={i} href={a.href}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(99,102,241,0.3)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* Extension install guide */}
      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>🧩 Install the Browser Extension</h3>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>Load the extension in Chrome to start autofilling job applications on Greenhouse, Lever, Ashby and more.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['1. Open Chrome → Extensions', '2. Enable Developer Mode', '3. Load Unpacked → select /extension folder'].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
