import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'edge';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

interface JWTPayload {
  userId: number;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // API rotalarını atla
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Login sayfasını atla
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Korumalı rotaları kontrol et
  const protectedRoutes = ['/reminders', '/health-tracking', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('authToken');
  
  if (!authToken?.value) {
    console.log('No auth token found, redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const verified = await jwtVerify(authToken.value, secret);
    const { userId } = verified.payload as unknown as JWTPayload;
    console.log('Token verified, user:', { userId });

    // Admin rotaları için rol kontrolü
    if (pathname.startsWith('/admin')) {
      console.log('Checking admin access');
      const response = await fetch(new URL('/api/auth/check', request.url), {
        headers: {
          Cookie: `authToken=${authToken.value}`
        }
      });
      
      if (!response.ok) {
        console.log('Auth check failed');
        return NextResponse.redirect(new URL('/', request.url));
      }

      const data = await response.json();
      console.log('User data:', data);

      if (data.user.role !== 'admin') {
        console.log('User is not admin, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/reminders',
    '/reminders/:path*',
    '/health-tracking',
    '/health-tracking/:path*',
    '/admin',
    '/admin/:path*'
  ]
}; 