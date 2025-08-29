'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseBrowser';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [info, setInfo] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) window.location.href = '/checkin';
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) window.location.href = '/checkin';
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) { // confirm-email ON
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signin');
          return;
        }
        return; // session will redirect via onAuthStateChange
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error('Sign-in succeeded but no session was created. Please try again.');
        window.location.href = '/checkin';
      }
    } catch (err: any) {
      const msg = String(err?.message || 'Something went wrong');
      if (/Invalid login credentials/i.test(msg)) {
        setError('Invalid login credentials. If you just signed up, confirm your email or reset your password.');
      } else if (/User already registered/i.test(msg)) {
        setInfo('This email is already registered. Try signing in, or reset your password.');
        setMode('signin');
      } else { setError(msg); }
    } finally { setBusy(false); }
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      const redirectTo = new URL('/reset', window.location.origin).toString();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setInfo('Reset link sent. Check your email (inbox/spam).');
      setShowForgot(false);
    } catch (err: any) {
      setError(err?.message || 'Could not send reset email.');
    } finally { setBusy(false); }
  }

  return (
    <main style={{maxWidth: 420, margin: '0 auto', padding: 24}}>
      <h1>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>

      <form onSubmit={onSubmit}>
        <input type="email" placeholder="you@example.com" value={email}
          onChange={(e)=>setEmail(e.target.value)} required autoComplete="email"
          style={{width:'100%', padding:8, margin:'8px 0'}} />
        <input type="password" placeholder="Password (min 6 chars)" value={password}
          onChange={(e)=>setPassword(e.target.value)} required
          autoComplete={mode==='signin'?'current-password':'new-password'}
          style={{width:'100%', padding:8, margin:'8px 0'}} />
        <button type="submit" disabled={busy}>
          {busy ? 'Working…' : (mode==='signin' ? 'Sign in' : 'Sign up')}
        </button>
        {error && <p style={{color:'crimson', marginTop:8}}>{error}</p>}
        {info && <p style={{color:'green', marginTop:8}}>{info}</p>}
      </form>

      {mode==='signin' && (
        <p style={{marginTop:8}}>
          <button onClick={()=>setShowForgot(v=>!v)} style={{textDecoration:'underline'}}>Forgot password?</button>
        </p>
      )}
      {showForgot && (
        <form onSubmit={sendReset} style={{marginTop:8}}>
          <p>We’ll email you a reset link.</p>
          <button type="submit" disabled={busy}>Send reset link</button>
        </form>
      )}

      <p style={{marginTop:12}}>
        {mode==='signin'
          ? <>New here? <button onClick={()=>{setMode('signup'); setError(null); setInfo(null);}} style={{textDecoration:'underline'}}>Create an account</button></>
          : <>Already have an account? <button onClick={()=>{setMode('signin'); setError(null); setInfo(null);}} style={{textDecoration:'underline'}}>Sign in</button></>}
      </p>

      <p style={{marginTop:24}}><a href="/">← Back to home</a></p>
    </main>
  );
}
