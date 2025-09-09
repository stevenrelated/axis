'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  // At runtime this should be defined in the environment
  // Avoid throwing to not break client bundle build
  // eslint-disable-next-line no-console
  console.warn(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );
}

export const supabaseBrowser = createClient(url ?? '', key ?? '');
