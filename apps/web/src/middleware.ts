import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './lib/server/auth-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect sensitive server-side routes
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isFarmerApi = pathname.startsWith('/api/admin/farmers');

  if (isAdminRoute || isFarmerApi) {
    const sessionCookie = request.cookies.get('farmlink_session_token')?.value;

    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: missing session token' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login?role=admin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifySessionToken(sessionCookie);

    if (!payload || payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: administrative privileges required' },
          { status: 403 }
        );
      }
      const loginUrl = new URL('/login?role=admin&error=forbidden', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
