import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Check authentication for protected routes
  if (pathname === '/' || pathname.startsWith('/chat/')) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (['/login', '/register'].includes(pathname)) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
