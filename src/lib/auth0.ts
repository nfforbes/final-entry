// Auth0 v4 for Next.js App Router
// Auth0Client handles session management, token exchange, and middleware
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server.js';

const getAppBaseUrl = () => {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.AUTH0_BASE_URL) return process.env.AUTH0_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

const appBaseUrl = getAppBaseUrl();
console.log(`[Auth0] Initializing with appBaseUrl: ${appBaseUrl}`);

export const auth0 = new Auth0Client({
  // The SDK expects a bare domain string (e.g. "n4consulting.us.auth0.com"),
  // NOT a full URL. Falls back to AUTH0_DOMAIN env var.
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl,
  // AUTH0_SECRET must be a unique 32-byte encryption key, NOT the client secret
  secret: process.env.AUTH0_SECRET,
  onCallback: async (error, ctx, session) => {
    const currentBaseUrl = ctx.appBaseUrl || appBaseUrl;

    if (error) {
      console.error('[Auth0] Callback error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=callback', currentBaseUrl));
    }

    if (session) {
      const { user } = session;
      console.log(`[Auth0] onCallback triggered for user: ${user?.email}`);

      if (user && user.sub && user.email) {
        // Use an internal fetch call to trigger MongoDB sync in a Node.js route handler.
        // This keeps the middleware (Edge Runtime) compatible with Node constraints.
        try {
          const syncUrl = new URL('/api/users/sync', currentBaseUrl);
          console.log(`[Auth0] Triggering background sync via: ${syncUrl.toString()}`);
          
          const syncResponse = await fetch(syncUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: {
                sub: user.sub,
                email: user.email,
                name: user.name || user.nickname || user.email,
              },
              secret: process.env.INTERNAL_SYNC_SECRET,
            }),
          });
          
          const syncData = await syncResponse.json();
          console.log('[Auth0] Sync request completed:', syncData.success ? 'Success' : 'Failed');

          // Inject role into session for middleware checks
          if (syncData.user && session.user) {
            session.user.role = syncData.user.role;
          }

          // Role-based redirections
          if (syncData.user?.role === 'admin') {
            console.log(`[Auth0] Admin detected, redirecting to /admin/dashboard`);
            return NextResponse.redirect(new URL('/admin/dashboard', currentBaseUrl));
          }

          if (syncData.user?.role === 'technician') {
            console.log(`[Auth0] Technician detected, redirecting to /technician/dashboard`);
            return NextResponse.redirect(new URL('/technician/dashboard', currentBaseUrl));
          }
        } catch (syncError) {
          console.error('[Auth0] Failed to dispatch sync request:', syncError);
        }
      }
    }
    
    const returnTo = ctx.returnTo || '/';
    return NextResponse.redirect(new URL(returnTo, currentBaseUrl));
  },
});

