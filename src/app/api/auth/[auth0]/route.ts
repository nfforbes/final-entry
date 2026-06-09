import { auth0 } from '@/lib/auth0';

/**
 * Auth0 SDK v4 route handler.
 * Handles all /auth/* routes:
 *   GET /api/auth/[auth0]  → matched by the SDK based on the segment
 *
 * The SDK's handleAuth() resolves the following routes automatically:
 *   /auth/login            → initiates the Auth0 login flow
 *   /auth/callback         → handles the OAuth callback & token exchange
 *   /auth/logout           → clears the session and logs out
 *   /auth/profile          → returns the current session user profile
 *
 * Without this file Auth0 has no handler to receive the callback from
 * Universal Login, causing it to show a 404 on the Next.js side.
 */
export const GET = auth0.handleAuth();
export const POST = auth0.handleAuth();
