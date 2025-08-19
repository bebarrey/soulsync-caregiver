'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseBrowser';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'enter'|'code'|'done'>('enter');
  const [error, setError] = useState<string| null>(null);
  const [code, setCode] = useState('');

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) setError(error.message);
    else setPhase('code');
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    });
    if (error) setError(error.message);
    else setPhase('done');
  }

  return (
    <main style={{maxWidth: 420, margin: '0 auto', padding: 24}}>
      <h1>Sign in</h1>
      {phase==='enter' && (
        <form onSubmit={sendCode}>
          <p>Enter your email to get a one-time code.</p>
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%', padding:8, margin:'8px 0'}}/>
          <button type="submit">Send code</button>
          {error && <p style={{color:'crimson'}}>{error}</p>}
        </form>
      )}
      {phase==='code' && (
        <form onSubmit={verifyCode}>
          <p>Check your email and paste the 6-digit code.</p>
          <input inputMode="numeric" pattern="[0-9]*" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required style={{width:'100%', padding:8, margin:'8px 0'}}/>
          <button type="submit">Verify & continue</button>
          {error && <p style={{color:'crimson'}}>{error}</p>}
        </form>
      )}
      {phase==='done' && (
        <div>
          <p>Signed in. Go to your <Link href="/checkin">Daily Check-in</Link>.</p>
        </div>
      )}
      <p style={{marginTop:24}}><Link href="/">← Back to home</Link></p>
    </main>
  );
}
