'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Step, Stepper, StepLabel, Alert, CircularProgress } from '@mui/material';
import { tokens } from '@/lib/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { nextStep, prevStep, updateFormData, resetQuote } from '@/store/slices/quoteSlice';

const SERVICES = [
  { slug: 'roach-control', label: 'Roach Control', emoji: '🪳' },
  { slug: 'fumigation', label: 'Fumigation', emoji: '💨' },
  { slug: 'termite-control', label: 'Termite Control', emoji: '🪵' },
  { slug: 'rodent-removal', label: 'Rodent Removal', emoji: '🐀' },
  { slug: 'mosquito-control', label: 'Mosquito Control', emoji: '🦟' },
  { slug: 'bed-bug-treatment', label: 'Bed Bug Treatment', emoji: '🛏️' },
  { slug: 'general-pest-control', label: 'General Pest Control', emoji: '🏠' },
];

const PARISHES = [
  'Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann',
  'Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth',
  'Manchester','Clarendon','St. Catherine',
];

const URGENCY = [
  { value: 'emergency', label: '🚨 Emergency — Today or Tomorrow' },
  { value: 'urgent', label: '⚡ Urgent — Within 3 Days' },
  { value: 'scheduled', label: '📅 Scheduled — Within the Week' },
  { value: 'quote-only', label: '💬 Quote Only — No Rush' },
];

const PROPERTY_TYPES = [
  'Residential House', 'Apartment / Flat', 'Restaurant / Food Establishment',
  'Office Building', 'Warehouse / Industrial', 'Hotel / Guest House', 'Other',
];

const STEP_LABELS = ['Service', 'Location', 'Property', 'Contact'];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: tokens.surfaceDark,
    '& fieldset': { borderColor: tokens.border },
    '&:hover fieldset': { borderColor: 'rgba(198,241,53,0.5)' },
    '&.Mui-focused fieldset': { borderColor: tokens.citrus },
  },
  '& .MuiInputLabel-root': { color: 'rgba(246,243,236,0.5)' },
  '& .MuiInputBase-input': { color: tokens.chalk },
  '& .MuiSelect-icon': { color: 'rgba(246,243,236,0.5)' },
};

const selectMenuProps = { slotProps: { paper: { sx: { bgcolor: tokens.surfaceMid } } } };

function Step1Service({ formData, onChange }: { formData: Record<string, string>; onChange: (key: string, val: string) => void }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 1, fontSize: '1.8rem', color: tokens.chalk }}>
        What service do you need?
      </Typography>
      <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 4, fontSize: '0.9rem' }}>
        Select the pest problem you need eliminated.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        {SERVICES.map((s) => (
          <Box
            key={s.slug}
            onClick={() => onChange('service', s.slug)}
            sx={{
              p: 2.5,
              border: `2px solid ${formData.service === s.slug ? tokens.citrus : tokens.border}`,
              bgcolor: formData.service === s.slug ? 'rgba(198,241,53,0.08)' : tokens.surfaceDark,
              borderRadius: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'rgba(198,241,53,0.6)' },
            }}
          >
            <Typography sx={{ fontSize: '1.8rem', mb: 1 }}>{s.emoji}</Typography>
            <Typography sx={{ fontWeight: 600, color: tokens.chalk, fontSize: '0.92rem' }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>
      <TextField
        select
        label="Urgency"
        value={formData.urgency || ''}
        onChange={(e) => onChange('urgency', e.target.value)}
        sx={inputSx}
        fullWidth
        slotProps={{ select: { MenuProps: selectMenuProps } }}
      >
        {URGENCY.map((u) => (
          <MenuItem key={u.value} value={u.value} sx={{ color: tokens.chalk }}>{u.label}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

function Step2Location({ formData, onChange }: { formData: Record<string, string>; onChange: (key: string, val: string) => void }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 1, fontSize: '1.8rem', color: tokens.chalk }}>
        Where is the property?
      </Typography>
      <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 4, fontSize: '0.9rem' }}>
        We cover all 14 parishes across Jamaica.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <TextField
          select
          required
          label="Parish"
          value={formData.parish || ''}
          onChange={(e) => onChange('parish', e.target.value)}
          sx={inputSx}
          fullWidth
          slotProps={{ select: { MenuProps: selectMenuProps } }}
        >
          {PARISHES.map((p) => (
            <MenuItem key={p} value={p} sx={{ color: tokens.chalk }}>{p}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Community / Town"
          value={formData.community || ''}
          onChange={(e) => onChange('community', e.target.value)}
          sx={inputSx}
          fullWidth
        />
        <TextField
          label="Street Address (optional)"
          value={formData.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          sx={{ ...inputSx, gridColumn: { sm: '1 / -1' } }}
          fullWidth
        />
      </Box>
    </Box>
  );
}

function Step3Property({ formData, onChange }: { formData: Record<string, string>; onChange: (key: string, val: string) => void }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 1, fontSize: '1.8rem', color: tokens.chalk }}>
        Tell us about the property
      </Typography>
      <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 4, fontSize: '0.9rem' }}>
        This helps us estimate and assign the right technician.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <TextField
          select
          label="Property Type"
          value={formData.propertyType || ''}
          onChange={(e) => onChange('propertyType', e.target.value)}
          sx={inputSx}
          fullWidth
          slotProps={{ select: { MenuProps: selectMenuProps } }}
        >
          {PROPERTY_TYPES.map((t) => (
            <MenuItem key={t} value={t} sx={{ color: tokens.chalk }}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Property Size (e.g. 3 bedroom)"
          value={formData.propertySize || ''}
          onChange={(e) => onChange('propertySize', e.target.value)}
          sx={inputSx}
          fullWidth
        />
        <TextField
          label="Additional notes (describe the problem)"
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          sx={{ ...inputSx, gridColumn: { sm: '1 / -1' } }}
          fullWidth
          multiline
          rows={4}
        />
      </Box>
    </Box>
  );
}

function Step4Contact({ formData, onChange }: { formData: Record<string, string>; onChange: (key: string, val: string) => void }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 1, fontSize: '1.8rem', color: tokens.chalk }}>
        Your contact details
      </Typography>
      <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 4, fontSize: '0.9rem' }}>
        A technician will contact you to confirm the appointment.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <TextField required label="Full Name" value={formData.name || ''} onChange={(e) => onChange('name', e.target.value)} sx={inputSx} fullWidth />
        <TextField required label="Phone Number" value={formData.phone || ''} onChange={(e) => onChange('phone', e.target.value)} sx={inputSx} fullWidth />
        <TextField label="Email Address" type="email" value={formData.email || ''} onChange={(e) => onChange('email', e.target.value)} sx={{ ...inputSx, gridColumn: { sm: '1 / -1' } }} fullWidth />
      </Box>
    </Box>
  );
}

