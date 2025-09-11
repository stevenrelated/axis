'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { AuthSplitLayout } from '@/components/auth-split-layout';
import { SubmitButton } from '@/components/submit-button';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from '@/components/icons';

import { toast } from '@/components/toast';
import { supabaseBrowser } from '@/lib/supabase/client';

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (error) {
      toast({ type: 'error', description: `Error: ${error}` });
    }
  }, [error]);

  const handleSendOtp = async (formData: FormData) => {
    const inputEmail = formData.get('email') as string;
    setEmail(inputEmail);
    try {
      localStorage.setItem('last-auth-email', inputEmail || '');
    } catch {}
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: inputEmail,
    });
    if (error) {
      toast({ type: 'error', description: 'Failed to send OTP code.' });
      return;
    }
    setIsOtpSent(true);
    toast({
      type: 'success',
      description: 'Check your email for the OTP code.',
    });
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    const { error } = await supabaseBrowser.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setIsVerifying(false);
    if (error) {
      toast({
        type: 'error',
        description: `Invalid or expired code: ${error.message}`,
      });
      return;
    }

    // Sync session with server cookies
    const {
      data: { session },
      error: sessionError,
    } = await supabaseBrowser.auth.getSession();
    if (sessionError || !session) {
      toast({
        type: 'error',
        description: 'Failed to get session after verification.',
      });
      return;
    }

    const res = await fetch('/auth/api/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }),
    });

    if (!res.ok) {
      toast({ type: 'error', description: 'Failed to set server session.' });
      return;
    }

    toast({
      type: 'success',
      description: 'Account created successfully!',
    });
    router.push('/');
  };

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with an OTP code
          </p>
        </div>
        {!isOtpSent ? (
          <AuthForm action={handleSendOtp} defaultEmail={email}>
            <SubmitButton isSuccessful={false}>Send OTP Code</SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {'Already have an account? '}
              <Link
                href="/login"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign in
              </Link>
              {' instead.'}
            </p>
          </AuthForm>
        ) : (
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <label htmlFor="otp-code" className="text-sm font-medium">
              Enter OTP Code
            </label>
            <input
              id="otp-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border p-2 rounded"
              placeholder="123456"
              maxLength={6}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="relative"
            >
              Verify Code
              {isVerifying && (
                <span className="animate-spin absolute right-4">
                  <LoaderIcon />
                </span>
              )}
            </Button>
            <button
              type="button"
              className="text-sm text-gray-500 underline"
              onClick={() => setIsOtpSent(false)}
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterInner />
    </Suspense>
  );
}
