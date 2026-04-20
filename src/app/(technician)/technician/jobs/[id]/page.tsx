'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Chip, Button, Stack, Divider, 
  CircularProgress, IconButton, Alert, Breadcrumbs 
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  LocationOn as LocationIcon, 
  Phone as ContactIcon,
  Directions as DirectionsIcon,
  CheckCircle as CompleteIcon,
  PlayArrow as StartIcon,
  Description as DocIcon,
  History as HistoryIcon,
  Timeline as StatusIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/technician/jobs/${id}`);
      setJob(res.data.job);
      setNotes(res.data.job.technicianNotes || '');
    } catch (err: any) {
      console.error('Failed to fetch job:', err);
      setError(err.response?.data?.error || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const saveNotesOnly = async () => {
    try {
      setSavingNotes(true);
      await axios.patch(`/api/technician/jobs/${id}`, { technicianNotes: notes });
    } catch (err: any) {
      console.error('Failed to save notes:', err);
      alert('Error saving notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await axios.patch(`/api/technician/jobs/${id}`, { 
        status: newStatus,
        technicianNotes: notes
      });
      await fetchJob(); // Refresh
      if (newStatus === 'completed') {
        router.push('/technician/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Error updating job status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress sx={{ color: tokens.citrus }} />
    </Box>
  );

  if (error || !job) return (
    <Box sx={{ py: 4 }}>
      <Alert severity="error" sx={{ bgcolor: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d' }}>
        {error || 'Job not found'}
      </Alert>
      <Button component={Link} href="/technician/dashboard" startIcon={<BackIcon />} sx={{ mt: 2, color: tokens.chalk }}>
        Return to Dashboard
      </Button>
    </Box>
  );

  return (
    <Box>
      {/* Navigation */}
      <Breadcrumbs sx={{ mb: 3, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.2)' } }}>
        <Link href="/technician/dashboard" style={{ textDecoration: 'none' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Dashboard</Typography>
        </Link>
        <Typography sx={{ color: tokens.citrus, fontSize: '0.85rem', fontWeight: 700 }}>Job Details</Typography>
      </Breadcrumbs>

      {/* Header & Identity */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'var(--font-cormorant)' }}>
              Job Case #{id?.toString().slice(-6).toUpperCase()}
            </Typography>
            <Chip 
              label={job.status.toUpperCase()} 
              sx={{ 
                bgcolor: job.status === 'completed' ? '#4caf50' : tokens.citrus, 
                color: tokens.obsidian, 
                fontWeight: 800,
                fontSize: '0.7rem'
              }} 
            />
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Assigned for today • {new Date(job.createdAt).toLocaleDateString()}
          </Typography>
          {/* Debug Info for Status Mismatch */}
          {!['rfq', 'quote_sent', 'order_confirmed', 'assigned', 'on_route', 'in_progress', 'completed'].includes(job.status) && (
            <Typography variant="caption" sx={{ color: '#ff4d4d', display: 'block', mt: 1, fontWeight: 700 }}>
              DEBUG: Current Status is `{job.status}`.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Job Progress Timeline */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress Line Background */}
          <Box sx={{ 
            position: 'absolute', 
            top: '20px', 
            left: '5%', 
            right: '5%', 
            height: '2px', 
            bgcolor: 'rgba(255,255,255,0.1)', 
            zIndex: 1 
          }} />
          
          {[
            { id: 'assigned', label: 'Preparation', icon: <DocIcon fontSize="small" />, active: ['assigned', 'rfq', 'quote_sent', 'order_confirmed', 'on_route', 'in_progress', 'completed'].includes(job.status) },
            { id: 'on_route', label: 'On Route', icon: <DirectionsIcon fontSize="small" />, active: ['on_route', 'in_progress', 'completed'].includes(job.status) },
            { id: 'in_progress', label: 'Arrived', icon: <LocationIcon fontSize="small" />, active: ['in_progress', 'completed'].includes(job.status) },
            { id: 'completed', label: 'Secured', icon: <CompleteIcon fontSize="small" />, active: job.status === 'completed' }
          ].map((step, idx) => (
            <Box key={step.id} sx={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: step.active ? tokens.citrus : tokens.border,
                color: step.active ? tokens.obsidian : 'rgba(255,255,255,0.3)',
                border: `4px solid ${tokens.surface}`,
                transition: 'all 0.3s ease'
              }}>
                {step.active && job.status === step.id ? (
                  <Box sx={{ animation: 'pulse 1.5s infinite', display: 'flex' }}>{step.icon}</Box>
                ) : step.icon}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1, 
                  fontWeight: step.active ? 700 : 500, 
                  color: step.active ? tokens.chalk : 'rgba(255,255,255,0.3)',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                {step.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <Grid container spacing={3}>
        {/* Mobile-First Status Controls (Top on mobile, Right on desktop) */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `2px solid ${tokens.border}`, borderRadius: '16px', position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StatusIcon sx={{ color: tokens.citrus }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Operational Status</Typography>
            </Box>

            <Stack spacing={2}>
              {/* Step 1: Start Journey */}
              {['rfq', 'quote_sent', 'order_confirmed', 'assigned'].includes(job.status) && (
                <Button 
                  variant="contained" 
                  fullWidth
                  disabled={updating}
                  onClick={() => updateStatus('on_route')}
                  startIcon={<StartIcon />}
                  sx={{ 
                    bgcolor: tokens.citrus, 
                    color: tokens.obsidian, 
                    fontWeight: 800, 
                    py: 2.5, 
                    borderRadius: '12px',
                    '&:hover': { bgcolor: tokens.citrus, opacity: 0.9 }
                  }}
                >
                  {updating ? 'Updating...' : 'START JOURNEY'}
                </Button>
              )}

              {/* Step 2: Confirm Arrival */}
              {job.status === 'on_route' && (
                <Button 
                  variant="contained" 
                  fullWidth
                  disabled={updating}
                  onClick={() => updateStatus('in_progress')}
                  startIcon={<LocationIcon />}
                  sx={{ 
                    bgcolor: '#2196f3', // Blue for arrival
                    color: tokens.chalk, 
                    fontWeight: 800, 
                    py: 2.5, 
                    borderRadius: '12px' 
                  }}
                >
                  {updating ? 'Updating...' : 'CONFIRM ARRIVAL'}
                </Button>
              )}

              {/* Step 3: Finish Job */}
              {job.status === 'in_progress' && (
                <Button 
                  variant="contained" 
                  fullWidth
                  disabled={updating}
                  onClick={() => updateStatus('completed')}
                  startIcon={<CompleteIcon />}
                  sx={{ 
                    bgcolor: '#4caf50', // Green for complete
                    color: tokens.chalk, 
                    fontWeight: 800, 
                    py: 2.5, 
                    borderRadius: '12px' 
                  }}
                >
                  {updating ? 'Updating...' : 'FINISH JOB'}
                </Button>
              )}

              {job.status === 'completed' && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CompleteIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.chalk }}>JOB SECURED</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>
                    Extraction completed at {new Date(job.completedAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 3, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              Updating status will immediately alert the administrative office and the client.
            </Typography>
          </Paper>
        </Grid>

        {/* Left Column: Job Details (Bottom on mobile, Left on desktop) */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Stack spacing={3}>
            {/* Service Information */}
            <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <DocIcon sx={{ color: tokens.citrus }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Service Protocol</Typography>
              </Box>
              <Typography variant="h6" sx={{ color: tokens.citrus, mb: 1 }}>{job.serviceId?.title}</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, mb: 3 }}>
                {job.serviceId?.description}
              </Typography>
              
              <Divider sx={{ borderColor: tokens.border, my: 3 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)' }}>
                Field Documentation (Site Findings)
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <textarea
                  placeholder="Record your findings, chemicals used, or any site issues here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '12px',
                    color: tokens.chalk,
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={saveNotesOnly}
                  disabled={savingNotes}
                  variant="text"
                  sx={{ 
                    color: tokens.citrus, 
                    fontWeight: 700,
                    '&:hover': { bgcolor: 'rgba(198, 241, 53, 0.05)' }
                  }}
                >
                  {savingNotes ? 'Saving...' : 'Save Action Report'}
                </Button>
              </Box>
            </Paper>

            {/* Customer Information */}
            <Paper sx={{ p: 4, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: '16px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocationIcon sx={{ color: tokens.citrus }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Extraction Site</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Contact Person</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.chalk }}>{job.contactName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Contact Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: tokens.chalk }}>{job.contactEmail || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Direct Line</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: tokens.chalk }}>{job.contactPhone || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Physical Address</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: tokens.chalk, mt: 0.5 }}>
                    {job.address || 'Address on file'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<DirectionsIcon />}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address || '')}`}
                  target="_blank"
                  sx={{ 
                    bgcolor: tokens.chalk, 
                    color: tokens.obsidian, 
                    fontWeight: 700,
                    borderRadius: '30px',
                    py: 1.5,
                    '&:hover': { bgcolor: tokens.chalk, opacity: 0.9 }
                  }}
                >
                  Start Navigation
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                  href={`https://wa.me/${job.contactPhone?.replace(/\D/g, '') || ''}`}
                  target="_blank"
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: tokens.chalk,
                    borderRadius: '30px',
                    py: 1.5,
                    '&:hover': { borderColor: '#25D366', color: '#25D366' }
                  }}
                >
                  WhatsApp Contact
                </Button>
              </Box>
            </Paper>
          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
}
