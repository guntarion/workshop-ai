// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isMemberRoute = req.nextUrl.pathname.startsWith('/member');

    // Handle authenticated routes
    if (isAdminRoute || isMemberRoute) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      // Check role permissions
      if (isAdminRoute && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/member', req.url));
      }

      if (isMemberRoute && !['admin', 'member'].includes(token?.role as string)) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    // Allow access to auth routes when not authenticated
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth/');
    if (isAuthRoute && isAuthenticated) {
      // Redirect authenticated users away from auth pages
      return NextResponse.redirect(new URL('/', req.url));
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
  matcher: ['/admin/:path*', '/member/:path*', '/auth/login', '/auth/register', '/auth/forgot-password'],
};
