import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/ssr';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  const supabase = getSupabaseRouteClient(request, response);
  await supabase.auth.signOut();
  return response;
}
