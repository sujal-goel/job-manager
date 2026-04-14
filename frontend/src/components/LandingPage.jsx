import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const LandingPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard');
    }
  }, [isLoaded, isSignedIn, navigate]);


  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });

      // Draw lines between nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: 'white', fontFamily: "'Inter', sans-serif", overflow: 'hidden', position: 'relative' }}>
      {/* Particle Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Glow Orbs */}
      <div style={{ position: 'fixed', top: '15%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⚡ JobManager
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', padding: '0.5rem 1rem', borderRadius: '6px', transition: 'color 0.2s' }}>Sign In</Link>
          <Link to="/register" style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '7rem 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '100px', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '2rem', animation: 'fadeSlideUp 0.8s ease forwards', letterSpacing: '0.05em' }}>
          ✦ The smartest way to job hunt
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', animation: 'fadeSlideUp 0.9s ease 0.1s both', letterSpacing: '-2px' }}>
          Track Every Application.{' '}
          <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Land Your Dream Job.
          </span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.7', animation: 'fadeSlideUp 1s ease 0.2s both' }}>
          A beautifully designed job application manager that keeps your job hunt in one place. Organized, visual, and always in control.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeSlideUp 1s ease 0.3s both' }}>
          <Link to="/register" style={{ padding: '1rem 2.2rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 25px rgba(99,102,241,0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Start Tracking Free →
          </Link>
          <Link to="/login" style={{ padding: '1rem 2.2rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', padding: '2rem', marginBottom: '2rem', animation: 'fadeSlideUp 1s ease 0.4s both' }}>
        {[['10K+', 'Jobs Tracked'], ['95%', 'Less Stress'], ['3x', 'Faster Hiring']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
            <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', padding: '2rem 4rem 6rem', maxWidth: '1100px', margin: '0 auto', animation: 'fadeSlideUp 1s ease 0.5s both' }}>
        {[
          { icon: '🧱', title: 'Kanban Board', desc: 'Visualize your journey with a modern Kanban board. Move jobs between Applied, Interview, and Offer columns.' },
          { icon: '📊', title: 'Smart Analytics', desc: "Get real-time insights into your success rate and interview ratio with interactive progress bars and tips." },
          { icon: '🔔', title: 'Reminder System', desc: 'Never miss a follow-up. The system automatically identifies and alerts you about pending communications.' },
          { icon: '🛡️', title: 'Admin Governance', desc: 'Enterprise-grade admin panel to monitor platform usage, user activity, and ensure data integrity.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', backdropFilter: 'blur(10px)', transition: 'border-color 0.3s, transform 0.3s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{title}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'fadeSlideUp 1s ease 0.6s both' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>Ready to get organized?</h2>
        <p style={{ color: '#475569', marginBottom: '2rem' }}>Join thousands of job seekers who have simplified their search.</p>
        <Link to="/register" style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 25px rgba(99,102,241,0.4)' }}>
          Create Free Account
        </Link>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
