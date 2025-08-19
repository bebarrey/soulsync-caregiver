'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseBrowser';

export default function CheckinPage() {
  const [mood, setMood] = useState(5);
  const [journal, setJournal] = useState('');
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [t3, setT3] = useState('');
  const [status, setStatus] = useState<string>('');

  async function submitCheckin() {
    setStatus('Saving...');
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setStatus('Please sign in first.'); return; }

    const today = new Date().toISOString().slice(0,10);

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: today, mood, journal })
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({}));
      setStatus('Error: ' + (e.error || res.statusText));
      return;
    }

    for (const title of [t1,t2,t3].filter(Boolean)) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title })
      });
    }

    setStatus('Saved ✔');
  }

  return (
    <main style={{maxWidth: 560, margin: '0 auto', padding: 24}}>
      <h1>Daily Check-in</h1>
      <section style={{margin: '12px 0'}}>
        <label>Mood: {mood}/10</label>
        <input type="range" min="0" max="10" value={mood} onChange={e=>setMood(parseInt(e.target.value))} style={{width:'100%'}}/>
      </section>
      <section style={{margin: '12px 0'}}>
        <label>Journal (3 lines)</label>
        <textarea value={journal} onChange={e=>setJournal(e.target.value)} rows={4} style={{width:'100%', padding:8}} placeholder="What’s on your plate today?"/>
      </section>
      <section style={{margin: '12px 0'}}>
        <label>Top 3 tasks</label>
        <input value={t1} onChange={e=>setT1(e.target.value)} placeholder="Task 1" style={{width:'100%', padding:8, margin:'6px 0'}}/>
        <input value={t2} onChange={e=>setT2(e.target.value)} placeholder="Task 2" style={{width:'100%', padding:8, margin:'6px 0'}}/>
        <input value={t3} onChange={e=>setT3(e.target.value)} placeholder="Task 3" style={{width:'100%', padding:8, margin:'6px 0'}}/>
      </section>
      <button onClick={submitCheckin}>Save today’s check-in</button>
      <p style={{minHeight: 24}}>{status}</p>
    </main>
  );
}
