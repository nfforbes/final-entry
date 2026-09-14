import React from 'react';
import { redirect } from 'next/navigation';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon, Dashboard as DashIcon, Person as UserIcon } from '@mui/icons-material';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/logout?returnTo=/');
  }

  try {
    await connectDB();
    const user = await Customer.findOne({ auth0Id: session.user.sub });

    if (!user || user.role !== 'technician') {
      redirect('/auth/logout?returnTo=/');
    }
  } catch (error) {
    console.error('[TechnicianGuard] Authorization error:', error);
    redirect('/auth/logout?returnTo=/');
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: tokens.obsidian,
      color: tokens.chalk,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: tokens.surface,
          borderBottom: `1px solid ${tokens.border}`,
          backgroundImage: 'none',
          boxShadow: 'none'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: tokens.citrus,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DashIcon sx={{ color: tokens.obsidian, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                Driver Portal
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                href="/auth/logout?returnTo=/"
                startIcon={<LogoutIcon />}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'none',
                  '&:hover': { color: tokens.citrus }
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          bgcolor: tokens.surface,
          borderTop: `1px solid ${tokens.border}`,
          zIndex: 1000,
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        <DashIcon sx={{ color: tokens.citrus }} />
        <UserIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
      </Box>
    </Box>
  );
}