export default function BookingPage() {
  const dispatch = useDispatch();
  const { currentStep, formData, submitting, error, submitted } = useSelector((state: RootState) => state.quote);
  const [localData, setLocalData] = useState<Record<string, string>>(formData as Record<string, string>);

  const handleChange = (key: string, val: string) => {
    setLocalData((prev) => ({ ...prev, [key]: val }));
    dispatch(updateFormData({ [key]: val }));
  };

  const handleNext = () => dispatch(nextStep());
  const handleBack = () => dispatch(prevStep());

  const handleSubmit = async () => {
    dispatch({ type: 'quote/submitQuoteRequest', payload: localData });
  };

  if (submitted) {
    return (
      <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 560, px: 3 }}>
          <Typography sx={{ fontSize: '4rem', mb: 3 }}>✅</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
            Quote Request Received!
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 5, lineHeight: 1.7 }}>
            A certified Final Entry technician will contact you within 2 hours to confirm your appointment and provide your free quote.
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(resetQuote())}
            sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5 }}
          >
            Submit Another Request
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 }, maxWidth: '860px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: tokens.citrus, letterSpacing: '0.14em', fontWeight: 700 }}>
            No Obligation
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mt: 1, mb: 2, lineHeight: 1 }}>
            Request a Free Quote
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.55)', fontSize: '1rem', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
            Takes 2 minutes. A licensed technician will reach back within 2 hours.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={currentStep}
          sx={{
            mb: 6,
            '& .MuiStepLabel-label': { color: 'rgba(246,243,236,0.4)', fontSize: '0.8rem' },
            '& .MuiStepLabel-label.Mui-active': { color: tokens.chalk },
            '& .MuiStepLabel-label.Mui-completed': { color: tokens.citrus },
            '& .MuiStepIcon-root': { color: tokens.border },
            '& .MuiStepIcon-root.Mui-active': { color: tokens.citrus },
            '& .MuiStepIcon-root.Mui-completed': { color: tokens.citrus },
            '& .MuiStepConnector-line': { borderColor: tokens.border },
          }}
        >
          {STEP_LABELS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step content */}
        <Box sx={{ bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 1, p: { xs: 3, md: 5 }, mb: 4 }}>
          {currentStep === 0 && <Step1Service formData={localData} onChange={handleChange} />}
          {currentStep === 1 && <Step2Location formData={localData} onChange={handleChange} />}
          {currentStep === 2 && <Step3Property formData={localData} onChange={handleChange} />}
          {currentStep === 3 && <Step4Contact formData={localData} onChange={handleChange} />}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outlined"
            id="booking-back"
            sx={{ borderColor: tokens.border, color: tokens.chalk, '&:disabled': { opacity: 0.3 } }}
          >
            Back
          </Button>
          {currentStep < STEP_LABELS.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              id="booking-next"
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 4 }}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              id="booking-submit"
              disabled={submitting}
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5 }}
            >
              {submitting ? <CircularProgress size={20} sx={{ color: tokens.obsidian }} /> : 'Request Free Quote'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
