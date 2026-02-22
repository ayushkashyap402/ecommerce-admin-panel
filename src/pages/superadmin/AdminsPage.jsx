import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, Add, Visibility, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const roleColors = {
  superadmin: '#f44336',
  admin: '#2196f3',
};

export const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await authService.getAdmins();
      setAdmins(data.admins || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (admin) => {
    setSelectedAdmin(admin);
    setDetailDialogOpen(true);
  };

  const handleViewDashboard = async (admin) => {
    try {
      console.log('🚀 Starting impersonation for admin:', admin.name, admin._id);
      
      // Call backend to generate impersonation token
      const response = await authService.generateImpersonationToken(admin._id);
      console.log('✅ Impersonation token received:', response);
      
      // Store token in localStorage (accessible across tabs)
      const impersonationData = {
        token: response.token,
        adminId: admin._id,
        adminName: admin.name,
        timestamp: Date.now()
      };
      
      // Use a unique key with timestamp to avoid conflicts
      const storageKey = `impersonate_${Date.now()}`;
      console.log('💾 Storing in localStorage with key:', storageKey);
      localStorage.setItem(storageKey, JSON.stringify(impersonationData));
      
      // Verify it was stored
      const verify = localStorage.getItem(storageKey);
      console.log('✅ Verification - Data stored:', verify ? 'Yes' : 'No');
      
      // Open new tab with only the storage key (not the token)
      const url = `${window.location.origin}/admin-login?key=${storageKey}`;
      console.log('🌐 Opening new tab with URL:', url);
      
      // Open in new tab (same browser window)
      const newTab = window.open(url, '_blank');
      
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        // Popup blocked - provide helpful message
        console.warn('⚠️  Popup blocked by browser');
        
        // Show a more helpful message
        alert(
          'Popup was blocked by your browser.\n\n' +
          'Please allow popups for this site:\n' +
          '1. Click the popup blocked icon in address bar (🚫)\n' +
          '2. Select "Always allow popups from localhost:3000"\n' +
          '3. Try again'
        );
        
        // Clean up
        localStorage.removeItem(storageKey);
        return;
      }
      
      console.log('✅ New tab opened successfully in same browser window');
      
      // Clean up storage key after 15 seconds (give enough time for new window to load)
      setTimeout(() => {
        console.log('🧹 Cleaning up storage key after 15 seconds:', storageKey);
        localStorage.removeItem(storageKey);
      }, 15000);
      
    } catch (error) {
      console.error('❌ Failed to generate impersonation token:', error);
      alert('Failed to open admin dashboard. Please try again.');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      status: admin.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await authService.deleteAdmin(id);
        fetchAdmins();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // SECURITY: Force role to 'admin' - SuperAdmin cannot be created via UI
      const submitData = {
        ...formData,
        role: 'admin' // Always 'admin', never 'superadmin'
      };
      
      if (editingAdmin) {
        const updateData = { ...submitData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await authService.updateAdmin(editingAdmin._id, updateData);
      } else {
        await authService.createAdmin(submitData);
      }
      setDialogOpen(false);
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        status: 'active'
      });
      fetchAdmins();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: roleColors[params.value] || '#666',
            color: 'white'
          }}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'active' ? 'success' : 'default'}
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 180,
      getActions: (params) => [
        <Tooltip title="View Details">
          <GridActionsCellItem
            icon={<Visibility />}
            label="View Details"
            onClick={() => handleViewDetails(params.row)}
            sx={{ color: '#2196f3' }}
          />
        </Tooltip>,
        <Tooltip title="View Dashboard">
          <GridActionsCellItem
            icon={<Dashboard />}
            label="View Dashboard"
            onClick={() => handleViewDashboard(params.row)}
            sx={{ color: '#4caf50' }}
          />
        </Tooltip>,
        <Tooltip title="Edit">
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
          />
        </Tooltip>,
        <Tooltip title="Delete">
          <GridActionsCellItem
            icon={<Delete />}
            label="Delete"
            onClick={() => handleDelete(params.row._id)}
            sx={{ color: '#f44336' }}
          />
        </Tooltip>,
      ],
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Admin Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid 
          rows={(admins || []).map((a) => ({ ...a, id: a._id || a.id }))} 
          columns={columns} 
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!editingAdmin}
              helperText={editingAdmin ? "Leave empty to keep current password" : ""}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              margin="normal"
              disabled
              helperText="Role is automatically set to Admin"
            >
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAdmin ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Admin Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Admin Details
        </DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="h6">{selectedAdmin.name}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedAdmin.email}</Typography>
              </Box>

              <Box sx={{ mb: 3, display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                  <Chip
                    label={selectedAdmin.role}
                    size="small"
                    sx={{
                      mt: 0.5,
                      backgroundColor: roleColors[selectedAdmin.role] || '#666',
                      color: 'white'
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedAdmin.status}
                    size="small"
                    color={selectedAdmin.status === 'active' ? 'success' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              {selectedAdmin.lastLogin && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                  <Typography variant="body2">
                    {new Date(selectedAdmin.lastLogin).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {selectedAdmin.createdAt && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">
                    {new Date(selectedAdmin.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {selectedAdmin.createdBy && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body2">
                    {selectedAdmin.createdBy.name} ({selectedAdmin.createdBy.email})
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Dashboard />}
            onClick={() => {
              setDetailDialogOpen(false);
              handleViewDashboard(selectedAdmin);
            }}
          >
            View Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
