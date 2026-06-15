'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/resumes', label: 'Resumes', icon: '📄' },
  { href: '/dashboard/applications', label: 'Applications', icon: '📋' },
  { href: '/dashboard/cover-letter', label: 'Cover Letter', icon: '✍️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const sidebarW = sidebarOpen ? 240 : 70;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarW, background: 'linear-gradient(180deg, #0f0f1a 0%, #0a0a15 100%)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>⚡</div>
          {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>Job Autofiller</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent', color: active ? '#818cf8' : '#64748b', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {user && sidebarOpen && (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          )}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid transparent', color: '#475569', fontSize: 14, cursor: 'pointer', width: '100%', transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}>
            <span style={{ fontSize: 17, flexShrink: 0 }}>🚪</span>
            {sidebarOpen && 'Sign Out'}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-end' : 'center', padding: '8px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: '#334155', fontSize: 14, cursor: 'pointer', width: '100%', marginTop: 4 }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: sidebarW, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', minHeight: '100vh', background: '#080810' }}>
        {children}
      </main>
    </div>
  );
}
