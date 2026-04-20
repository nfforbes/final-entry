import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { Setting } from '@/models/Setting';
import { connectDB } from './mongodb';

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export async function getMicrosoftConfig(): Promise<MicrosoftConfig | null> {
  await connectDB();
  const setting = await Setting.findOne({ key: 'microsoft_config' });
  if (!setting) {
    // Fallback to env for safety during migration
    if (process.env.MICROSOFT_CLIENT_ID) {
      return {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
        tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/admin/microsoft/callback',
      };
    }
    return null;
  }
  
  try {
    return JSON.parse(setting.value);
  } catch (e) {
    console.error('[Microsoft] Error parsing config:', e);
    return null;
  }
}

export async function getMsalClient() {
  const config = await getMicrosoftConfig();
  if (!config) return null;

  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      clientSecret: config.clientSecret,
    }
  };

  return new msal.ConfidentialClientApplication(msalConfig);
}

export interface MicrosoftTokenData {
  accessToken: string;
  refreshToken: string;
  expiresOn: Date;
  account: {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
  };
}

export async function getMicrosoftTokens(): Promise<MicrosoftTokenData | null> {
  await connectDB();
  const setting = await Setting.findOne({ key: 'microsoft_integration' });
  if (!setting) return null;
  
  try {
    return JSON.parse(setting.value);
  } catch (e) {
    console.error('[Microsoft] Error parsing token data:', e);
    return null;
  }
}

export async function saveMicrosoftTokens(tokens: MicrosoftTokenData) {
  await connectDB();
  await Setting.findOneAndUpdate(
    { key: 'microsoft_integration' },
    { value: JSON.stringify(tokens) },
    { upsert: true }
  );
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getMicrosoftTokens();
  if (!tokens) return null;

  // Check if token is expired (with 5 minute buffer)
  if (new Date(tokens.expiresOn).getTime() > Date.now() + 5 * 60 * 1000) {
    return tokens.accessToken;
  }

  // Token is expired, try refreshing
  const pca = await getMsalClient();
  if (!pca) return null;

  console.log('[Microsoft] Access token expired, attempting refresh...');
  try {
    const refreshTokenRequest = {
      refreshToken: tokens.refreshToken,
      scopes: ['https://graph.microsoft.com/Mail.Send', 'offline_access'],
    };

    const response = await pca.acquireTokenByRefreshToken(refreshTokenRequest);
    
    if (response) {
      const newTokens: MicrosoftTokenData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || tokens.refreshToken,
        expiresOn: response.expiresOn || new Date(Date.now() + 3600 * 1000),
        account: {
          homeAccountId: response.account?.homeAccountId || tokens.account.homeAccountId,
          environment: response.account?.environment || tokens.account.environment,
          tenantId: response.account?.tenantId || tokens.account.tenantId,
          username: response.account?.username || tokens.account.username,
        }
      };
      
      await saveMicrosoftTokens(newTokens);
      return newTokens.accessToken;
    }
  } catch (error) {
    console.error('[Microsoft] Error refreshing token:', error);
  }
  
  return null;
}

export async function sendEmail({ to, subject, htmlBody, attachments }: { 
  to: string; 
  subject: string; 
  htmlBody: string;
  attachments?: { name: string; content: string; contentType: string }[];
}) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('Microsoft account not connected or could not refresh token.');
  }

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  const mail: any = {
    message: {
      from: {
        emailAddress: {
          name: 'Final Entry',
        },
      },
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlBody,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
      attachments: attachments?.map(att => ({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: att.name,
        contentType: att.contentType,
        contentBytes: att.content,
      })) || []
    },
  };

  try {
    await client.api('/me/sendMail').post(mail);
    console.log(`[Microsoft] Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('[Microsoft] Error sending email:', error);
    throw error;
  }
}
