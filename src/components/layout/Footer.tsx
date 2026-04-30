'use client';

import { Box, Typography, Link as MuiLink, Divider, Stack } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';

const SERVICES_LINKS = [
  { label: 'Fumigation', href: '/services/fumigation' },
  { label: 'Termite Control', href: '/services/termite-control' },
  { label: 'Rodent Removal', href: '/services/rodent-removal' },
  { label: 'Mosquito Control', href: '/services/mosquito-control' },
  { label: 'Bed Bug Treatment', href: '/services/bed-bug-treatment' },
  { label: 'General Pest Control', href: '/services/general-pest-control' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Pest Library', href: '/pest-library' },
  { label: 'Blog & Tips', href: '/blog' },
];

const columnHeadingSx = {
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: tokens.chalk,
  mb: 2,
};

const linkSx = {
  color: 'rgba(246,243,236,0.5)',
  fontSize: '0.88rem',
  '&:hover': { color: tokens.citrus },
  transition: 'color 0.2s',
};

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide Footer in Admin Portal
  if (pathname.startsWith('/admin')) return null;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: tokens.surfaceDark,
        borderTop: `1px solid ${tokens.border}`,
        pt: 8,
        pb: 4,
        px: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* 4-column footer grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1.5fr 1fr 1.5fr' },
            gap: 6,
            mb: 6,
          }}
        >
          {/* Brand column */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Final Entry Logo"
                sx={{
                  height: 48,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              sx={{
                color: 'rgba(246,243,236,0.5)',
                fontSize: '0.88rem',
                lineHeight: 1.7,
                maxWidth: 280,
                mb: 3,
              }}
            >
              Jamaica&apos;s premier fumigation authority. Serving all 14 parishes
              with licensed, insured, guaranteed professionals.
            </Typography>
            <Stack spacing={0.5}>
              <Typography sx={{ color: tokens.citrus, fontWeight: 600, fontSize: '0.88rem' }}>
                📞 +1 (876) 277-4040
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.5)', fontSize: '0.85rem' }}>
                info@finalentry.com.jm
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.5)', fontSize: '0.85rem' }}>
                Kingston, Jamaica 🇯🇲
              </Typography>
            </Stack>
          </Box>

          {/* Services column */}
          <Box>
            <Typography sx={columnHeadingSx}>Services</Typography>
            <Stack spacing={1}>
              {SERVICES_LINKS.map((link) => (
                <MuiLink
                  key={link.href}
                  component={Link}
                  href={link.href}
                  underline="none"
                  sx={linkSx}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Box>

          {/* Company column */}
          <Box>
            <Typography sx={columnHeadingSx}>Company</Typography>
            <Stack spacing={1}>
              {COMPANY_LINKS.map((link) => (
                <MuiLink
                  key={link.href}
                  component={Link}
                  href={link.href}
                  underline="none"
                  sx={linkSx}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Box>

          {/* Account column */}
          <Box>
            <Typography sx={columnHeadingSx}>Your Account</Typography>
            <Stack spacing={1}>
              {[
                { label: 'Sign In / Register', href: '/auth/login' },
                { label: 'My Portal', href: '/dashboard/customer' },
                { label: 'Request a Quote', href: '/booking' },
              ].map((link) => (
                <MuiLink
                  key={link.href}
                  href={link.href}
                  underline="none"
                  sx={linkSx}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border, mb: 3 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Typography sx={{ color: 'rgba(246,243,236,0.3)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Final Entry Ltd. All rights reserved.
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.3)', fontSize: '0.8rem' }}>
            Licensed Pest Control · Jamaica · NEPA Registered
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
