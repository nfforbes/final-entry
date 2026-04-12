'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Pest Library', href: '/pest-library' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useUser();

  React.useEffect(() => {
    setMounted(true);
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  if (!mounted) return null; // Avoid hydration mismatch by not rendering layout-sensitive parts until mounted

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Toolbar
          sx={{
            maxWidth: '1200px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            height: 72,
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: tokens.citrus,
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: tokens.obsidian,
                  lineHeight: 1,
                }}
              >
                FE
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 700,
                fontSize: '1.3rem',
                color: tokens.chalk,
                letterSpacing: '-0.01em',
              }}
            >
              Final Entry
            </Typography>
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'rgba(246,243,236,0.7)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    '&:hover': { color: tokens.chalk },
                  }}
                >
                  {link.label}
                </Button>
              ))}

              <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                {user ? (
                  <>
                    <Button
                      component={Link}
                      href="/dashboard/customer"
                      variant="text"
                      id="nav-portal"
                      sx={{ color: tokens.citrus, fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      My Portal
                    </Button>
                    <Button
                      href="/api/auth/logout"
                      component="a"
                      variant="outlined"
                      id="nav-logout"
                      sx={{
                        borderColor: tokens.border,
                        color: 'rgba(246,243,236,0.5)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    href="/api/auth/login"
                    component="a"
                    variant="text"
                    id="nav-login"
                    sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.85rem' }}
                  >
                    Sign In
                  </Button>
                )}
                <Button
                  component={Link}
                  href="/booking"
                  variant="contained"
                  id="nav-cta"
                  sx={{
                    bgcolor: tokens.citrus,
                    color: tokens.obsidian,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    px: 2.5,
                  }}
                >
                  Free Quote
                </Button>
              </Box>
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              id="nav-mobile-menu"
              sx={{ color: tokens.chalk }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: tokens.surfaceMid,
              borderLeft: `1px solid ${tokens.border}`,
              p: 3,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: tokens.chalk }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {NAV_LINKS.map((link) => (
            <ListItem
              key={link.href}
              component={Link}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: tokens.chalk,
                borderBottom: `1px solid ${tokens.border}`,
                '&:hover': { color: tokens.citrus },
                textDecoration: 'none',
              }}
            >
              <ListItemText
                primary={link.label}
                slotProps={{ primary: { style: { fontWeight: 600, fontSize: '1.1rem' } } }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            href="/booking"
            variant="contained"
            fullWidth
            id="nav-mobile-cta"
            sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, mb: 1 }}
            onClick={() => setDrawerOpen(false)}
          >
            Free Quote
          </Button>
          {user ? (
            <Button
              href="/api/auth/logout"
              component="a"
              variant="outlined"
              fullWidth
              id="nav-mobile-logout"
              sx={{ borderColor: tokens.border, color: tokens.chalk }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              href="/api/auth/login"
              component="a"
              variant="outlined"
              fullWidth
              id="nav-mobile-login"
              sx={{ borderColor: tokens.border, color: tokens.chalk }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
}
