import type { ReactNode } from 'react';
import { AuthHeader } from './auth-header';

interface AuthSplitLayoutProps {
  children: ReactNode;
}

export const AuthSplitLayout = ({ children }: AuthSplitLayoutProps) => {
  return (
    <>
      {/* Mobile layout - unchanged */}
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background md:hidden">
        {children}
      </div>

      {/* Desktop split-screen layout */}
      <div className="hidden md:flex h-screen w-screen">
        {/* Left side - Image */}
        <div className="w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'url(https://howgioosfxkhcuefqrdg.supabase.co/storage/v1/object/public/brand/544849424_18104574988592313_7310691179634162227_n.jpg)',
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-white/30" />

            {/* AuthHeader overlay at top, left-aligned */}
            <div className="absolute top-0 left-0 p-8 flex justify-start">
              <AuthHeader />
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-1/2 flex items-center justify-left bg-background p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </>
  );
};
