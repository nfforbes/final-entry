'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
}

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  border: '#2d2d3a',
};

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle initial sizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Set actual drawing surface size to match display size
        const ratio = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * ratio;
        canvas.height = 200 * ratio;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(ratio, ratio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tokens.obsidian;
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'));
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
      onClear?.();
      onSave(''); // Clear the data
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box 
        sx={{ 
          bgcolor: 'white', 
          borderRadius: '12px', 
          height: 200, 
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'none', // Critical for mobile touch
          border: `2px solid ${tokens.border}`
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />
        {isEmpty && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              opacity: 0.3,
              pointerEvents: 'none',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Sign Here
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button 
          size="small" 
          onClick={clear}
          sx={{ color: tokens.obsidian, fontWeight: 700, opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          Clear Signature
        </Button>
      </Box>
    </Box>
  );
}
