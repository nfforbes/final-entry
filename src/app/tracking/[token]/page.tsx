'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Divider, Skeleton, Button, Chip, TextField } from '@mui/material';
import { 
  Person as PersonIcon, 
  Phone as PhoneIcon, 
  Map as MapIcon, 
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import dynamic from 'next/dynamic';
import SignaturePad from '@/components/SignaturePad';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

// Dynamically import the map to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { 
  ssr: false,
  loading: () => <Skeleton variant="rectangular" height="400px" sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)' }} />
});

const statusSteps = [
  { id: 'assigned', label: 'Technician Assigned', icon: <CheckIcon /> },
  { id: 'on_route', label: 'Technician On Route', icon: <ShippingIcon /> },
  { id: 'in_progress', label: 'Technician On Site', icon: <MapIcon /> },
  { id: 'completed', label: 'Service Complete', icon: <CheckIcon /> },
];

export default function PublicTrackingPage() {
  const { token } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signName, setSignName] = useState(''); // This will now hold the printed name again
  const [signature, setSignature] = useState(''); // This will hold the base64 image
  const [signing, setSigning] = useState(false);

  const fetchTrackingData = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await axios.get(`/api/tracking/${token}`);
      setJob(res.data.job);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tracking data:', err);
      if (!isPoll) setError(err.response?.data?.error || 'Could not find your tracking information.');
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const handleSignOff = async () => {
    if (!signName.trim()) {
      alert('Please enter your printed name.');
      return;
    }
    if (!signature) {
      alert('Please provide your signature.');
      return;
    }

    try {
      setSigning(true);
      await axios.patch(`/api/tracking/${token}`, { 
        status: 'signed_off',
        signedOffBy: signName,
        signatureImage: signature
      });
      fetchTrackingData();
      alert('Case signed off successfully. Thank you!');
    } catch (err) {
      console.error('Sign-off failed:', err);
      alert('Failed to sign off. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    // Poll for updates every 30 seconds
    const interval = setInterval(() => fetchTrackingData(true), 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width="200px" height="40px" sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height="400px" sx={{ borderRadius: '16px', mb: 4 }} />
        <Skeleton variant="rectangular" height="200px" sx={{ borderRadius: '16px' }} />
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <InfoIcon sx={{ fontSize: 64, color: '#e63946', mb: 3 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Oops!</Typography>
        <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 4 }}>{error || 'Invalid tracking link.'}</Typography>
        <Button variant="outlined" href="/" sx={{ color: tokens.citrus, borderColor: tokens.citrus }}>Return Home</Button>
      </Container>
    );
  }

  const activeStepIndex = statusSteps.findIndex(s => s.id === job.status) || 0;
  const isComplete = job.status === 'signed_off' || job.status === 'closed';

  return (
    <Box sx={{ bgcolor: tokens.obsidian, minHeight: '100vh', color: tokens.chalk, pb: 10 }}>
      {/* Branded Header */}
      <Box sx={{ borderBottom: `1px solid ${tokens.border}`, py: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'var(--font-cormorant)', color: tokens.citrus }}>
            FINAL ENTRY
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md">
        {/* Status Section */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            bgcolor: tokens.surface, 
            border: `1px solid ${tokens.border}`,
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backgroundImage: 'none'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'var(--font-cormorant)' }}>
                Your service is {isComplete ? 'Complete' : 'active'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(246,243,236,0.5)' }}>
                Requesting: <span style={{ color: tokens.citrus }}>{job.service}</span> • {job.address}
              </Typography>
            </Box>
            <Chip 
              icon={<ShippingIcon />} 
              label={job.status.replace('_', ' ').toUpperCase()} 
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700 }} 
            />
          </Box>

          {/* Progress Timeline */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', mb: 2, px: 2 }}>
             {/* Progress Bar Background */}
             <Box sx={{ position: 'absolute', top: 20, left: 40, right: 40, height: 2, bgcolor: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
             {/* Active Progress */}
             <Box sx={{ 
               position: 'absolute', 
               top: 20, 
               left: 40, 
               width: `${(activeStepIndex / (statusSteps.length - 1)) * 100}%`, 
               height: 2, 
               bgcolor: tokens.citrus, 
               zIndex: 1,
               transition: 'width 1s ease-in-out'
             }} />

             {statusSteps.map((step, idx) => {
               const isActive = idx <= activeStepIndex;
               return (
                 <Box key={step.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                   <Box sx={{ 
                     width: 40, 
                     height: 40, 
                     borderRadius: '50%', 
                     bgcolor: isActive ? tokens.citrus : tokens.surface,
                     border: `2px solid ${isActive ? tokens.citrus : 'rgba(255,255,255,0.1)'}`,
                     color: isActive ? tokens.obsidian : 'rgba(255,255,255,0.1)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     mb: 1,
                     transition: 'all 0.5s ease'
                   }}>
                     {step.icon}
                   </Box>
                   <Typography variant="caption" sx={{ color: isActive ? tokens.chalk : 'rgba(255,255,255,0.2)', textAlign: 'center', maxWidth: 80, fontWeight: isActive ? 600 : 400 }}>
                     {step.label}
                   </Typography>
                 </Box>
               );
             })}
          </Box>
        </Paper>

        {/* Site Findings / Technician Notes */}
        {job.technicianNotes && (
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              bgcolor: 'rgba(198, 241, 53, 0.05)', 
              border: `1px solid ${tokens.citrus}22`,
              borderRadius: '24px',
              backgroundImage: 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <InfoIcon sx={{ color: tokens.citrus }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.9rem', color: tokens.citrus }}>
                Site Findings & Report
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: tokens.chalk, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.technicianNotes}
            </Typography>
          </Paper>
        )}

        {/* PROMPT: Sign Off Job */}
        {job.status === 'completed' && (
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              bgcolor: tokens.citrus, 
              color: tokens.obsidian, // Changed to black
              borderRadius: '24px',
              backgroundImage: 'none',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'inherit' }}>
              Review & Sign-Off
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 500, opacity: 0.9, color: 'inherit' }}>
              Please review the case and type your name below to officially sign off.
            </Typography>

            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="Your Full Name (Printed)"
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                sx={{ 
                  mb: 2,
                  bgcolor: 'white',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiInputBase-input': { color: tokens.obsidian }
                }}
              />
              
              <SignaturePad 
                onSave={(data) => setSignature(data)} 
              />
              
              <Button 
                fullWidth
                variant="contained"
                size="large"
                disabled={signing || !signName || !signature}
                onClick={handleSignOff}
                sx={{ 
                  mt: 2,
                  bgcolor: tokens.obsidian, 
                  color: 'white',
                  fontWeight: 800,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': { bgcolor: '#000' }
                }}
              >
                {signing ? 'CLOSING CASE...' : 'SIGN & CLOSE JOB'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* JOB CLOSED Notification */}
        {job.status === 'signed_off' && (
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              color: tokens.chalk,
              borderRadius: '24px',
              backgroundImage: 'none',
              textAlign: 'center',
              border: `1px dashed ${tokens.border}`
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: tokens.citrus, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Job Signed Off
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Signed by {job.signedOffBy} {job.signedOffAt ? `on ${new Date(job.signedOffAt).toLocaleDateString()}` : ''}
            </Typography>
          </Paper>
        )}

        {/* Map Section */}
        <Paper 
          sx={{ 
            height: 450, 
            mb: 4, 
            bgcolor: tokens.surface, 
            border: `1px solid ${tokens.border}`,
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundImage: 'none',
            position: 'relative'
          }}
        >
          <TrackingMap 
            jobLocation={{ lat: job.location?.lat || 18.0179, lng: job.location?.lng || -76.8099 }} // Fallback to Kingston if not set
            techLocation={job.technician?.location}
            status={job.status}
          />
          {!job.technician?.isSharing && !isComplete && (
            <Box sx={{ 
              position: 'absolute', 
              top: 20, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              bgcolor: 'rgba(11,11,15,0.85)', 
              backdropFilter: 'blur(8px)',
              px: 3, 
              py: 1, 
              borderRadius: '20px',
              border: `1px solid ${tokens.border}`,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TimeIcon sx={{ color: tokens.citrus, fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Technician has not started journey yet</Typography>
            </Box>
          )}
        </Paper>

        {/* Technician Section */}
        {job.technician && (
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: tokens.surface, 
              border: `1px solid ${tokens.border}`,
              borderRadius: '24px',
              backgroundImage: 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Box 
                  component="img" 
                  src={job.technician.photo || 'https://via.placeholder.com/100'} 
                  sx={{ width: 80, height: 80, borderRadius: '20px', objectFit: 'cover' }} 
                />
                {job.technician.isSharing && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: -5, 
                    right: -5, 
                    width: 20, 
                    height: 20, 
                    bgcolor: '#4caf50', 
                    borderRadius: '50%', 
                    border: `4px solid ${tokens.surface}`,
                    boxShadow: '0 0 0 4px rgba(76,175,80,0.2)' 
                  }} />
                )}
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{job.technician.name}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(246,243,236,0.5)', mb: 2 }}>Assigned Technician</Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    startIcon={<PhoneIcon />} 
                    variant="outlined" 
                    size="small"
                    sx={{ color: tokens.citrus, borderColor: 'rgba(198,241,53,0.3)', borderRadius: '10px' }}
                  >
                    Call
                  </Button>
                  <Button 
                    startIcon={<ShippingIcon />} 
                    variant="outlined" 
                    size="small"
                    sx={{ color: tokens.chalk, borderColor: tokens.border, borderRadius: '10px' }}
                  >
                    Message
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
