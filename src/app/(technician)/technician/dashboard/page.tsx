'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Switch, FormControlLabel, Card, CardContent, Divider, Stack } from '@mui/material';
import { 
  PlayArrow as StartIcon, 
  LocationOn as LocationIcon, 
  ListAlt as JobsIcon,
  Timeline as StatusIcon,
  Phone as ContactIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/technician/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Live Tracking Logic
  useEffect(() => {
    if (isSharing) {
      // Start tracking
      const interval = setInterval(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await axios.post('/api/technician/location', {
                lat: latitude,
                lng: longitude,
                isSharing: true
              });
            } catch (err) {
              console.error('Failed to update location:', err);
            }
          });
        }
      }, 30000); // Every 30 seconds
      setLocationInterval(interval);
    } else {
      if (locationInterval) clearInterval(locationInterval);
      setLocationInterval(null);
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [isSharing]);

  const activeJob = jobs.find(j => ['on_route', 'in_progress', 'assigned'].includes(j.status));

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'var(--font-cormorant)', mb: 1 }}>
            Daily Rounds
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(246, 243, 236, 0.6)' }}>
            Welcome back! You have {jobs.length} jobs scheduled for today.
          </Typography>
        </Box>

        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: isSharing ? 'rgba(198, 241, 53, 0.1)' : 'rgba(255, 255, 255, 0.02)', 
            border: `1px solid ${isSharing ? tokens.citrus : tokens.border}`,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px'
          }}
        >
          <FormControlLabel
            control={
              <Switch 
                checked={isSharing} 
                onChange={(e) => setIsSharing(e.target.checked)}
                sx={{ 
                  '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.citrus },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: tokens.citrus }
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, color: isSharing ? tokens.citrus : tokens.chalk }}>
                {isSharing ? 'LIVE TRACKING ON' : 'START SHIFT'}
              </Typography>
            }
          />
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Active Job Highlight */}
        {activeJob && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: 2 }}>
              Active Task
            </Typography>
            <Card sx={{ bgcolor: tokens.surface, border: `2px solid ${tokens.citrus}`, borderRadius: '16px', mt: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Chip size="small" label={activeJob.status.toUpperCase()} sx={{ borderRadius: '4px', bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{activeJob.serviceId?.title}</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>{activeJob.customerId?.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.citrus }}>
                        <LocationIcon fontSize="small" />
                        <Typography variant="body2">{activeJob.address || 'Location provided on route'}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                    <Button 
                      href={`/technician/jobs/${activeJob._id}`}
                      variant="contained" 
                      sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, borderRadius: '8px', px: 3, '&:hover': { bgcolor: tokens.citrus, opacity: 0.9 } }}
                    >
                      GO TO JOB
                    </Button>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Job List */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}>
            <JobsIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Upcoming Assignments</Typography>
          </Box>
          <Stack spacing={2}>
            {jobs.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', border: `1px dashed ${tokens.border}` }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>No jobs assigned yet.</Typography>
              </Paper>
            ) : (
              jobs.map((job) => (
                <Paper 
                  key={job._id} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '12px',
                    transition: '0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Grid container sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{job.serviceId?.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>{job.customerId?.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Status</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: job.status === 'assigned' ? tokens.citrus : tokens.chalk }}>
                        {job.status.toUpperCase()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'right' }}>
                      <Button 
                        href={`/technician/jobs/${job._id}`}
                        variant="text"
                        size="small" 
                        sx={{ color: tokens.chalk, textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
