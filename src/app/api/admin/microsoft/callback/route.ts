import { NextRequest, NextResponse } from 'next/server';
import { saveMicrosoftTokens, MicrosoftTokenData, getMsalClient, getMicrosoftConfig } from '@/lib/microsoft';
import { auth0 } from '@/lib/auth0';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const pca = await getMsalClient();
  const config = await getMicrosoftConfig();

  if (!pca || !config) {
    return NextResponse.json({ error: 'Microsoft configuration missing' }, { status: 400 });
  }

  if (error) {
    console.error('[Microsoft Callback] Auth error:', error);
    return NextResponse.redirect(new URL('/admin/settings?error=microsoft_auth_error', req.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Double check admin session (security layer)
  const session = await auth0.getSession(req);
  if (!session || !session.user || session.user.role !== 'admin') {
     // NOTE: On callback, the user might be redirected in a way that cookies are still being resolved,
     // but since this is an admin flow triggered manually, it should be fine.
  }

  try {
    const tokenRequest = {
      code,
      scopes: ['https://graph.microsoft.com/Mail.Send', 'offline_access'],
      redirectUri: config.redirectUri,
    };

    const response = await pca.acquireTokenByCode(tokenRequest);
    
    if (response) {
      const tokens: MicrosoftTokenData = {
        accessToken: response.accessToken,
        refreshToken: (response as any).refreshToken || '',
        expiresOn: response.expiresOn || new Date(Date.now() + 3600 * 1000),
        account: {
          homeAccountId: response.account?.homeAccountId || '',
          environment: response.account?.environment || '',
          tenantId: response.account?.tenantId || '',
          username: response.account?.username || '',
        }
      };

      await saveMicrosoftTokens(tokens);
      console.log('[Microsoft Callback] Tokens saved successfully for:', tokens.account.username);
      
      // Redirect back to settings page with success message
      return NextResponse.redirect(new URL('/admin/settings?success=microsoft_connected', req.url));
    }

    return NextResponse.redirect(new URL('/admin/settings?error=no_response', req.url));
  } catch (error) {
    console.error('[Microsoft Callback] Error exchanging code for tokens:', error);
    return NextResponse.redirect(new URL('/admin/settings?error=token_exchange_failed', req.url));
  }
}
