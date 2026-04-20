import { NextRequest, NextResponse } from 'next/server';
import { getOauth2Client, saveGoogleTokens, GoogleTokenData } from '@/lib/google';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const client = await getOauth2Client();

  if (!client) {
    return NextResponse.json({ error: 'Google configuration missing' }, { status: 400 });
  }

  if (error) {
    console.error('[Google Callback] Auth error:', error);
    return NextResponse.redirect(new URL('/admin/settings?error=google_auth_error', req.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Fetch user email to store for display
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();

    if (tokens) {
      const tokenData: GoogleTokenData = {
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token || null,
        expiry_date: tokens.expiry_date || null,
        email: userInfo.data.email || null,
      };

      await saveGoogleTokens(tokenData);
      console.log('[Google Callback] Tokens saved successfully for:', tokenData.email);
      
      // Redirect back to settings page with success message
      return NextResponse.redirect(new URL('/admin/settings?success=google_connected', req.url));
    }

    return NextResponse.redirect(new URL('/admin/settings?error=no_response', req.url));
  } catch (error) {
    console.error('[Google Callback] Error exchanging code for tokens:', error);
    return NextResponse.redirect(new URL('/admin/settings?error=token_exchange_failed', req.url));
  }
}
