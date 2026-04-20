'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { tokens } from '@/lib/theme';
import Link from 'next/link';

const SLIDES = [
  {
    image: '/images/hero-fumigation.png',
    headline: 'Final',
    accent: 'Entry.',
    desc: 'Precision fumigation services across all 14 parishes. Termites, cockroaches, rodents — eradicated. Guaranteed.',
  },
  {
    image: '/images/hero-2.png',
    headline: 'Trusted',
    accent: 'Protection.',
    desc: 'Personalized care for your home and family. Our licensed technicians are dedicated to your total peace of mind.',
  },
  {
    image: '/images/hero-3.png',
    headline: 'Peace of',
    accent: 'Mind.',
    desc: 'Creating safe, healthy, and pest-free environments for Jamaican families. Because your home is your sanctuary.',
  },
  {
    image: '/images/hero-4.png',
    headline: 'Business',
    accent: 'Excellence.',
    desc: 'Protecting Jamaica\'s commercial landscape. From luxury hotels to healthcare facilities, we provide audit-ready pest management.',
  },
];

const STATS = [
  { value: '12,000+', label: 'Homes Protected' },
  { value: '14', label: 'Parishes Served' },
  { value: '24/7', label: 'Emergency Response' },
  { value: '100%', label: 'Satisfaction Guarantee' },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 80]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 20000); // 20 seconds as requested
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="hero"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background: tokens.obsidian,
        m: 0,
        p: 0,
      }}
    >
      {/* Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            y: bgY 
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${SLIDES[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — left-heavy so text stays readable */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            to right,
            ${tokens.obsidian} 0%,
            ${tokens.obsidian} 35%,
            rgba(11,11,15,0.5) 60%,
            transparent 100%
          )`,
          zIndex: 1,
        }}
      />

      {/* Noise texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '1200px',
          mx: 'auto',
          px: 0,
          pt: '100px',
          pb: 0,
          width: '100%',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Eyebrow label */}
            <Chip
              label="🇯🇲 Jamaica's #1 Fumigation Authority"
              sx={{
                mb: 3,
                bgcolor: 'rgba(198,241,53,0.12)',
                border: `1px solid ${tokens.citrus}`,
                color: tokens.citrus,
                fontFamily: 'var(--font-space-grotesk)',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            />

            {/* Main headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem', lg: '6rem' },
                lineHeight: 0.92,
                mb: 3,
                color: tokens.chalk,
                maxWidth: '800px',
                textShadow: '0 4px 16px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {SLIDES[currentSlide].headline}{' '}
              <Box
                component="span"
                sx={{
                  color: tokens.citrus,
                  display: 'block',
                }}
              >
                {SLIDES[currentSlide].accent}
              </Box>
            </Typography>

            {/* Sub-headline */}
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(246,243,236,0.95)',
                maxWidth: '500px',
                fontFamily: 'var(--font-space-grotesk)',
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 5,
                fontSize: { xs: '1rem', md: '1.15rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              }}
            >
              {SLIDES[currentSlide].desc}
            </Typography>

            {/* CTA buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 8 }}>
              <Button
                component={Link}
                href="/booking"
                variant="contained"
                size="large"
                id="hero-cta-quote"
                sx={{
                  bgcolor: tokens.citrus,
                  color: tokens.obsidian,
                  px: 4,
                  py: 1.8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  '&:hover': {
                    bgcolor: '#b8e020',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px rgba(198,241,53,0.4)`,
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                Get a Free Quote
              </Button>
              <Button
                component={Link}
                href="/services"
                variant="outlined"
                size="large"
                id="hero-cta-services"
                sx={{
                  borderColor: 'rgba(246,243,236,0.3)',
                  color: tokens.chalk,
                  px: 4,
                  py: 1.8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  '&:hover': {
                    borderColor: tokens.chalk,
                    bgcolor: 'rgba(246,243,236,0.06)',
                  },
                }}
              >
                Our Services
              </Button>
            </Stack>
          </motion.div>
        </AnimatePresence>

        {/* Stats bar */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            pt: 4,
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: tokens.citrus,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(246,243,236,0.5)',
                  fontFamily: 'var(--font-space-grotesk)',
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </Typography>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Progress Indicator Dots */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 'auto', md: 48 },
          left: { xs: '50%', md: 'auto' },
          bottom: { xs: 100, md: '50%' },
          transform: { xs: 'translateX(-50%)', md: 'translateY(50%)' },
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: 2,
          zIndex: 4,
        }}
      >
        {SLIDES.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrentSlide(i)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: `2px solid ${tokens.citrus}`,
              bgcolor: currentSlide === i ? tokens.citrus : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.2)' },
            }}
          />
        ))}
      </Box>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Box
            sx={{
              width: 1,
              height: 48,
              mx: 'auto',
              background: `linear-gradient(to bottom, ${tokens.citrus}, transparent)`,
              borderRadius: 1,
            }}
          />
        </motion.div>
      </motion.div>
    </Box>
  );
}
