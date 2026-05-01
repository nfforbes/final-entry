'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Alert, CircularProgress } from '@mui/material';
import { tokens } from '@/lib/theme';
import type { Metadata } from 'next';

const PARISHES = [
  'Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann',
  'Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth',
  'Manchester','Clarendon','St. Catherine',
];

const CONTACT_INFO = [
  { emoji: '📞', label: 'Phone', value: '+1 (876) 887-7622', href: 'tel:+18768877622' },
  { emoji: '✉️', label: 'Email', value: 'finalentrypest@gmail.com', href: 'mailto:finalentrypest@gmail.com' },
  { emoji: '📍', label: 'Office', value: '7 Corrie Close, Upper St. Andrew, Jamaica', href: null },
  { emoji: '🕐', label: 'Hours', value: 'Mon–Sat: 7am – 6pm', href: null },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', parish: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Placeholder — would POST to /api/contact
    await new Promise((r) => setTimeout(r, 1000));
    setStatus('success');
  };

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

  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      {/* Hero */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="overline" sx={{ color: tokens.citrus, letterSpacing: '0.14em', fontWeight: 700 }}>
          Get in Touch
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mt: 1, mb: 3, lineHeight: 1 }}>
          Contact{' '}
          <Box component="span" sx={{ color: tokens.citrus }}>
            Final Entry
          </Box>
        </Typography>
        <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '1.1rem', maxWidth: 560, lineHeight: 1.7 }}>
          Send us a message and a technician will respond within 2 hours during business hours.
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          pb: { xs: 8, md: 14 },
          maxWidth: '1200px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 6,
        }}
      >
        {/* Contact info */}
        <Box>
          <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 3 }}>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {CONTACT_INFO.map((info) => (
              <Box key={info.label} sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mt: 0.2 }}>{info.emoji}</Typography>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(246,243,236,0.4)', mb: 0.25 }}>
                    {info.label}
                  </Typography>
                  {info.href ? (
                    <Typography
                      component="a"
                      href={info.href}
                      sx={{ color: tokens.chalk, textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: tokens.citrus } }}
                    >
                      {info.value}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: tokens.chalk, fontSize: '0.95rem' }}>{info.value}</Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 6, p: 3, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.chalk }}>Emergency Pest Issue?</Typography>
            <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.88rem', lineHeight: 1.7, mb: 2 }}>
              Call our priority line directly for same-day emergency responses across Kingston and St. Andrew.
            </Typography>
            <Typography
              component="a"
              href="tel:+18768877622"
              sx={{ color: tokens.citrus, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}
            >
              📞 +1 (876) 887-7622
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 1, p: { xs: 3, md: 5 } }}
        >
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, mb: 4, fontSize: '1.6rem', color: tokens.chalk }}>
            Send a Message
          </Typography>

          {status === 'success' && (
            <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(198,241,53,0.1)', color: tokens.citrus }}>
              Message sent! We&apos;ll respond within 2 hours.
            </Alert>
          )}
          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Something went wrong. Please call us directly.
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
            <TextField required label="Full Name" name="name" value={form.name} onChange={handleChange} sx={inputSx} fullWidth />
            <TextField required label="Email" name="email" type="email" value={form.email} onChange={handleChange} sx={inputSx} fullWidth />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} sx={inputSx} fullWidth />
            <TextField
              select
              label="Parish"
              name="parish"
              value={form.parish}
              onChange={handleChange}
              sx={inputSx}
              fullWidth
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { bgcolor: tokens.surfaceMid } } } } } }}
            >
              {PARISHES.map((p) => (
                <MenuItem key={p} value={p} sx={{ color: tokens.chalk }}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            required
            label="Message — describe your pest problem"
            name="message"
            value={form.message}
            onChange={handleChange}
            sx={{ ...inputSx, mb: 4 }}
            fullWidth
            multiline
            rows={5}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            id="contact-submit"
            disabled={status === 'sending'}
            sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5, py: 1.5 }}
          >
            {status === 'sending' ? <CircularProgress size={20} sx={{ color: tokens.obsidian }} /> : 'Send Message'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
