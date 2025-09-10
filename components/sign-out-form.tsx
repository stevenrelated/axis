'use client';

import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';
import { supabaseBrowser } from '@/lib/supabase/client';

export const SignOutForm = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) {
      toast({ type: 'error', description: 'Failed to sign out' });
    } else {
      toast({ type: 'success', description: 'Signed out successfully' });
      router.push('/login'); // Or '/' if preferred
      router.refresh(); // Ensure session clears
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full text-left px-1 py-0.5 text-red-500"
    >
      Sign out
    </button>
  );
};
