'use client';

import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const BADGES = [
  { icon: <VerifiedIcon />, label: 'Licensed & Certified', sub: 'NEPA Approved' },
  { icon: <SecurityIcon />, label: 'Fully Insured', sub: 'All Technicians' },
  { icon: <SupportAgentIcon />, label: '24/7 Emergency', sub: 'Call Anytime' },
  { icon: <WorkspacePremiumIcon />, label: 'Money-Back', sub: '100% Guarantee' },
];

export function TrustBadges() {
  return (
    <Box
      component="section"
      id="trust"
      sx={{
        py: { xs: 8, md: 10 },
        px: { xs: 3, md: 6 },
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 10,
        }}
      >
        {BADGES.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Box
              sx={{
                p: 3,
                border: `1px solid ${tokens.border}`,
                borderRadius: 1,
                textAlign: 'center',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: tokens.citrus,
                  '& .badge-icon': { color: tokens.citrus },
                },
              }}
            >
              <Box
                className="badge-icon"
                sx={{
                  color: 'rgba(246,243,236,0.35)',
                  fontSize: 36,
                  mb: 1.5,
                  transition: 'color 0.3s',
                }}
              >
                {badge.icon}
              </Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: '0.85rem', color: tokens.chalk, mb: 0.5 }}
              >
                {badge.label}
              </Typography>
              <Typography
                sx={{ fontSize: '0.75rem', color: 'rgba(246,243,236,0.4)' }}
              >
                {badge.sub}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Booking CTA band */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, rgba(198,241,53,0.08) 0%, rgba(198,241,53,0.03) 100%)`,
            border: `1px solid rgba(198,241,53,0.25)`,
            borderRadius: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.8rem' },
                mb: 1,
                color: tokens.chalk,
              }}
            >
              Pest problem?{' '}
              <Box component="span" sx={{ color: tokens.citrus }}>
                We respond fast.
              </Box>
            </Typography>
            <Typography sx={{ color: 'rgba(246,243,236,0.55)', fontSize: '0.95rem' }}>
              Free quote. No obligation. We contact you within 2 hours.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexShrink: 0 }}>
            <Button
              component={Link}
              href="/booking"
              variant="contained"
              size="large"
              id="trust-cta-quote"
              sx={{
                bgcolor: tokens.citrus,
                color: tokens.obsidian,
                fontWeight: 700,
                px: 4,
                whiteSpace: 'nowrap',
              }}
            >
              Request Free Quote
            </Button>
            <Button
              href="tel:+18762774040"
              component="a"
              variant="outlined"
              size="large"
              id="trust-cta-call"
              sx={{ borderColor: tokens.border, color: tokens.chalk, whiteSpace: 'nowrap' }}
            >
              📞 +1 (876) 277-4040
            </Button>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
}
