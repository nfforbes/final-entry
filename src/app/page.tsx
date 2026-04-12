import React from 'react';
import { Box } from '@mui/material';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { TrustBadges } from '@/components/home/TrustBadges';
import { Testimonials } from '@/components/home/Testimonials';

export default function HomePage() {
  return (
    <Box component="main" sx={{ pt: '72px' }}>
      <HeroSection />
      <ServicesGrid />
      <TrustBadges />
      <Testimonials />
    </Box>
  );
}
