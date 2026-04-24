import { useState } from 'react';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(isLogin ? `Welcome back! (Demo)` : `Account created for ${name}! (Demo)`);
  };

  return (
    <section style={{ padding: '120px 52px 100px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '460px', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '28px', color: '#D4AF37', letterSpacing: '0.1em' }}>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</h2>
          <div style={{ width: '60px', height: '1px', background: '#D4AF37', margin: '16px auto' }} />
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', padding: '14px', color: '#e8e0d0', fontFamily: "'Raleway', sans-serif", outline: 'none' }} />
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', padding: '14px', color: '#e8e0d0', fontFamily: "'Raleway', sans-serif", outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', padding: '14px', color: '#e8e0d0', fontFamily: "'Raleway', sans-serif", outline: 'none' }} />
          </div>
          <button type="submit" className="btn-gold" style={{ width: '100%', marginBottom: '20px' }}>{isLogin ? 'Sign In' : 'Sign Up'}</button>
        </form>
        <p style={{ textAlign: 'center', fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(200,191,160,0.6)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Create one' : 'Sign In'}
          </span>
        </p>
      </div>
    </section>
  );
}