'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseBrowser';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // signed in → go to app
      window.location.href = '/checkin';
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{maxWidth: 420, margin: '0 auto', padding: 24}}>
      <h1>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          style={{width:'100%', padding:8, margin:'8px 0'}}
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          style={{width:'100%', padding:8, margin:'8px 0'}}
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Working…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>
        {error && <p style={{color:'crimson'}}>{error}</p>}
      </form>

      <p style={{marginTop:12}}>
        {mode === 'signin' ? (
          <>New here? <button onClick={()=>setMode('signup')} style={{textDecoration:'underline'}}>Create an account</button></>
        ) : (
          <>Already have an account? <button onClick={()=>setMode('signin')} style={{textDecoration:'underline'}}>Sign in</button></>
        )}
      </p>

      <p style={{marginTop:24}}><a href="/">← Back to home</a></p>
    </main>
  );
}
