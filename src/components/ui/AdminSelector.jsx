import React, { useEffect, useState } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip
} from '@mui/material';
import { authService } from '../../services/authService';

export const AdminSelector = ({ selectedAdminId, onAdminChange }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await authService.getAdmins();
        setAdmins(response || []);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        SuperAdmin View
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>View Dashboard As</InputLabel>
        <Select
          value={selectedAdminId || 'all'}
          onChange={(e) => onAdminChange(e.target.value === 'all' ? null : e.target.value)}
          label="View Dashboard As"
          disabled={loading}
        >
          <MenuItem value="all">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>All Admins (Overall View)</Typography>
              <Chip label="SuperAdmin" size="small" color="primary" />
            </Box>
          </MenuItem>
          {admins.map((admin) => (
            <MenuItem key={admin._id} value={admin._id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{admin.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ({admin.email})
                </Typography>
                {admin.status === 'inactive' && (
                  <Chip label="Inactive" size="small" color="error" />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
