import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Dashboard as DashIcon, Person as UserIcon } from '@mui/icons-material';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: tokens.obsidian, 
      color: tokens.chalk,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Technician Navbar */}
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
                href="/api/auth/logout" 
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

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation (Optional but professional) */}
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
        <IconButton sx={{ color: tokens.citrus }}><DashIcon /></IconButton>
        <IconButton sx={{ color: 'rgba(255,255,255,0.3)' }}><UserIcon /></IconButton>
      </Box>
    </Box>
  );
}
