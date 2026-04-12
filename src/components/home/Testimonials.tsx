'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/theme';

const TESTIMONIALS = [
  {
    name: 'Marcia Thompson',
    parish: 'Kingston',
    text: 'Had a severe cockroach infestation in my restaurant. Final Entry came the same day. Three weeks later — not a single roach. My inspector came and was impressed.',
    role: 'Restaurant Owner',
    image: '/images/testimonial-family.png',
    rating: 5,
  },
  {
    name: 'Desmond Clarke',
    parish: 'Saint Andrew',
    text: 'Termites were destroying my home. The team identified the problem, explained exactly what they were doing, and the results were permanent. Worth every dollar.',
    role: 'Homeowner',
    image: '/images/team.png',
    rating: 5,
  },
  {
    name: 'Keisha Brown',
    parish: 'Saint Catherine',
    text: 'Professional, on time, and they respectedmy home. The rodent problem we had for months was solved in one visit with sealed entry points. 100% recommend.',
    role: 'Mother of 3',
    image: '/images/testimonial-family.png',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <Box
      component="section"
      id="testimonials"
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        background: tokens.surfaceDark,
        borderTop: `1px solid ${tokens.border}`,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
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
            What Our Clients Say
          </Typography>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 6, lineHeight: 1 }}
          >
            Real Results.{' '}
            <Box component="span" sx={{ color: tokens.citrus }}>
              Real People.
            </Box>
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Box
                sx={{
                  p: 4,
                  background: tokens.surfaceMid,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  transition: 'border-color 0.3s',
                  '&:hover': { borderColor: 'rgba(198,241,53,0.4)' },
                }}
              >
                {/* Stars */}
                <Box sx={{ color: tokens.citrus, fontSize: '1.1rem', letterSpacing: 2 }}>
                  {'★'.repeat(t.rating)}
                </Box>

                {/* Quote */}
                <Typography
                  sx={{
                    color: 'rgba(246,243,236,0.85)',
                    lineHeight: 1.75,
                    fontStyle: 'italic',
                    flex: 1,
                    fontSize: '0.98rem',
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </Typography>

                {/* Author */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={t.image}
                    sx={{ width: 48, height: 48, border: `2px solid ${tokens.border}` }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: tokens.chalk,
                      }}
                    >
                      {t.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: 'rgba(246,243,236,0.45)',
                      }}
                    >
                      {t.role} · {t.parish}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
