import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/ssr';
import { upsertAuthUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/';
  const code = url.searchParams.get('code');

  // This route is primarily for OAuth code exchanges (if enabled).
  // For email OTP, verification happens client-side, so this isn't used.
  // If accessed directly or without a code, redirect to login.

  if (code) {
    const response = NextResponse.redirect(new URL(next, url.origin));
    const supabase = getSupabaseRouteClient(request, response);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL('/login?error=callback_failed', url.origin),
      );
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        await upsertAuthUser(user.id, user.email ?? null);
      }
    } catch {}
    return response;
  }

  return NextResponse.redirect(
    new URL('/login?error=invalid_callback', url.origin),
  );
}

export const runtime = 'nodejs';
