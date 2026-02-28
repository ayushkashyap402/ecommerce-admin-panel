import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import {
  Search,
  Refresh,
  Block,
  CheckCircle,
  Visibility
} from '@mui/icons-material';
import { userService } from '../../services/userService';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleViewDetails = (customerId) => {
    navigate(`/dashboard/customers/${customerId}`);
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
    </Box>
  );
};
