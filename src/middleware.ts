import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-compatible middleware for route protection
 * 
 * SECURITY NOTE: This middleware provides basic route protection by checking
 * for the presence of Better Auth session cookies. Better Auth cookies are:
 * - Signed and encrypted by Better Auth
 * - Validated server-side in pages for actual authorization
 * - This is a performance optimization to avoid database calls in Edge Runtime
 * 
 * The security model is:
 * 1. Middleware: Basic cookie presence check (Edge Runtime compatible)
 * 2. Server Components: Full session validation with database (Node.js runtime)
 */
export async function middleware(request: NextRequest) {
  // Only apply middleware to protected routes
  if (request.nextUrl.pathname.startsWith('/tutor')) {
    try {
      // Check for Better Auth session cookie
      // Better Auth uses 'better-auth.session_token' as the default cookie name
      const sessionCookie = request.cookies.get('better-auth.session_token');
      
      if (!sessionCookie?.value) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Basic validation - Better Auth cookies are cryptographically signed
      // We don't decode/verify here to maintain Edge Runtime compatibility
      // Full validation happens in server components
      if (sessionCookie.value.length < 10) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to protected routes
    '/tutor/:path*',
  ]
};