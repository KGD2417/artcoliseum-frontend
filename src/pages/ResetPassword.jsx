import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/Auth';
import { validateForm, isValid, required, minLen } from '../utils/validation';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validateForm({ password }, { password: [required('Password'), minLen(6, 'Password')] });
    if (!isValid(errs)) { setError(Object.values(errs)[0]); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const { error } = await resetPassword({ token, password });
      if (error) setError(error.message);
      else navigate('/profile'); // resetPassword signs the user straight in.
    } finally {
      setBusy(false);
    }
  };

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
            NEW PASSWORD
          </h2>
          <div style={{ width: 60, height: 1, background: '#D4AF37', margin: '14px auto' }} />
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: 'rgba(200,191,160,0.55)' }}>
            Choose a new password for your account.
          </p>
        </div>

        {!token ? (
          <p style={{ textAlign: 'center', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#ff8a8a' }}>
            This reset link is invalid or incomplete.{' '}
            <Link to="/signin" style={{ color: '#D4AF37', textDecoration: 'underline' }}>Request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
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
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />

            {error && (
              <p style={{ color: '#ff8a8a', fontFamily: "'Raleway',sans-serif", fontSize: 12, margin: 0 }}>{error}</p>
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
              {busy ? 'PLEASE WAIT…' : 'UPDATE PASSWORD'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
