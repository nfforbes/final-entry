'use client';

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, useMediaQuery, Theme } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, ShoppingCart as OrdersIcon, Settings as SettingsIcon, ExitToApp as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DRAWER_WIDTH = 280;

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: tokens.obsidian, color: tokens.chalk, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 32, height: 32, bgcolor: tokens.citrus, borderRadius: '4px' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-space-grotesk)' }}>
          ADMIN PORTAL
        </Typography>
      </Box>

      <Divider sx={{ borderColor: tokens.border, mx: 2 }} />

      <List sx={{ px: 2, py: 4, flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  borderRadius: '12px',
                  bgcolor: isActive ? 'rgba(198, 241, 53, 0.1)' : 'transparent',
                  color: isActive ? tokens.citrus : tokens.chalk,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  slotProps={{ 
                    primary: {
                      sx: { 
                        fontWeight: isActive ? 600 : 400,
                        fontFamily: 'var(--font-space-grotesk)'
                      } 
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: tokens.border, mx: 2 }} />

      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            href="/auth/logout"
            sx={{
              borderRadius: '12px',
              color: '#e63946',
              '&:hover': {
                bgcolor: 'rgba(230, 57, 70, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" slotProps={{ primary: { sx: { fontFamily: 'var(--font-space-grotesk)' } } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${tokens.border}`,
              borderLeft: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              bgcolor: tokens.obsidian,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Sidebar for Mobile */}
      {isMobile && (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200, color: tokens.chalk, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: tokens.obsidian },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 6 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          color: tokens.chalk,
          fontFamily: 'var(--font-space-grotesk)',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
