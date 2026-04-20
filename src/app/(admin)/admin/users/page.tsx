'use client';

import React, { useEffect, useState } from 'react';
import { MoreVert as MoreIcon, Person as PersonIcon, Security as AdminIcon, Engineering as TechIcon, Add as AddIcon, Email as EmailIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Paper, Chip, IconButton, Menu, MenuItem, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const tokens = {
  obsidian: '#0b0b0f',
  citrus: '#c6f135',
  chalk: '#f6f3ec',
  border: '#2d2d3a',
  surface: '#141418',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('customer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    try {
      setInviteLoading(true);
      setInviteMessage(null);
      await axios.post('/api/admin/users/invite', { email: inviteEmail, role: inviteRole });
      setInviteMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setTimeout(() => {
        setInviteOpen(false);
        setInviteMessage(null);
      }, 2000);
    } catch (err: any) {
      setInviteMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send invitation' });
    } finally {
      setInviteLoading(false);
    }
  };

  const updateUserRole = async (role: string) => {
    if (!selectedUser) return;
    try {
      await axios.patch(`/api/admin/users/${selectedUser._id}`, { role });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    } finally {
      handleActionClose();
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to delete ${selectedUser.name}?`)) return;
    try {
      await axios.delete(`/api/admin/users/${selectedUser._id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      handleActionClose();
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'User', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
          <Box sx={{ p: 1, bgcolor: tokens.border, borderRadius: '50%', display: 'flex', color: tokens.citrus }}>
            <PersonIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(246, 243, 236, 0.4)' }}>{params.row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => {
        const isAdm = params.value === 'admin';
        const isTech = params.value === 'technician';
        return (
          <Chip 
            label={params.value?.toUpperCase()} 
            size="small"
            icon={isAdm ? <AdminIcon /> : isTech ? <TechIcon /> : undefined}
            sx={{ 
              bgcolor: isAdm ? 'rgba(198, 241, 53, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: isAdm ? tokens.citrus : tokens.chalk,
              border: `1px solid ${isAdm ? tokens.citrus : tokens.border}`,
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'inherit' }
            }} 
          />
        );
      }
    },
    { field: 'parish', headerName: 'Parish', width: 150 },
    { 
      field: 'createdAt', 
      headerName: 'Joined', 
      width: 150,
      valueGetter: (value) => new Date(value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleActionClick(e, params.row)} sx={{ color: tokens.chalk }}>
          <MoreIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'var(--font-cormorant)', mb: 1 }}>
            User Accounts
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(246, 243, 236, 0.6)' }}>
            Manage permissions and roles for your platform users.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setInviteMessage(null);
            setInviteOpen(true);
          }}
          sx={{
            bgcolor: tokens.citrus,
            color: tokens.obsidian,
            fontWeight: 700,
            px: 3,
            borderRadius: '12px',
            '&:hover': { bgcolor: tokens.chalk }
          }}
        >
          Invite User
        </Button>
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
            '& .MuiDataGrid-cell': { borderBottom: `1px solid ${tokens.border}` },
            '& .MuiDataGrid-columnHeaders': { 
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderBottom: `2px solid ${tokens.border}`,
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 }
            },
            '& .MuiDataGrid-footerContainer': { borderTop: `2px solid ${tokens.border}` },
            '& .MuiTablePagination-root': { color: tokens.chalk }
          }
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          loading={loading}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        slotProps={{
          paper: {
            sx: { 
              bgcolor: tokens.surface, 
              color: tokens.chalk,
              border: `1px solid ${tokens.border}`,
              minWidth: 180,
              backgroundImage: 'none'
            }
          }
        }}
      >
        <MenuItem onClick={() => updateUserRole('customer')}>Set as Customer</MenuItem>
        <MenuItem onClick={() => updateUserRole('technician')}>Set as Technician</MenuItem>
        <MenuItem onClick={() => updateUserRole('admin')} sx={{ color: tokens.citrus }}>Promote to Admin</MenuItem>
        <Divider sx={{ borderColor: tokens.border }} />
        <MenuItem onClick={deleteUser} sx={{ color: '#e63946' }}>Delete User</MenuItem>
      </Menu>

      {/* Invite Modal */}
      <Dialog 
        open={inviteOpen} 
        onClose={() => !inviteLoading && setInviteOpen(false)}
        slotProps={{
          paper: {
            sx: { 
              bgcolor: tokens.surface, 
              color: tokens.chalk,
              border: `1px solid ${tokens.border}`,
              backgroundImage: 'none',
              borderRadius: '16px',
              width: '100%',
              maxWidth: 450
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 3 }}>Invite New User</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'rgba(246,243,236,0.6)' }}>
            Send an invitation email to a new user. They will be assigned the selected role automatically upon signup.
          </Typography>
          
          {inviteMessage && (
            <Alert 
              severity={inviteMessage.type} 
              sx={{ 
                mb: 3, 
                bgcolor: inviteMessage.type === 'success' ? 'rgba(198,241,53,0.1)' : 'rgba(230,57,70,0.1)',
                color: tokens.chalk,
                border: `1px solid ${inviteMessage.type === 'success' ? tokens.citrus : '#e63946'}`
              }}
            >
              {inviteMessage.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            size="small"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviteLoading}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: tokens.chalk,
                '& fieldset': { borderColor: tokens.border },
                '&:hover fieldset': { borderColor: tokens.citrus },
              },
              '& .MuiInputLabel-root': { color: 'rgba(246,243,236,0.4)' }
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'rgba(246,243,236,0.4)' }}>Role</InputLabel>
            <Select
              value={inviteRole}
              label="Role"
              onChange={(e) => setInviteRole(e.target.value)}
              disabled={inviteLoading}
              sx={{ 
                color: tokens.chalk,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.citrus },
                '& .MuiSelect-icon': { color: tokens.chalk }
              }}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setInviteOpen(false)} 
            disabled={inviteLoading}
            sx={{ color: 'rgba(246,243,236,0.4)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleInviteUser}
            disabled={inviteLoading || !inviteEmail}
            sx={{ 
              bgcolor: tokens.citrus, 
              color: tokens.obsidian,
              fontWeight: 700,
              px: 3,
              borderRadius: '8px',
              '&:hover': { bgcolor: tokens.chalk },
              '&.Mui-disabled': { bgcolor: 'rgba(198,241,53,0.2)', color: 'rgba(11,11,15,0.4)' }
            }}
          >
            {inviteLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
