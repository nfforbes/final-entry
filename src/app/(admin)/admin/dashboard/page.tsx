'use client';

import React from 'react';
import { Box, Typography, Paper, Card, CardContent } from '@mui/material';
import { TrendingUp, ShoppingCart, People, Assessment } from '@mui/icons-material';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
  surfaceMid: '#1e1e26',
};

const STATS = [
  { label: 'Total Orders', value: '124', icon: <ShoppingCart sx={{ color: tokens.citrus }} />, trend: '+12% from last month' },
  { label: 'Active Users', value: '482', icon: <People sx={{ color: tokens.citrus }} />, trend: '+5% total growth' },
  { label: 'Revenue', value: '$12,450', icon: <TrendingUp sx={{ color: tokens.citrus }} />, trend: '+8.2% vs target' },
  { label: 'Pending Quotes', value: '18', icon: <Assessment sx={{ color: tokens.citrus }} />, trend: 'Needs attention' },
];

export default function AdminDashboard() {
  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'var(--font-cormorant)', mb: 1 }}>
          System Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(246, 243, 236, 0.6)' }}>
          Real-time metrics for Final Entry operations.
        </Typography>
      </Box>

      {/* Stats Grid using Box for stability */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {STATS.map((stat) => (
          <Card key={stat.label} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(198, 241, 53, 0.1)', borderRadius: '8px', display: 'flex' }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(246, 243, 236, 0.5)', mb: 1, fontWeight: 500 }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.citrus, fontWeight: 600 }}>
                {stat.trend}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Activity Sections using Box for stability */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
          mt: 3,
        }}
      >
        <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: 'rgba(246, 243, 236, 0.3)' }}>
            Activity Visualization Placeholder
          </Typography>
        </Paper>
        <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: 'rgba(246, 243, 236, 0.3)' }}>
            Recent Logs Placeholder
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
