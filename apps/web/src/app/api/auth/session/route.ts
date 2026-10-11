import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/server/auth-session';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('farmlink_session_token')?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const payload = await verifySessionToken(sessionCookie);

    if (!payload) {
      // Invalid or expired token
      const response = NextResponse.json({
        authenticated: false,
        user: null,
      });
      // Clear invalid cookie
      response.cookies.set({
        name: 'farmlink_session_token',
        value: '',
        path: '/',
        maxAge: 0,
      });
      response.cookies.set({
        name: 'farmlink_role',
        value: '',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: payload.userId,
        role: payload.role,
        phone: payload.phone,
        expiresAt: payload.expiresAt,
      },
    });
  } catch (error) {
    console.error('[AuthSessionAPI] Error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Logout endpoint: invalidate cookies
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set({
    name: 'farmlink_session_token',
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict',
  });

  response.cookies.set({
    name: 'farmlink_role',
    value: '',
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
