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
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

const NAV_LINKS = [
  { label: 'Pest Library', href: '/pest-library' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const SERVICES_NAV = [
  { label: 'Fumigation', href: '/services/fumigation' },
  { label: 'Roach Control', href: '/services/roach-control' },
  { label: 'Termite Control', href: '/services/termite-control' },
  { label: 'Rodent Removal', href: '/services/rodent-removal' },
  { label: 'Mosquito Control', href: '/services/mosquito-control' },
  { label: 'Bed Bug Treatment', href: '/services/bed-bug-treatment' },
  { label: 'General Pest Control', href: '/services/general-pest-control' },
];

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hide Navbar in Admin & Technician Portals
  if (pathname.startsWith('/admin') || pathname.startsWith('/technician')) return null;

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [servicesAnchorEl, setServicesAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useUser();

  const handleServicesClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setServicesAnchorEl(event.currentTarget);
  };

  const handleServicesClose = () => {
    setServicesAnchorEl(null);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  React.useEffect(() => {
    setMounted(true);
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  if (!mounted) return null; // Avoid hydration mismatch by not rendering layout-sensitive parts until mounted

  const isAdmin = (user as any)?.role === 'admin';
  const portalPath = isAdmin ? '/admin/dashboard' : '/dashboard/customer';

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'transparent', 
          backdropFilter: 'none', 
          border: 'none',
          pt: { xs: 1.5, md: 2.5 }
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1200px',
            width: '95%',
            mx: 'auto',
            px: { xs: 1, md: 2 },
            minHeight: { xs: 64, md: 72 },
            background: tokens.white,
            borderRadius: '100px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              pl: { xs: 1, md: 2 },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Final Entry Logo"
              sx={{
                height: { xs: 32, md: 40 },
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                aria-controls={servicesAnchorEl ? 'services-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={servicesAnchorEl ? 'true' : undefined}
                onClick={handleServicesClick}
                endIcon={<KeyboardArrowDownIcon sx={{ 
                  transition: 'transform 0.2s',
                  transform: servicesAnchorEl ? 'rotate(180deg)' : 'none'
                }} />}
                sx={{
                  color: servicesAnchorEl ? tokens.obsidian : 'rgba(11,11,15,0.7)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  px: 2,
                  '&:hover': { 
                    color: tokens.obsidian,
                    bgcolor: 'rgba(0,0,0,0.03)',
                    borderRadius: '20px'
                  },
                }}
              >
                Services
              </Button>

              <Menu
                id="services-menu"
                anchorEl={servicesAnchorEl}
                open={Boolean(servicesAnchorEl)}
                onClose={handleServicesClose}
                slotProps={{
                  list: {
                    'aria-labelledby': 'services-button',
                  },
                  paper: {
                    sx: {
                      mt: 1.5,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      minWidth: 220,
                      overflow: 'hidden',
                      backdropFilter: 'blur(20px)',
                      background: 'rgba(255,255,255,0.95)',
                    }
                  }
                }}
              >
                {SERVICES_NAV.map((service) => (
                  <MenuItem
                    key={service.href}
                    component={Link}
                    href={service.href}
                    onClick={handleServicesClose}
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      py: 1.5,
                      px: 2.5,
                      color: 'rgba(11,11,15,0.8)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(198,241,53,0.1)',
                        color: tokens.obsidian,
                        pl: 3,
                      }
                    }}
                  >
                    {service.label}
                  </MenuItem>
                ))}
              </Menu>

              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'rgba(11,11,15,0.7)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    px: 2,
                    '&:hover': { 
                      color: tokens.obsidian,
                      bgcolor: 'rgba(0,0,0,0.03)',
                      borderRadius: '20px'
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}

              <Box sx={{ ml: 1, display: 'flex', gap: 1, pr: 1 }}>
                {user ? (
                  <>
                    <Button
                      aria-controls={userAnchorEl ? 'user-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={userAnchorEl ? 'true' : undefined}
                      onClick={handleUserClick}
                      endIcon={<KeyboardArrowDownIcon sx={{ 
                        transition: 'transform 0.2s',
                        transform: userAnchorEl ? 'rotate(180deg)' : 'none'
                      }} />}
                      sx={{
                        color: tokens.obsidian,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '20px' },
                      }}
                    >
                      Portal
                    </Button>
                    <Menu
                      id="user-menu"
                      anchorEl={userAnchorEl}
                      open={Boolean(userAnchorEl)}
                      onClose={handleUserClose}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1.5,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            borderRadius: '16px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            minWidth: 180,
                          }
                        }
                      }}
                    >
                      <MenuItem 
                        component={Link} 
                        href={portalPath} 
                        onClick={handleUserClose}
                        sx={{ fontSize: '0.88rem', fontWeight: 500, py: 1.5, color: 'rgba(11,11,15,0.8)' }}
                      >
                        My Dashboard
                      </MenuItem>
                      <MenuItem 
                        component="a" 
                        href="/auth/logout"
                        sx={{ fontSize: '0.88rem', fontWeight: 500, py: 1.5, color: '#e63946' }}
                      >
                        Log Out
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    href="/auth/login"
                    component="a"
                    variant="text"
                    id="nav-login"
                    sx={{ 
                      color: 'rgba(11,11,15,0.6)', 
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
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
                    bgcolor: tokens.obsidian,
                    color: tokens.citrus,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    px: 3,
                    py: 1.2,
                    borderRadius: '40px',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#2D2D3A',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Free Quote
                </Button>
              </Box>
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <Box sx={{ pr: 1 }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                id="nav-mobile-menu"
                sx={{ color: tokens.obsidian }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
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
              bgcolor: tokens.white,
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              p: 3,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: tokens.obsidian }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {/* Mobile Services Collapsible */}
          <ListItem
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            sx={{
              color: tokens.obsidian,
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              '&:hover': { color: tokens.obsidian, bgcolor: 'rgba(0,0,0,0.03)' },
              cursor: 'pointer',
              py: 2,
            }}
          >
            <ListItemText
              primary="Services"
              slotProps={{ primary: { style: { fontWeight: 700, fontSize: '1.2rem' } } }}
            />
            {mobileServicesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {SERVICES_NAV.map((service) => (
                <ListItem
                  key={service.href}
                  component={Link}
                  href={service.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    pl: 4,
                    color: 'rgba(0,0,0,0.6)',
                    borderBottom: '1px solid rgba(0,0,0,0.02)',
                    '&:hover': { color: tokens.citrus, bgcolor: 'rgba(0,0,0,0.01)' },
                    textDecoration: 'none',
                  }}
                >
                  <ListItemText
                    primary={service.label}
                    slotProps={{ primary: { style: { fontWeight: 500, fontSize: '0.95rem' } } }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>

          {NAV_LINKS.map((link) => (
            <ListItem
              key={link.href}
              component={Link}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: tokens.obsidian,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { color: tokens.obsidian, bgcolor: 'rgba(0,0,0,0.03)' },
                textDecoration: 'none',
                py: 2,
              }}
            >
              <ListItemText
                primary={link.label}
                slotProps={{ primary: { style: { fontWeight: 600, fontSize: '1.1rem' } } }}
              />
            </ListItem>
          ))}
          {user && (
            <ListItem
              component={Link}
              href={portalPath}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: tokens.obsidian,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { color: tokens.obsidian, bgcolor: 'rgba(0,0,0,0.03)' },
                textDecoration: 'none',
                py: 2,
              }}
            >
              <ListItemText
                primary="My Portal"
                slotProps={{ primary: { style: { fontWeight: 700, fontSize: '1.1rem', color: tokens.citrus } } }}
              />
            </ListItem>
          )}
        </List>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            href="/booking"
            variant="contained"
            fullWidth
            id="nav-mobile-cta"
            sx={{ 
              bgcolor: tokens.obsidian, 
              color: tokens.citrus, 
              fontWeight: 700, 
              borderRadius: '40px',
              textTransform: 'none',
              mb: 1.5 
            }}
            onClick={() => setDrawerOpen(false)}
          >
            Free Quote
          </Button>
          {user ? (
            <Button
              href="/auth/logout"
              component="a"
              variant="outlined"
              fullWidth
              id="nav-mobile-logout"
              sx={{ 
                borderColor: 'rgba(0,0,0,0.1)', 
                color: tokens.obsidian,
                borderRadius: '40px',
                textTransform: 'none',
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              href="/auth/login"
              component="a"
              variant="outlined"
              fullWidth
              id="nav-mobile-login"
              sx={{ 
                borderColor: 'rgba(0,0,0,0.1)', 
                color: tokens.obsidian,
                borderRadius: '40px',
                textTransform: 'none',
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
}
