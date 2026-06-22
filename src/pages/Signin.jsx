import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/Auth';
import { validateForm, isValid, required, email as emailRule, phoneIN, minLen } from '../utils/validation';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [forgot, setForgot] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const rules = isLogin
      ? { email: [required('Email'), emailRule], password: [required('Password'), minLen(6, 'Password')] }
      : { name: [required('Full name')], email: [required('Email'), emailRule], phone: [required('Phone'), phoneIN], password: [required('Password'), minLen(6, 'Password')] };
    const errs = validateForm({ name, email, phone, password }, rules);
    if (!isValid(errs)) { setError(Object.values(errs)[0]); return; }
    setBusy(true);
    try {
      const { error } = isLogin
        ? await signIn({ email, password })
        : await signUp({ email, password, fullName: name, phone });
      if (error) {
        setError(error.message);
      } else {
        // Both login and registration return tokens → user is signed in.
        navigate('/profile');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    const errs = validateForm({ email }, { email: [required('Email'), emailRule] });
    if (!isValid(errs)) { setError(Object.values(errs)[0]); return; }
    setBusy(true);
    try {
      const { error } = await forgotPassword(email);
      if (error) setError(error.message);
      else setNotice('If an account exists for that email, a reset link is on its way. Check your inbox.');
    } finally {
      setBusy(false);
    }
  };

  // Switch between sign-in and the forgot-password view, clearing transient state.
  const showForgot = (on) => { setForgot(on); setError(''); setNotice(''); };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.2)',
    padding: '12px 14px',
    color: '#e8e0d0',
    fontFamily: "'Raleway', sans-serif",
    fontSize: 16,
    outline: 'none',
    borderRadius: 6,
  };

  const phoneInputStyle = {
    ...inputStyle,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
    fontSize: 15,
    fontWeight: 500,
  };

  return (
    <section style={{ padding: '120px 24px 100px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 24, padding: 44,
          width: '100%', maxWidth: 440,
          backdropFilter: 'blur(10px)',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: '#D4AF37', letterSpacing: '0.1em' }}>
            {forgot ? 'RESET PASSWORD' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h2>
          <div style={{ width: 60, height: 1, background: '#D4AF37', margin: '14px auto' }} />
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(200,191,160,0.55)' }}>
            {forgot ? 'Enter your email and we\'ll send you a reset link.' : isLogin ? 'Welcome back to Art Coliseum.' : 'Join the private collector circle.'}
          </p>
        </div>

        <form onSubmit={forgot ? handleForgot : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isLogin && !forgot && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          {!isLogin && !forgot && (
            <input
              type="tel"
              inputMode="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={phoneInputStyle}
            />
          )}
          {!forgot && (
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                top: '50%',
                right: 10,
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'rgba(212,175,55,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          )}

          {isLogin && !forgot && (
            <p style={{ textAlign: 'right', margin: 0 }}>
              <span
                onClick={() => showForgot(true)}
                style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(212,175,55,0.85)', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </p>
          )}

          {error && (
            <p style={{ color: '#ff8a8a', fontFamily: "'Raleway',sans-serif", fontSize: 12, margin: 0 }}>{error}</p>
          )}
          {notice && (
            <p style={{ color: '#9fe0a8', fontFamily: "'Raleway',sans-serif", fontSize: 12, margin: 0 }}>{notice}</p>
          )}

          <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            style={{
              marginTop: 10,
              height: 44,
              padding: '0 28px',
              background: 'linear-gradient(135deg,#D4AF37,#e8c53a)',
              color: '#111',
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              letterSpacing: '0.16em',
              border: 'none',
              borderRadius: 999,
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.7 : 1,
              boxShadow: '0 8px 24px rgba(212,175,55,0.25)',
            }}>
            {busy ? 'PLEASE WAIT…' : forgot ? 'SEND RESET LINK' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </motion.button>
        </form>

        {forgot ? (
          <p style={{ textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(200,191,160,0.6)', marginTop: 22 }}>
            Remembered it?{' '}
            <span
              onClick={() => showForgot(false)}
              style={{ color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline' }}>
              Back to Sign In
            </span>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(200,191,160,0.6)', marginTop: 22 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline' }}>
              {isLogin ? 'Create one' : 'Sign In'}
            </span>
          </p>
        )}
      </motion.div>
    </section>
  );
}
