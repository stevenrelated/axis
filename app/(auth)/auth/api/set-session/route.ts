import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/ssr';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const supabase = getSupabaseRouteClient(request, response);

  try {
    const body = await request.json();
    if (body?.token_hash && body?.type === 'magiclink') {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: body.token_hash,
        type: 'magiclink',
      });
      if (error) return NextResponse.json({ ok: false }, { status: 400 });
      return response;
    }

    if (body?.access_token && body?.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      });
      if (error) return NextResponse.json({ ok: false }, { status: 400 });
      return response;
    }
  } catch {}

  return NextResponse.json({ ok: false }, { status: 400 });
}

export const runtime = 'nodejs';
