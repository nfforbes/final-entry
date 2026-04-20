import { NextResponse, type NextRequest } from 'next/server.js';
import { auth0 } from './lib/auth0';

/**
 * Next.js 16 Proxy Boundary
 * Dynamically intercepts and handles authentication routes (/auth/*)
 * and manages session rolling at the network edge.
 */
export async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`[Proxy] Intercepting: ${request.method} ${url.pathname}`);

  try {
    // Ensure a session exists for /admin routes.
    // Detailed authorization is handled in the Server-side layout.
    if (url.pathname.startsWith('/admin')) {
      const session = await auth0.getSession(request);
      if (!session) {
        console.warn(`[Proxy] Unauthenticated access attempt to ${url.pathname}`);
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    const response = await auth0.middleware(request);
    
    if (response) {
      // Only short-circuit if it's a redirect (auth flow) or an auth-specific endpoint
      if (response.status >= 300 && response.status < 400 || url.pathname.includes('/api/auth')) {
        console.log(`[Proxy] Auth0 handled route (Short-circuit): ${url.pathname} -> Status: ${response.status}`);
        return response;
      }
      
      // For all other cases (e.g. session rolling 200), we should continue the request 
      // but ensure we pass through any headers (like Set-Cookie) from the Auth0 middleware
      console.log(`[Proxy] Auth0 processed route (Continuing): ${url.pathname} -> Status: ${response.status}`);
      const nextResponse = NextResponse.next();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          nextResponse.headers.append(key, value);
        }
      });
      return nextResponse;
    }

    console.log(`[Proxy] Auth0 skipped route: ${url.pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error('[Proxy] Auth0 error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for internal Next.js paths and metadata:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};

