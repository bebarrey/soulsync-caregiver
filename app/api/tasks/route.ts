import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, due_date, priority } = await req.json();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const { data, error } = await supabase.from('tasks').insert({
    user_id: user.id, title, due_date: due_date ?? null, priority: priority ?? 2
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
