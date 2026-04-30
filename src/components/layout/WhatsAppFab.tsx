'use client';

import React from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useScrollTrigger } from '@mui/material';

import { usePathname } from 'next/navigation';

export function WhatsAppFab() {
  const pathname = usePathname();
  const whatsappUrl = 'https://wa.me/18762774040';
  
  // Hide FAB in Admin Portal
  if (pathname.startsWith('/admin')) return null;

  
  // Show after scrolling a bit or just show always? User said "floating on each page".
  // Let's show it always but with a nice entry animation.
  
  return (
    <Zoom in={true} style={{ transitionDelay: '500ms' }}>
      <Tooltip title="Chat with us on WhatsApp" placement="left" arrow>
        <Fab
          aria-label="whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 32 },
            right: { xs: 24, md: 32 },
            bgcolor: '#25D366', // Official WhatsApp Brand Color
            color: 'white',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
            '&:hover': {
              bgcolor: '#128C7E',
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: '0 6px 16px rgba(37, 211, 102, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 2000,
          }}
        >
          <WhatsAppIcon sx={{ fontSize: '2rem' }} />
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
