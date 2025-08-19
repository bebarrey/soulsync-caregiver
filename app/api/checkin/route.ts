import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date, mood, journal } = await req.json();
  if (!date || typeof mood !== 'number') {
    return NextResponse.json({ error: 'date and mood required' }, { status: 400 });
  }

  const supabase = createSupabaseClient(token);
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const upsert = {
    user_id: user.id,
    date,
    mood,
    journal: journal ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('check_ins')
    .upsert(upsert, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
