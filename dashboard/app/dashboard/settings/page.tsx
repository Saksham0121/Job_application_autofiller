'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none',
  transition: 'border-color 0.2s',
};

const cardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, padding: '28px', marginBottom: 20, maxWidth: 600
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setMessage({ type: 'success', text: 'Password updated successfully (simulated)' });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Account Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Manage your account preferences and security.</p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Account Details</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Email Address</label>
          <input style={inputStyle} value={user?.email || ''} readOnly disabled />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Full Name</label>
          <input style={inputStyle} value={user?.name || ''} readOnly disabled />
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Change Password</h3>
        
        {message.text && (
          <div style={{ background: message.type === 'error' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${message.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 8, padding: '10px', marginBottom: 16, color: message.type === 'error' ? '#fb7185' : '#10b981', fontSize: 13 }}>
            {message.type === 'error' ? '⚠️' : '✓'} {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Current Password</label>
            <input type="password" style={inputStyle} required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>New Password</label>
            <input type="password" style={inputStyle} required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Confirm New Password</label>
            <input type="password" style={inputStyle} required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Update Password
          </button>
        </form>
      </div>

      <div style={{ ...cardStyle, borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.02)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 16 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Once you delete your account, there is no going back. Please be certain.</p>
        <button style={{ padding: '10px 20px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#fb7185', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
