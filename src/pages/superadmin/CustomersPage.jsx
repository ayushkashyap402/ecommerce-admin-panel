import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Refresh,
  Block,
  CheckCircle,
  Visibility,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';
import { userService } from '../../services/userService';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery
      });
      
      setCustomers(response.users || []);
      setTotalCustomers(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleViewDetails = async (customerId) => {
    try {
      const customer = await userService.getUserById(customerId);
      setSelectedCustomer(customer);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    try {
      await userService.updateUserStatus(customerId, { isActive: !currentStatus });
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#111827', mb: 0.5 }}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all registered customers and their accounts
          </Typography>
        </Box>
        <IconButton 
          onClick={fetchCustomers}
          sx={{ 
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            '&:hover': { bgcolor: '#F9FAFB' }
          }}
        >
          <Refresh sx={{ color: '#6B7280' }} />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
                '&:hover fieldset': {
                  borderColor: '#00bd7d',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00bd7d',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress sx={{ color: '#00bd7d' }} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <TableRow key={customer._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  bgcolor: '#00bd7d',
                                  width: 40,
                                  height: 40,
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              >
                                {getInitials(customer.name)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {customer.name || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {customer.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {customer.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={customer.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                backgroundColor: customer.isActive ? '#D1FAE5' : '#FEE2E2',
                                color: customer.isActive ? '#065F46' : '#991B1B',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(customer._id)}
                              sx={{ color: '#00bd7d', mr: 1 }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                              sx={{ color: customer.isActive ? '#EF4444' : '#10B981' }}
                            >
                              {customer.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            No customers found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCustomers}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Customer Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedCustomer && (
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  sx={{
                    bgcolor: '#00bd7d',
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(selectedCustomer.name)}
                </Avatar>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Email sx={{ color: '#6B7280' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedCustomer.email}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Phone sx={{ color: '#6B7280' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedCustomer.phone || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocationOn sx={{ color: '#6B7280' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedCustomer.addresses?.length > 0 
                        ? `${selectedCustomer.addresses[0].city}, ${selectedCustomer.addresses[0].state}`
                        : 'No address added'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body1" fontWeight={500}>
                  <Chip
                    label={selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      backgroundColor: selectedCustomer.isActive ? '#D1FAE5' : '#FEE2E2',
                      color: selectedCustomer.isActive ? '#065F46' : '#991B1B',
                      fontWeight: 600
                    }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Member Since</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)} sx={{ color: '#6B7280' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
