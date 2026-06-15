'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = [
    { icon: '⚡', title: 'Instant Autofill', desc: 'AI detects and fills every field across Greenhouse, Lever, Ashby, Workday & more.' },
    { icon: '🧠', title: 'Gemini AI Engine', desc: 'Smart field recognition regardless of label naming — no more manual copy-paste.' },
    { icon: '📄', title: 'Resume Parsing', desc: 'Upload your resume once. We extract your full profile automatically.' },
    { icon: '🎯', title: 'Job Match Score', desc: 'See how well you match a role before applying. Identify skill gaps instantly.' },
    { icon: '✍️', title: 'Cover Letter AI', desc: 'Generate personalized, compelling cover letters tailored to each job.' },
    { icon: '📊', title: 'Application Tracker', desc: 'Track every application, status, and outcome in one clean dashboard.' },
  ];

  const portals = ['Greenhouse', 'Lever', 'Ashby', 'Workday', 'SmartRecruiters', 'Taleo', 'iCIMS', 'LinkedIn', 'Indeed', 'BambooHR'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #080810 0%, #0f0f1a 50%, #12101f 100%)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(8,8,16,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Job Autofiller</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}>Sign In</Link>
          <Link href="/register" style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 60px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 28, fontSize: 13, color: '#818cf8' }}>
          <span>✨</span> Powered by Google Gemini AI
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, background: 'linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Apply to Jobs 10x Faster with AI
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
          One profile. Every job portal. Zero repetition. Our AI fills application forms, scores your match, and generates personalized cover letters — while you stay in control.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '15px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 30px rgba(99,102,241,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ⚡ Start Autofilling Free
          </Link>
          <Link href="/login" style={{ padding: '15px 36px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
            View Demo →
          </Link>
        </div>

        {/* Portal badges */}
        <div style={{ marginTop: 60, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {portals.map(p => (
            <span key={p} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#64748b' }}>{p}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 50, fontSize: 16 }}>From profile to offer — fully automated, you in control</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 60px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)', margin: '40px 0' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>Ready to Apply Smarter?</h2>
        <p style={{ color: '#64748b', fontSize: 16, marginBottom: 36 }}>Join thousands of job seekers saving hours every week.</p>
        <Link href="/register" style={{ padding: '16px 44px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 700, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
          Get Started Free — No Credit Card
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '30px', color: '#334155', fontSize: 13 }}>
        <p>© 2025 Job Autofiller. Built with ⚡ and Gemini AI.</p>
      </footer>
    </div>
  );
}
