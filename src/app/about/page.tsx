import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Jamaica's premier pest control authority. Licensed, insured professionals serving all 14 parishes since 2009.",
};

const STATS = [
  { value: '12,000+', label: 'Homes Protected' },
  { value: '14', label: 'Parishes Served' },
  { value: '15+', label: 'Years Experience' },
  { value: '100%', label: 'Satisfaction Guarantee' },
];

const VALUES = [
  {
    emoji: '🎓',
    title: 'Licensed & Certified',
    desc: 'All technicians are certified by the Pesticide Control Authority (PCA) of Jamaica and carry individual licences.',
  },
  {
    emoji: '🌿',
    title: 'Environmentally Responsible',
    desc: 'We use NEPA-approved products and follow IPM principles — using the least toxic solution that achieves full elimination.',
  },
  {
    emoji: '🛡️',
    title: '100% Guarantee',
    desc: 'If pests return between scheduled visits, we come back at no charge — no questions asked.',
  },
  {
    emoji: '⚡',
    title: 'Same-Day Response',
    desc: 'Most service calls can be booked and attended within 24 hours. Emergency response available island-wide.',
  },
];

export default function AboutPage() {
  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      {/* Hero */}
      <Box sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="overline" sx={{ color: tokens.citrus, letterSpacing: '0.14em', fontWeight: 700 }}>
          About Final Entry
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mt: 1, mb: 4, lineHeight: 1, maxWidth: 700 }}>
          Jamaica&apos;s{' '}
          <Box component="span" sx={{ color: tokens.citrus }}>
            Pest Elimination
          </Box>{' '}
          Authority
        </Typography>
        <Typography
          sx={{
            color: 'rgba(246,243,236,0.65)',
            fontSize: '1.1rem',
            maxWidth: 600,
            lineHeight: 1.8,
            mb: 6,
          }}
        >
          Founded in 2009, Final Entry was built on a simple promise: no pest survives, and no client is left unsatisfied. 
          We have grown from a Kingston-based operation into the island&apos;s most trusted pest control authority, 
          covering all 14 parishes with a team of 40+ certified technicians.
        </Typography>

        {/* Stats row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
            mb: 8,
          }}
        >
          {STATS.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                p: 3,
                bgcolor: tokens.surfaceMid,
                border: `1px solid ${tokens.border}`,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '2.8rem',
                  fontWeight: 700,
                  color: tokens.citrus,
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.5)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Mission */}
      <Box sx={{ bgcolor: tokens.surfaceDark, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8, alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.14em', display: 'block', mb: 2 }}>
                Our Mission
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 3, lineHeight: 1.1 }}>
                Healthier Homes. Safer Businesses.
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.65)', lineHeight: 1.8, fontSize: '0.98rem', mb: 3 }}>
                Pests are more than a nuisance — they are a public health threat. Every service we perform is guided by 
                science-based Integrated Pest Management (IPM), ensuring we use the most targeted, least-toxic solution 
                to achieve complete elimination.
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.65)', lineHeight: 1.8, fontSize: '0.98rem' }}>
                We are fully registered with Jamaica&apos;s National Environment and Planning Agency (NEPA) and operate 
                under the Pesticide Control Authority of Jamaica — because your family&apos;s safety is non-negotiable.
              </Typography>
            </Box>
            <Box
              sx={{
                p: 5,
                bgcolor: tokens.surfaceMid,
                border: `1px solid ${tokens.citrus}`,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>🇯🇲</Typography>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 2, fontSize: '1.8rem' }}>
                Proudly Jamaican
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Founded, owned, and operated by Jamaicans — for Jamaica. We understand our local pest pressures, 
                tropical climate, and what it means to protect a Jamaican home.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Values */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 } }}>
        <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.14em', display: 'block', mb: 2 }}>
          Our Values
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 6, lineHeight: 1.1 }}>
          Why Clients Choose Final Entry
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {VALUES.map((v) => (
            <Box
              key={v.title}
              sx={{ p: 4, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 1 }}
            >
              <Typography sx={{ fontSize: '2rem', mb: 2 }}>{v.emoji}</Typography>
              <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.chalk, fontSize: '1.05rem' }}>{v.title}</Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.9rem', lineHeight: 1.7 }}>{v.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* CTA */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: { xs: 8, md: 14 }, maxWidth: '1200px', mx: 'auto' }}>
        <Box sx={{ p: { xs: 4, md: 6 }, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.citrus}`, borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2 }}>
            Ready to Meet Your Technician?
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 4, maxWidth: 480, mx: 'auto' }}>
            Request a free quote and a certified technician will assess your property at no charge.
          </Typography>
          <Link href="/booking" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button
              variant="contained"
              size="large"
              id="about-cta"
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5, py: 1.5 }}
            >
              Request a Free Quote
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
