// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isMemberRoute = req.nextUrl.pathname.startsWith('/member');
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth/');

    // If trying to access auth routes while logged in, redirect to appropriate dashboard
    if (isAuthRoute && isAuthenticated) {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Handle protected routes access
    if (isAdminRoute || isMemberRoute) {
      if (!isAuthenticated) {
        // Save the attempted URL to redirect back after login
        const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
      }

      // Check role permissions
      if (isAdminRoute && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/member', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. root path (/)
     * 2. api routes (/api/)
     * 3. static files (/_next/, /images/, /favicon.ico, etc.)
     */
    '/((?!api|_next|images|favicon.ico|auth|$).*)',
  ],
};
