'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Chip, IconButton, Menu, MenuItem, 
  Button, Select, FormControl, InputLabel, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, Stack 
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { MoreVert as MoreIcon, AssignmentInd as AssignIcon, AttachMoney as PriceIcon, Schedule as DateIcon } from '@mui/icons-material';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

const STATUS_FLOW = [
  'rfq',
  'quote_sent',
  'order_confirmed',
  'assigned',
  'in_progress',
  'signed_off',
  'billed',
  'closed',
  'cancelled'
];

export default function AdminOrdersPage() {
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'status' | 'assign' | 'price' | 'date'>('status');
  
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [extraPrice, setExtraPrice] = useState('');
  const [tempValue, setTempValue] = useState<any>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, techsRes] = await Promise.all([
        axios.get('/api/admin/jobs'),
        axios.get('/api/admin/users?role=technician')
      ]);
      setJobs(jobsRes.data.jobs || []);
      setTechnicians(techsRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (job: any, type: 'status' | 'assign' | 'price' | 'date') => {
    setSelectedJob(job);
    setDialogType(type);
    setQuoteFile(null);
    setExtraPrice(job.quotedPrice || '');
    
    if (type === 'assign') setTempValue(job.technicianId?._id || '');
    if (type === 'price') setTempValue(job.quotedPrice || '');
    if (type === 'status') setTempValue(job.status);
    if (type === 'date') setTempValue(job.scheduledDate ? job.scheduledDate.split('T')[0] : '');
    setDialogOpen(true);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    if (!selectedJob) return;
    
    // Mandatory Price Check for Quote Sent
    if (dialogType === 'status' && tempValue === 'quote_sent' && !extraPrice) {
      alert('Price is required when sending a quote.');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {};
      if (dialogType === 'status') {
        payload.status = tempValue;
        if (tempValue === 'quote_sent') {
          payload.quotedPrice = Number(extraPrice);
          if (quoteFile) {
            payload.attachment = {
              filename: quoteFile.name,
              contentType: quoteFile.type,
              data: await fileToBase64(quoteFile)
            };
          }
        }
        if (tempValue === 'assigned') {
          if (!extraPrice) { // We're reusing extraPrice as a temp holder for techId in the UI for simplicity or create techId state
            alert('Please select a technician.');
            return;
          }
          payload.technicianId = extraPrice;
        }
      }
      if (dialogType === 'assign') payload.technicianId = tempValue;
      if (dialogType === 'price') payload.quotedPrice = Number(tempValue);
      if (dialogType === 'date') payload.scheduledDate = tempValue;

      await axios.patch(`/api/admin/jobs/${selectedJob._id}`, payload);
      fetchData();
      setDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'customerId', 
      headerName: 'Customer', 
      flex: 1, 
      valueGetter: (params: any) => params?.row?.customerId?.name || 'Guest'
    },
    { 
      field: 'serviceId', 
      headerName: 'Service', 
      width: 150, 
      valueGetter: (params: any) => params?.row?.serviceId?.title || 'Service'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 180,
      renderCell: (params: any) => (
        <Chip 
          label={params.value?.replace('_', ' ').toUpperCase()} 
          size="small"
          sx={{ 
            bgcolor: params.value === 'closed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(198, 241, 53, 0.1)',
            color: params.value === 'closed' ? '#4caf50' : tokens.citrus,
            border: `1px solid ${params.value === 'closed' ? '#4caf50' : tokens.citrus}`,
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => handleOpenDialog(params.row, 'status')}
        />
      )
    },
    { 
      field: 'technicianId', 
      headerName: 'Assigned To', 
      width: 180,
      valueGetter: (params: any) => params?.row?.technicianId?.name || 'Unassigned',
      renderCell: (params: any) => (
        <Button 
          startIcon={<AssignIcon />}
          sx={{ 
            color: params.row?.technicianId ? tokens.citrus : 'rgba(255, 255, 255, 0.3)', 
            textTransform: 'none',
            fontWeight: params.row?.technicianId ? 700 : 400
          }}
          onClick={() => handleOpenDialog(params.row, 'assign')}
        >
          {params.row?.technicianId?.name || 'Unassigned'}
        </Button>
      )
    },
    { 
      field: 'quotedPrice', 
      headerName: 'Price', 
      width: 120,
      renderCell: (params: any) => (
        <Button 
          startIcon={<PriceIcon />}
          sx={{ color: tokens.chalk, textTransform: 'none' }}
          onClick={() => handleOpenDialog(params.row, 'price')}
        >
          {params.value ? `$${params.value}` : '—'}
        </Button>
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Requested', 
      width: 150,
      valueGetter: (params: any) => params?.row?.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : '—'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'var(--font-cormorant)', mb: 1 }}>
          Orders & Lifecycle
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(246, 243, 236, 0.6)' }}>
          Track jobs from initial request through to sign-off and billing.
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          bgcolor: tokens.surface, 
          border: `1px solid ${tokens.border}`, 
          borderRadius: '16px',
          overflow: 'hidden',
          '& .MuiDataGrid-root': {
            border: 'none',
            color: tokens.chalk,
            fontFamily: 'var(--font-space-grotesk)',
            '& .MuiDataGrid-cell': { borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-columnHeaders': { 
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderBottom: `2px solid ${tokens.border}`,
            },
            '& .MuiTablePagination-root': { color: tokens.chalk }
          }
        }}
      >
        <DataGrid
          rows={jobs}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
          pageSizeOptions={[15, 30]}
          disableRowSelectionOnClick
          autoHeight
          loading={loading}
        />
      </Paper>

      {/* Lifecycle Management Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        slotProps={{ 
          paper: { 
            sx: { 
              bgcolor: tokens.surface, 
              color: tokens.chalk, 
              border: `1px solid ${tokens.border}`, 
              backgroundImage: 'none', 
              minWidth: 400 
            } 
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
          Update Job {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogType === 'status' && (
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>New Status</InputLabel>
                <Select
                  value={tempValue}
                  label="New Status"
                  onChange={(e) => setTempValue(e.target.value)}
                  sx={{ color: tokens.chalk, '.MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
                >
                  {STATUS_FLOW.map(s => (
                    <MenuItem key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(tempValue === 'quote_sent' || tempValue === 'billed') && (
                <>
                  <TextField 
                    fullWidth
                    label={tempValue === 'quote_sent' ? "Quoted Price ($)" : "Final Billed Amount ($)"}
                    type="number"
                    value={extraPrice}
                    onChange={(e) => setExtraPrice(e.target.value)}
                    sx={{ input: { color: tokens.chalk }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
                  />
                  {tempValue === 'quote_sent' && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mb: 1, display: 'block' }}>
                        ATTACH QUOTE PDF (OPTIONAL)
                      </Typography>
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setQuoteFile(e.target.files?.[0] || null)}
                        style={{ color: tokens.chalk }}
                      />
                    </Box>
                  )}
                </>
              )}
              {tempValue === 'assigned' && (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Select Technician</InputLabel>
                  <Select
                    value={extraPrice}
                    label="Select Technician"
                    onChange={(e) => setExtraPrice(e.target.value)}
                    sx={{ color: tokens.chalk, '.MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {technicians.map((t: any) => (
                      <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          )}

          {dialogType === 'assign' && (
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Select Technician</InputLabel>
              <Select
                value={tempValue}
                label="Select Technician"
                onChange={(e) => setTempValue(e.target.value)}
                sx={{ color: tokens.chalk, '.MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
              >
                <MenuItem value=""><em>Unassigned</em></MenuItem>
                {technicians.map((t: any) => (
                  <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {dialogType === 'price' && (
            <TextField
              fullWidth
              label="Quoted Price ($)"
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              sx={{ input: { color: tokens.chalk }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
            />
          )}

          {dialogType === 'date' && (
            <TextField
              fullWidth
              label="Schedule Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              sx={{ input: { color: tokens.chalk }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border } }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: tokens.chalk }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, '&:hover': { bgcolor: tokens.citrus, opacity: 0.9 } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
