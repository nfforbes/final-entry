'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Divider, Alert, CircularProgress, TextField, Chip, Grid } from '@mui/material';
import { Microsoft as MicrosoftIcon, Google as GoogleIcon, Email as EmailIcon, Done as DoneIcon, Warning as WarningIcon, Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
  surfaceMid: '#1a1a20',
};

interface IntegrationStatus {
  microsoft: {
    connected: boolean;
    email: string | null;
    lastUpdated: string | null;
    config: {
      clientId: string;
      clientSecret: string;
      tenantId: string;
      redirectUri: string;
    } | null;
  };
  google: {
    connected: boolean;
    email: string | null;
    lastUpdated: string | null;
    config: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    } | null;
  };
}

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Microsoft Config States
  const [msClientId, setMsClientId] = useState('');
  const [msClientSecret, setMsClientSecret] = useState('');
  const [msTenantId, setMsTenantId] = useState('common');
  const [msRedirectUri, setMsRedirectUri] = useState('http://localhost:3000/api/admin/microsoft/callback');
  const [savingMSConfig, setSavingMSConfig] = useState(false);

  // Google Config States
  const [gClientId, setGClientId] = useState('');
  const [gClientSecret, setGClientSecret] = useState('');
  const [gRedirectUri, setGRedirectUri] = useState('https://localhost:3000/api/admin/google/callback');
  const [savingGConfig, setSavingGConfig] = useState(false);

  // Test Email States
  const [testingMS, setTestingMS] = useState(false);
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [msRecipient, setMsRecipient] = useState('');
  const [googleRecipient, setGoogleRecipient] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings');
      setStatus(data);

      // Initialize config fields with fetched data
      if (data.microsoft.config) {
        setMsClientId(data.microsoft.config.clientId);
        setMsClientSecret(data.microsoft.config.clientSecret);
        setMsTenantId(data.microsoft.config.tenantId);
        setMsRedirectUri(data.microsoft.config.redirectUri);
      }
      if (data.google.config) {
        setGClientId(data.google.config.clientId);
        setGClientSecret(data.google.config.clientSecret);
        setGRedirectUri(data.google.config.redirectUri);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check URL params for success/error from OAuth flow
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success === 'microsoft_connected') {
      setFeedback({ type: 'success', message: 'Microsoft account connected successfully!' });
    } else if (success === 'google_connected') {
      setFeedback({ type: 'success', message: 'Google account connected successfully!' });
    } else if (params.get('error')) {
      setFeedback({ type: 'error', message: `Integration failed: ${params.get('error')}` });
    }
  }, []);

  const handleSaveMSConfig = async () => {
    setSavingMSConfig(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/settings/config', {
        type: 'microsoft',
        config: {
          clientId: msClientId,
          clientSecret: msClientSecret,
          tenantId: msTenantId,
          redirectUri: msRedirectUri
        }
      });
      setFeedback({ type: 'success', message: 'Microsoft configuration saved!' });
      fetchStatus();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save config' });
    } finally {
      setSavingMSConfig(false);
    }
  };

  const handleSaveGConfig = async () => {
    setSavingGConfig(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/settings/config', {
        type: 'google',
        config: {
          clientId: gClientId,
          clientSecret: gClientSecret,
          redirectUri: gRedirectUri
        }
      });
      setFeedback({ type: 'success', message: 'Google configuration saved!' });
      fetchStatus();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save config' });
    } finally {
      setSavingGConfig(false);
    }
  };

  const handleConnectMS = () => {
    window.location.href = '/api/admin/microsoft/auth';
  };

  const handleConnectGoogle = () => {
    window.location.href = '/api/admin/google/auth';
  };

  const handleSendTestMS = async () => {
    if (!msRecipient) return;
    setTestingMS(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/microsoft/test', { to: msRecipient });
      setFeedback({ type: 'success', message: `Test email sent successfully to ${msRecipient} via Microsoft!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to send test email' });
    } finally {
      setTestingMS(false);
    }
  };

  const handleSendTestGoogle = async () => {
    if (!googleRecipient) return;
    setTestingGoogle(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/google/test', { to: googleRecipient });
      setFeedback({ type: 'success', message: `Test email sent successfully to ${googleRecipient} via Google!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to send test email' });
    } finally {
      setTestingGoogle(false);
    }
  };

  const isGoogleDirty = 
    gClientId !== (status?.google.config?.clientId || '') || 
    gClientSecret !== (status?.google.config?.clientSecret || '') ||
    gRedirectUri !== (status?.google.config?.redirectUri || '');

  const isMicrosoftDirty = 
    msClientId !== (status?.microsoft.config?.clientId || '') || 
    msClientSecret !== (status?.microsoft.config?.clientSecret || '') ||
    msTenantId !== (status?.microsoft.config?.tenantId || '') ||
    msRedirectUri !== (status?.microsoft.config?.redirectUri || '');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: tokens.citrus }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
        System Settings
      </Typography>
      <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 6 }}>
        Configure email integrations and global application defaults.
      </Typography>

      {feedback && (
        <Alert
          severity={feedback.type}
          sx={{ mb: 4, bgcolor: feedback.type === 'success' ? 'rgba(198,241,53,0.1)' : 'rgba(230,57,70,0.1)', color: tokens.chalk }}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Microsoft Integration Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', backgroundImage: 'none', height: '100%' }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <MicrosoftIcon sx={{ color: tokens.citrus }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--font-space-grotesk)' }}>
                    Microsoft / M365
                  </Typography>
                </Box>
                <Chip
                  icon={status?.microsoft.connected ? <DoneIcon /> : <WarningIcon />}
                  label={status?.microsoft.connected ? 'Connected' : 'Not Linked'}
                  color={status?.microsoft.connected ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${tokens.border}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: tokens.citrus }}>
                  App Registration Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Tenant ID"
                    size="small"
                    value={msTenantId}
                    onChange={(e) => setMsTenantId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: tokens.chalk, bgcolor: tokens.obsidian, '& fieldset': { borderColor: tokens.border } } }}
                  />
                  <TextField
                    label="Client ID"
                    size="small"
                    value={msClientId}
                    onChange={(e) => setMsClientId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: tokens.chalk, bgcolor: tokens.obsidian, '& fieldset': { borderColor: tokens.border } } }}
                  />
                  <TextField
                    label="Client Secret"
                    type="password"
                    size="small"
                    value={msClientSecret}
                    onChange={(e) => setMsClientSecret(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: tokens.chalk, bgcolor: tokens.obsidian, '& fieldset': { borderColor: tokens.border } } }}
                  />
                  <Button
                    size="small"
                    onClick={handleSaveMSConfig}
                    disabled={savingMSConfig || !msClientId || !msClientSecret}
                    sx={{ mt: 1, color: tokens.citrus, border: `1px solid ${tokens.citrus}` }}
                  >
                    {savingMSConfig ? <CircularProgress size={16} color="inherit" /> : 'Save Microsoft Config'}
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ borderColor: tokens.border, my: 1, mb: 3 }} />

              <Box sx={{ flexGrow: 1 }}>
                {!status?.microsoft.connected || isMicrosoftDirty ? (
                  <Box>
                    <Typography sx={{ mb: 3, color: 'rgba(246,243,236,0.7)', variant: 'body2' }}>
                      {status?.microsoft.connected 
                        ? 'Configuration modified. Save and re-authorize to apply changes.'
                        : 'Once configuration is saved, click below to authorize the system.'}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConnectMS}
                      disabled={!status?.microsoft.config || (isMicrosoftDirty && !status?.google.config)} // Needs save first if dirty state logic is strict, but I'll allow click
                      startIcon={<MicrosoftIcon />}
                      sx={{
                        bgcolor: tokens.citrus,
                        color: tokens.obsidian,
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: '12px',
                        '&:hover': { bgcolor: tokens.chalk },
                        '&.Mui-disabled': { bgcolor: 'rgba(198,241,53,0.1)', color: 'rgba(246,243,236,0.2)' }
                      }}
                    >
                      {status?.microsoft.connected ? 'Update & Authorize' : 'Authorize Microsoft'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="overline" sx={{ color: 'rgba(246,243,236,0.4)', fontWeight: 700 }}>
                        Active Master Account
                      </Typography>
                      <Typography sx={{ color: tokens.chalk, fontWeight: 500 }}>
                        {status.microsoft.email}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: tokens.surfaceMid, borderRadius: '12px', border: `1px solid ${tokens.border}` }}>
                      <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: 'rgba(246,243,236,0.6)' }}>
                        Verify Integration
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TextField
                          size="small"
                          placeholder="Recipient"
                          value={msRecipient}
                          onChange={(e) => setMsRecipient(e.target.value)}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              color: tokens.chalk,
                              bgcolor: tokens.obsidian,
                              fontSize: '0.875rem',
                              '& fieldset': { borderColor: tokens.border },
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleSendTestMS}
                          disabled={testingMS || !msRecipient}
                          sx={{ borderColor: tokens.citrus, color: tokens.citrus, minWidth: 0 }}
                        >
                          {testingMS ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleConnectMS}
                        sx={{ 
                          color: tokens.citrus, 
                          borderColor: 'rgba(198,241,53,0.3)', 
                          textTransform: 'none', 
                          fontWeight: 600,
                          '&:hover': { borderColor: tokens.citrus, bgcolor: 'rgba(198,241,53,0.05)' } 
                        }}
                      >
                        Re-authorize or Change Account
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Google Integration Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', backgroundImage: 'none', height: '100%' }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <GoogleIcon sx={{ color: tokens.citrus }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--font-space-grotesk)' }}>
                    Google / Gmail
                  </Typography>
                </Box>
                <Chip
                  icon={status?.google.connected ? <DoneIcon /> : <WarningIcon />}
                  label={status?.google.connected ? 'Connected' : 'Not Linked'}
                  color={status?.google.connected ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${tokens.border}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: tokens.citrus }}>
                  Cloud Console Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Client ID"
                    size="small"
                    value={gClientId}
                    onChange={(e) => setGClientId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: tokens.chalk, bgcolor: tokens.obsidian, '& fieldset': { borderColor: tokens.border } } }}
                  />
                  <TextField
                    label="Client Secret"
                    type="password"
                    size="small"
                    value={gClientSecret}
                    onChange={(e) => setGClientSecret(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: tokens.chalk, bgcolor: tokens.obsidian, '& fieldset': { borderColor: tokens.border } } }}
                  />
                  <Button
                    size="small"
                    onClick={handleSaveGConfig}
                    disabled={savingGConfig || !gClientId || !gClientSecret}
                    sx={{ mt: 1, color: tokens.citrus, border: `1px solid ${tokens.citrus}` }}
                  >
                    {savingGConfig ? <CircularProgress size={16} color="inherit" /> : 'Save Google Config'}
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ borderColor: tokens.border, my: 1, mb: 3 }} />

              <Box sx={{ flexGrow: 1 }}>
                {!status?.google.connected || isGoogleDirty ? (
                  <Box>
                    <Typography sx={{ mb: 3, color: 'rgba(246,243,236,0.7)', variant: 'body2' }}>
                      {status?.google.connected 
                        ? 'Configuration modified. Save and re-authorize to apply changes.'
                        : 'Once configuration is saved, click below to authorize the system.'}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConnectGoogle}
                      disabled={!status?.google.config}
                      startIcon={<GoogleIcon />}
                      sx={{
                        bgcolor: tokens.citrus,
                        color: tokens.obsidian,
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: '12px',
                        '&:hover': { bgcolor: tokens.chalk },
                        '&.Mui-disabled': { bgcolor: 'rgba(198,241,53,0.1)', color: 'rgba(246,243,236,0.2)' }
                      }}
                    >
                      {status?.google.connected ? 'Update & Authorize' : 'Authorize Google'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="overline" sx={{ color: 'rgba(246,243,236,0.4)', fontWeight: 700 }}>
                        Active Master Account
                      </Typography>
                      <Typography sx={{ color: tokens.chalk, fontWeight: 500 }}>
                        {status.google.email}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: tokens.surfaceMid, borderRadius: '12px', border: `1px solid ${tokens.border}` }}>
                      <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 600, color: 'rgba(246,243,236,0.6)' }}>
                        Verify Integration
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TextField
                          size="small"
                          placeholder="Recipient"
                          value={googleRecipient}
                          onChange={(e) => setGoogleRecipient(e.target.value)}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              color: tokens.chalk,
                              bgcolor: tokens.obsidian,
                              fontSize: '0.875rem',
                              '& fieldset': { borderColor: tokens.border },
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleSendTestGoogle}
                          disabled={testingGoogle || !googleRecipient}
                          sx={{ borderColor: tokens.citrus, color: tokens.citrus, minWidth: 0 }}
                        >
                          {testingGoogle ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleConnectGoogle}
                        sx={{ 
                          color: tokens.citrus, 
                          borderColor: 'rgba(198,241,53,0.3)', 
                          textTransform: 'none', 
                          fontWeight: 600,
                          '&:hover': { borderColor: tokens.citrus, bgcolor: 'rgba(198,241,53,0.05)' } 
                        }}
                      >
                        Re-authorize or Change Account
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body2" sx={{ color: 'rgba(246,243,236,0.3)', textAlign: 'center', mt: 8 }}>
        System settings are only accessible to administrators. Ensure your .env.local contains the required credentials for both providers.
      </Typography>
    </Box>
  );
}
