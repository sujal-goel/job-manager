import React, { useState, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [formData, setFormData] = useState({ username: '', emailAddress: '', password: '' });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLoaded = signUpLoaded && authLoaded;

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard');
    }
  }, [isLoaded, isSignedIn, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");

    try {
      await signUp.create({
        username: formData.username,
        emailAddress: formData.emailAddress,
        password: formData.password,
      });

      // Verification is required for security
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors[0]?.message || 'Registration failed');
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.errors[0]?.message || 'Verification failed');
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', background: '#0f172a' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: 'white' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>{pendingVerification ? 'Check Email' : 'Create Account'}</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
           {pendingVerification ? `We sent a code to ${formData.emailAddress}` : 'Join the JobManager community'}
        </p>

        {error && <div style={{ background: '#ef444433', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #ef4444' }}>{error}</div>}

        {!pendingVerification ? (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
              <input required type="text" name="username" value={formData.username} onChange={handleChange} 
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
              <input required type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} 
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} 
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Create Account</button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Verification Code</label>
              <input required type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456"
                 style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Verify & Sign Up</button>
            <button type="button" onClick={() => setPendingVerification(false)} style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>Wait, I typed my email wrong</button>
          </form>
        )}

        {!pendingVerification && (
          <p style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign in here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
