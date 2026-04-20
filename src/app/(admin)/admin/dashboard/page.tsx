'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Card, CardContent, Skeleton } from '@mui/material';
import { TrendingUp, ShoppingCart, People, Assessment } from '@mui/icons-material';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
  surfaceMid: '#1e1e26',
};

const iconMap: Record<string, React.ReactNode> = {
  orders: <ShoppingCart sx={{ color: tokens.citrus }} />,
  users: <People sx={{ color: tokens.citrus }} />,
  revenue: <TrendingUp sx={{ color: tokens.citrus }} />,
  quotes: <Assessment sx={{ color: tokens.citrus }} />,
};

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  type: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard/stats');
        setStats(res.data.stats || []);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

      {/* Stats Grid */}
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
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2, bgcolor: 'rgba(246, 243, 236, 0.05)' }} />
                <Skeleton variant="text" width="60%" sx={{ mb: 1, bgcolor: 'rgba(246, 243, 236, 0.05)' }} />
                <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(246, 243, 236, 0.05)' }} />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(198, 241, 53, 0.1)', borderRadius: '8px', display: 'flex' }}>
                    {iconMap[stat.type] || <Assessment sx={{ color: tokens.citrus }} />}
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
          ))
        )}
      </Box>

      {/* Activity Sections */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
          mt: 3,
        }}
      >
        <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: tokens.chalk, mb: 2, opacity: 0.5 }}>Service Distribution</Typography>
          <Typography sx={{ color: 'rgba(246, 243, 236, 0.3)' }}>
            Visualization will load when volume increases
          </Typography>
        </Paper>
        <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: tokens.chalk, mb: 2, opacity: 0.5 }}>Recent Activity</Typography>
          <Typography sx={{ color: 'rgba(246, 243, 236, 0.3)' }}>
            Logs will appear as data matures
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
