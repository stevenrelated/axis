import 'server-only';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { AppSession } from '@/lib/auth/session';
import { cache } from 'react';

function getAnonEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
  }
  return { url, key };
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = getAnonEnv();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // no-op in pure server component context
      },
      remove() {
        // no-op in pure server component context
      },
    },
    cookieOptions: { lifetime: 60 * 60 * 24 * 365 },
  });
}

export function getSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, key } = getAnonEnv();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
    cookieOptions: { lifetime: 60 * 60 * 24 * 365 },
  });
}

export const getSupabaseSession = cache(
  async (): Promise<AppSession | null> => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return null;

    const email = user.email ?? null;

    return {
      user: { id: user.id, email, type: 'regular' },
    } satisfies AppSession;
  },
);
