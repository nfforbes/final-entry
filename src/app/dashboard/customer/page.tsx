'use client';

import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function CustomerDashboard() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/auth/logout?returnTo=/';
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'rgba(246,243,236,0.5)' }}>Loading…</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'rgba(246,243,236,0.5)' }}>Redirecting…</Typography>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 8, md: 10 } }}>
        {/* Welcome */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.12em' }}>
            Customer Portal
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mt: 1, lineHeight: 1 }}>
            Welcome back, {user.name?.split(' ')[0] ?? 'Customer'}
          </Typography>
        </Box>

        {/* Quick actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 8 }}>
          {[
            { emoji: '📋', title: 'Request a Quote', desc: 'Start a new pest control request', href: '/booking', cta: 'New Request' },
            { emoji: '📞', title: 'Contact Support', desc: 'Speak to a technician directly', href: '/contact', cta: 'Get Help' },
            { emoji: '🐛', title: 'Pest Library', desc: 'Identify your pest problem', href: '/pest-library', cta: 'Browse' },
          ].map((card) => (
            <Box
              key={card.title}
              sx={{ p: 4, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 1 }}
            >
              <Typography sx={{ fontSize: '2rem', mb: 2 }}>{card.emoji}</Typography>
              <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.chalk }}>{card.title}</Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.5)', fontSize: '0.88rem', mb: 3 }}>{card.desc}</Typography>
              <Button
                component={Link}
                href={card.href}
                variant="outlined"
                size="small"
                sx={{ borderColor: tokens.citrus, color: tokens.citrus, fontSize: '0.78rem' }}
              >
                {card.cta}
              </Button>
            </Box>
          ))}
        </Box>

        {/* Quote history placeholder */}
        <Box>
          <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 3 }}>
            Your Requests
          </Typography>
          <Box
            sx={{
              p: 6,
              bgcolor: tokens.surfaceMid,
              border: `1px solid ${tokens.border}`,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '2rem', mb: 2 }}>📭</Typography>
            <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 3 }}>
              No quote requests yet. Book your first service below.
            </Typography>
            <Button
              component={Link}
              href="/booking"
              variant="contained"
              id="dashboard-new-request"
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700 }}
            >
              Request a Quote
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
