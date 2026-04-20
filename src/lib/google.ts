import { google } from 'googleapis';
import { Setting } from '@/models/Setting';
import { connectDB } from './mongodb';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export async function getGoogleConfig(): Promise<GoogleConfig | null> {
  await connectDB();
  const setting = await Setting.findOne({ key: 'google_config' });
  if (!setting) {
    const baseUrl = process.env.APP_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
                    
    if (process.env.GOOGLE_CLIENT_ID) {
      return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/admin/google/callback`,
      };
    }
    return null;
  }

  try {
    return JSON.parse(setting.value);
  } catch (e) {
    console.error('[Google] Error parsing config:', e);
    return null;
  }
}

export async function getOauth2Client() {
  const config = await getGoogleConfig();
  if (!config) return null;

  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
}

export interface GoogleTokenData {
  access_token: string;
  refresh_token: string | null;
  expiry_date: number | null;
  email: string | null;
}

export async function getGoogleTokens(): Promise<GoogleTokenData | null> {
  await connectDB();
  const setting = await Setting.findOne({ key: 'google_integration' });
  if (!setting) return null;

  try {
    return JSON.parse(setting.value);
  } catch (e) {
    console.error('[Google] Error parsing token data:', e);
    return null;
  }
}

export async function saveGoogleTokens(tokens: GoogleTokenData) {
  await connectDB();

  // If we don't have a new refresh token, try to preserve the old one
  if (!tokens.refresh_token) {
    const existing = await getGoogleTokens();
    if (existing?.refresh_token) {
      tokens.refresh_token = existing.refresh_token;
    }
  }

  await Setting.findOneAndUpdate(
    { key: 'google_integration' },
    { value: JSON.stringify(tokens) },
    { upsert: true }
  );
}

export async function getValidGoogleAccessToken(): Promise<string | null> {
  const tokens = await getGoogleTokens();
  if (!tokens || !tokens.refresh_token) return null;

  const client = await getOauth2Client();
  if (!client) return null;

  client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });

  // Check if token is expired (with 5 minute buffer)
  const isExpired = tokens.expiry_date ? tokens.expiry_date <= (Date.now() + 5 * 60 * 1000) : true;

  if (!isExpired) {
    return tokens.access_token;
  }

  // Token is expired, refresh it
  console.log('[Google] Access token expired, attempting refresh...');
  try {
    const { credentials } = await client.refreshAccessToken();
    if (credentials) {
      const newTokens: GoogleTokenData = {
        access_token: credentials.access_token || '',
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date || null,
        email: tokens.email // Preserve email
      };

      await saveGoogleTokens(newTokens);
      return credentials.access_token || null;
    }
  } catch (error) {
    console.error('[Google] Error refreshing token:', error);
  }

  return null;
}

export async function sendGmail({ 
  to, 
  subject, 
  htmlBody, 
  attachments 
}: { 
  to: string; 
  subject: string; 
  htmlBody: string;
  attachments?: { name: string; content: string; contentType: string }[];
}) {
  const tokens = await getGoogleTokens();
  const accessToken = await getValidGoogleAccessToken();
  
  if (!accessToken) {
    throw new Error('Google account not connected or could not refresh token.');
  }

  const client = await getOauth2Client();
  if (!client) throw new Error('Google configuration missing');

  client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: client });

  const boundary = `----=_Part_${Date.now()}`;
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  
  let message = [
    `From: Final Entry <${tokens?.email || ''}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    ''
  ];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      message = message.concat([
        `--${boundary}`,
        `Content-Type: ${att.contentType}; name="${att.name}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.name}"`,
        '',
        att.content,
        ''
      ]);
    }
  }

  message.push(`--${boundary}--`);
  const fullMessage = message.join('\r\n');

  // The body needs to be base64url encoded
  const encodedMessage = Buffer.from(fullMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log(`[Google] Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('[Google] Error sending gmail:', error);
    throw error;
  }
}
