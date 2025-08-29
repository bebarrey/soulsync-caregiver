'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseBrowser';

export default function ResetPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [info, setInfo] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  // When arriving from the email link, Supabase gives us a recovery session.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function updatePass(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      if (password !== confirm) throw new Error('Passwords do not match.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo('Password updated. Redirecting…');
      window.location.href = '/checkin';
    } catch (err:any) {
      setError(err?.message || 'Could not update password.');
    } finally { setBusy(false); }
  }

  return (
    <main style={{maxWidth: 420, margin: '0 auto', padding: 24}}>
      <h1>Reset password</h1>
      {!ready && <p>Please open this page via the link in your email.</p>}
      <form onSubmit={updatePass}>
        <input type="password" placeholder="New password" value={password}
          onChange={(e)=>setPassword(e.target.value)} required
          style={{width:'100%', padding:8, margin:'8px 0'}} />
        <input type="password" placeholder="Confirm new password" value={confirm}
          onChange={(e)=>setConfirm(e.target.value)} required
          style={{width:'100%', padding:8, margin:'8px 0'}} />
        <button type="submit" disabled={!ready || busy}>{busy ? 'Working…' : 'Update password'}</button>
      </form>
      {error && <p style={{color:'crimson', marginTop:8}}>{error}</p>}
      {info && <p style={{color:'green', marginTop:8}}>{info}</p>}
    </main>
  );
}
