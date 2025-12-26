import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Allow system files
  if (pathname.startsWith('/_next')) return NextResponse.next();

  // 2. If NO token exists
  if (!token) {
    // Let them stay on public pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/forgotpassword' || pathname.startsWith('/reset-password')) {
      return NextResponse.next();
    }
    // Otherwise, force login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 3. We have a token - decode it
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64));
    const userRole = decoded.role;
    const currentTime = Math.floor(Date.now() / 1000);

    // 4. Check if token is expired
    if (decoded.exp && decoded.exp < currentTime) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // 5. PREVENT LOGGED-IN USERS FROM SEEING /login OR /signup
    if (pathname === '/login' || pathname === '/signup') {
      const target = userRole === 'artist' ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // --- ARTIST RULES ---
    if (userRole === 'artist') {
      const isArtistPath = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/profile') || 
                           pathname.startsWith('/mysongs');
      if (!isArtistPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // --- LISTENER RULES ---
    if (userRole === 'listener') {
      if (pathname.startsWith('/dashboard')|| pathname.startsWith('/mysongs')) {
        return NextResponse.redirect(new URL('/', request.url)); 
      }
    }

  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',        // Added to matcher
    '/signup',       // Added to matcher
    '/search/:path*',
    '/playlist/:path*',
    '/favorite/:path*',
    '/recent/:path*',
    '/trending/:path*',
    '/dashboard/:path*', 
    '/mysongs/:path*',   
    '/profile/:path*'
  ],
};