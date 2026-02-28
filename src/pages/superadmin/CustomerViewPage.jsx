import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Button,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Verified,
  Block
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';

export const CustomerViewPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer details
      const customerData = await userService.getUserById(customerId);
      setCustomer(customerData);
      
      // Fetch customer orders
      const ordersResponse = await orderService.getAllOrders({ userId: customerId });
      const customerOrders = ordersResponse.orders || [];
      setOrders(customerOrders);
      
      // Calculate stats
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = customerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
      const completedOrders = customerOrders.filter(o => o.status === 'delivered').length;
      
      setStats({
        totalOrders: customerOrders.length,
        totalSpent,
        pendingOrders,
        completedOrders
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Set empty data on error
      setCustomer(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      processing: { bg: '#DBEAFE', text: '#1E40AF' },
      shipped: { bg: '#E0E7FF', text: '#3730A3' },
      delivered: { bg: '#D1FAE5', text: '#065F46' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B' }
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ShoppingBag fontSize="small" />,
      processing: <ShoppingBag fontSize="small" />,
      shipped: <LocalShipping fontSize="small" />,
      delivered: <CheckCircle fontSize="small" />,
      cancelled: <Cancel fontSize="small" />
    };
    return icons[status] || icons.pending;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: '#00bd7d' }} />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">Customer not found</Typography>
        <Button onClick={() => navigate('/dashboard/customers')} sx={{ mt: 2 }}>
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton 
          onClick={() => navigate('/dashboard/customers')}
          sx={{ 
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            bgcolor: '#FFFFFF'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
            Customer Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete information and activity history
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  bgcolor: '#00bd7d',
                  width: 100,
                  height: 100,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  margin: '0 auto',
                  mb: 2
                }}
              >
                {getInitials(customer.name)}
              </Avatar>
              
              <Typography variant="h5" fontWeight={700} mb={1}>
                {customer.name}
              </Typography>
              
              <Chip
                label={customer.isActive ? 'Active' : 'Inactive'}
                size="small"
                icon={customer.isActive ? <CheckCircle /> : <Block />}
                sx={{
                  backgroundColor: customer.isActive ? '#D1FAE5' : '#FEE2E2',
                  color: customer.isActive ? '#065F46' : '#991B1B',
                  fontWeight: 600,
                  mb: 3
                }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Contact Information */}
              <Box textAlign="left">
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Email sx={{ color: '#6B7280', fontSize: 20 }} />
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {customer.email}
                    </Typography>
                  </Box>
                  {customer.emailVerified && (
                    <Verified sx={{ color: '#00bd7d', fontSize: 18 }} />
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Phone sx={{ color: '#6B7280', fontSize: 20 }} />
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Phone
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {customer.phone || 'Not provided'}
                    </Typography>
                  </Box>
                  {customer.phoneVerified && (
                    <Verified sx={{ color: '#00bd7d', fontSize: 18 }} />
                  )}
                </Box>

                <Box display="flex" alignItems="flex-start" gap={2}>
                  <CalendarToday sx={{ color: '#6B7280', fontSize: 20, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Member Since
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB', mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Order Statistics
              </Typography>
              
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                <Typography variant="h4" fontWeight={700} color="#00bd7d">
                  {stats.totalOrders}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Total Spent</Typography>
                <Typography variant="h5" fontWeight={700}>
                  ₹{stats.totalSpent.toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
                <Typography variant="body2" fontWeight={600}>{stats.completedOrders}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Pending</Typography>
                <Typography variant="body2" fontWeight={600}>{stats.pendingOrders}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          {/* Addresses Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <LocationOn sx={{ color: '#00bd7d' }} />
                <Typography variant="h6" fontWeight={700}>
                  Saved Addresses
                </Typography>
              </Box>

              {customer.addresses && customer.addresses.length > 0 ? (
                <Grid container spacing={2}>
                  {customer.addresses.map((address, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          bgcolor: address.isDefault ? '#F0FDF4' : '#FFFFFF'
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip 
                            label={address.type || 'home'} 
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                          {address.isDefault && (
                            <Chip 
                              label="Default" 
                              size="small"
                              sx={{ 
                                bgcolor: '#00bd7d',
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {address.street}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.city}, {address.state} {address.zipCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.country}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No addresses saved
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Orders History Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Order History
              </Typography>

              {orders.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => {
                        const statusColor = getStatusColor(order.status);
                        return (
                          <TableRow key={order._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                #{order.orderNumber || order._id.slice(-8)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {order.items?.length || 0} items
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                ₹{order.totalAmount?.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(order.status)}
                                label={order.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.text,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>
                  No orders yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
