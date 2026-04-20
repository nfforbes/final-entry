'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import BugReportIcon from '@mui/icons-material/BugReport';
import PestControlRodentIcon from '@mui/icons-material/PestControlRodent';
import PestControlIcon from '@mui/icons-material/PestControl';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const SERVICES = [
  {
    slug: 'fumigation',
    title: 'Fumigation',
    short: 'Precision high-level fumigation for complete area sterilization.',
    icon: <BugReportIcon sx={{ fontSize: 32 }} />,
    featured: true,
    gridArea: 'a',
    tag: 'Most Requested',
  },
  {
    slug: 'termite-control',
    title: 'Termite Control',
    short: 'Targeted baiting systems that protect your structure long-term.',
    icon: <PestControlIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'b',
  },
  {
    slug: 'rodent-removal',
    title: 'Rodent Removal',
    short: 'Rats and mice eliminated. Entry points sealed. Done.',
    icon: <PestControlRodentIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'c',
  },
  {
    slug: 'mosquito-control',
    title: 'Mosquito Control',
    short: 'Reduce dengue and Zika risk. Seasonal outdoor treatment programs.',
    icon: <LocalFloristIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'd',
    tag: 'High Priority JM',
  },
  {
    slug: 'bed-bug-treatment',
    title: 'Bed Bug Treatment',
    short: 'Heat and chemical treatments. We don\'t leave until they\'re gone.',
    icon: <BugReportIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'e',
  },
  {
    slug: 'general-pest-control',
    title: 'General Pest Control',
    short: 'Year-round home protection plan covering 15+ pest types.',
    icon: <PestControlIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'f',
  },
  {
    slug: 'roach-control',
    title: 'Roach Control',
    short: 'Total elimination of German & American cockroach infestations.',
    icon: <BugReportIcon sx={{ fontSize: 32 }} />,
    featured: false,
    gridArea: 'g',
  },
];

export function ServicesGrid() {
  return (
    <Box
      component="section"
      id="services"
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: tokens.citrus,
              fontWeight: 700,
              letterSpacing: '0.14em',
              display: 'block',
              mb: 1,
            }}
          >
            What We Eliminate
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                maxWidth: '500px',
                lineHeight: 1,
              }}
            >
              Every Pest.{' '}
              <Box component="span" sx={{ color: tokens.citrus }}>
                Every Parish.
              </Box>
            </Typography>
            <Button
              component={Link}
              href="/services"
              variant="outlined"
              id="services-view-all"
              sx={{
                borderColor: tokens.border,
                color: tokens.chalk,
                '&:hover': { borderColor: tokens.citrus, color: tokens.citrus },
              }}
            >
              View All Services →
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Asymmetric Bento grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' },
          gridTemplateRows: 'auto',
          gap: 2,
          gridTemplateAreas: {
            xs: `"a" "b" "c" "d" "e" "f" "g"`,
            sm: `"a a" "b c" "d e" "f g"`,
            md: `"a a b" "a a c" "d e f" "g g g"`,
          },
        }}
      >
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.slug}
            style={{ gridArea: service.gridArea }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Card
              component={Link}
              href={`/services/${service.slug}`}
              sx={{
                height: service.featured ? { md: '340px' } : 'auto',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 0,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: service.featured || service.slug === 'roach-control'
                  ? service.slug === 'fumigation'
                    ? `linear-gradient(to top, rgba(11,11,15,0.9) 0%, rgba(11,11,15,0.2) 100%), url('/images/service-fumigation.png')`
                    : service.slug === 'roach-control'
                    ? `linear-gradient(to top, rgba(11,11,15,0.95) 0%, rgba(11,11,15,0) 100%), url('/images/service-roach.png')`
                    : `linear-gradient(135deg, ${tokens.surfaceMid} 0%, #1a1a2a 100%)`
                  : tokens.surfaceMid,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `1px solid ${tokens.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: tokens.citrus,
                  transform: 'translateY(-4px)',
                  boxShadow: service.featured
                    ? `0 20px 60px rgba(198,241,53,0.15)`
                    : `0 12px 30px rgba(0,0,0,0.5)`,
                  '& .service-icon': {
                    color: tokens.citrus,
                    transform: 'scale(1.15)',
                  },
                },
              }}
            >
              {service.tag && (
                <Chip
                  label={service.tag}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(198,241,53,0.15)',
                    border: `1px solid ${tokens.citrus}`,
                    color: tokens.citrus,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                <Box
                  className="service-icon"
                  sx={{
                    color: 'rgba(246,243,236,0.4)',
                    mb: 2,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'var(--font-cormorant)',
                    fontWeight: 700,
                    fontSize: service.featured ? { md: '1.8rem' } : '1.2rem',
                    mb: 1,
                    color: tokens.chalk,
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(246,243,236,0.55)',
                    lineHeight: 1.6,
                    fontSize: '0.88rem',
                  }}
                >
                  {service.short}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
