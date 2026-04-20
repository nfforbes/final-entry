import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Professional pest control services across all 14 parishes of Jamaica. Cockroaches, termites, rodents, mosquitoes — eliminated.',
};

const SERVICES = [
  {
    slug: 'fumigation',
    title: 'Fumigation',
    description: 'Precision high-level area sterilization and sterilization protocols using modern fogging and aerosolized treatment technology.',
    tag: 'Most Requested',
    emoji: '💨',
    features: ['Sterile area isolation', 'Fogging technology', 'Aerosolized sterilization', 'Post-treatment verification'],
  },
  {
    slug: 'termite-control',
    title: 'Termite Control',
    description: 'Targeted baiting systems and liquid soil treatments that protect your structure long-term from subterranean and drywood termites.',
    emoji: '🪵',
    features: ['Baiting system installation', 'Liquid termiticide barriers', 'Annual monitoring', 'Structural damage assessment'],
  },
  {
    slug: 'rodent-removal',
    title: 'Rodent Removal',
    description: 'Rats and mice fully eliminated. All entry points identified, sealed, and secured. Population tracked until zero.',
    emoji: '🐀',
    features: ['Live & snap trap placement', 'Entry point exclusion', 'Sanitation guidance', 'Ongoing monitoring'],
  },
  {
    slug: 'mosquito-control',
    title: 'Mosquito Control',
    description: 'Reduce dengue and Zika risk with targeted outdoor larviciding and adulticide programs designed for Jamaica\'s tropical climate.',
    tag: 'High Priority JM',
    emoji: '🦟',
    features: ['Source reduction', 'Larvicide treatment', 'Adulticide fogging', 'Seasonal contracts'],
  },
  {
    slug: 'bed-bug-treatment',
    title: 'Bed Bug Treatment',
    description: 'Heat treatment and chemical protocols. We don\'t leave until they\'re gone — including a guaranteed re-treatment policy.',
    emoji: '🛏️',
    features: ['Thermal heat treatment', 'Chemical residual treatment', 'Mattress encasements', 'Guaranteed re-treatment'],
  },
  {
    slug: 'general-pest-control',
    title: 'General Pest Control',
    description: 'Year-round home protection plan covering 15+ pest types with quarterly scheduled visits and a zero-tolerance guarantee.',
    emoji: '🏠',
    features: ['15+ pest types covered', 'Quarterly scheduled visits', 'Emergency call-outs', '100% satisfaction guarantee'],
  },
  {
    slug: 'roach-control',
    title: 'Roach Control',
    description: 'Targeted elimination of German & American cockroach infestations using industry-leading gel baits and residual treatments.',
    emoji: '🪳',
    features: ['Precision gel baiting', 'Species identification', 'Sanitation guidance', 'Guaranteed elimination'],
  },
];

export default function ServicesPage() {
  return (
    <Box
      component="main"
      sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}
    >
      {/* Hero */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          px: { xs: 3, md: 6 },
          maxWidth: '1200px',
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: tokens.citrus, letterSpacing: '0.14em', fontWeight: 700 }}
        >
          What We Eliminate
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: '3rem', md: '5rem' }, mt: 1, mb: 3, lineHeight: 1 }}
        >
          Every Pest.{' '}
          <Box component="span" sx={{ color: tokens.citrus }}>
            Handled.
          </Box>
        </Typography>
        <Typography
          sx={{
            color: 'rgba(246,243,236,0.6)',
            fontSize: '1.1rem',
            maxWidth: 560,
            mx: 'auto',
            mb: 6,
            lineHeight: 1.7,
          }}
        >
          Jamaica&apos;s most comprehensive pest control services — licensed, insured, and guaranteed across all 14 parishes.
        </Typography>
        <Link href="/booking" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
          <Button
            variant="contained"
            id="services-page-cta"
            size="large"
            sx={{
              bgcolor: tokens.citrus,
              color: tokens.obsidian,
              fontWeight: 700,
              px: 4,
              py: 1.5,
            }}
          >
            Get a Free Quote
          </Button>
        </Link>
      </Box>

      {/* Services list */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          pb: { xs: 8, md: 14 },
          maxWidth: '1200px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {SERVICES.map((service) => (
          <Link key={service.slug} href={`/services/${service.slug}`} passHref style={{ textDecoration: 'none', display: 'block' }}>
            <Box
              sx={{
                bgcolor: tokens.surfaceMid,
                border: `1px solid ${tokens.border}`,
                borderRadius: 1,
                p: 4,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: tokens.citrus,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 16px 48px rgba(198,241,53,0.1)`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>{service.emoji}</Typography>
                {service.tag && (
                  <Chip
                    label={service.tag}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(198,241,53,0.12)',
                      border: `1px solid ${tokens.citrus}`,
                      color: tokens.citrus,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 700,
                  fontSize: '1.6rem',
                  mb: 1.5,
                  color: tokens.chalk,
                }}
              >
                {service.title}
              </Typography>
              <Typography
                sx={{ color: 'rgba(246,243,236,0.55)', fontSize: '0.9rem', lineHeight: 1.7, mb: 3 }}
              >
                {service.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {service.features.map((f) => (
                  <Typography
                    key={f}
                    sx={{
                      fontSize: '0.75rem',
                      color: 'rgba(198,241,53,0.8)',
                      bgcolor: 'rgba(198,241,53,0.06)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.5,
                      border: `1px solid rgba(198,241,53,0.2)`,
                    }}
                  >
                    ✓ {f}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
