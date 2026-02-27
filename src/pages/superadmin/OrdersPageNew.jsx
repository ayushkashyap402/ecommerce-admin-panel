import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert
} from '@mui/material';
import {
  Search,
  Refresh,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Visibility,
  AutoDelete
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';

const statusColors = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  processing: { bg: '#E0E7FF', text: '#3730A3' },
  shipped: { bg: '#E9D5FF', text: '#6B21A8' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' }
};

const statusIcons = {
  pending: HourglassEmpty,
  confirmed: CheckCircle,
  processing: LocalShipping,
  shipped: LocalShipping,
  delivered: CheckCircle,
  cancelled: Cancel
};

export const OrdersPageNew = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [autoCancelLoading, setAutoCancelLoading] = useState(false);
  const [autoCancelResult, setAutoCancelResult] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAllOrders();
    fetchOrderStats();
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const data = await orderService.getOrderStats();
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await orderService.updateOrderStatus(selectedOrder.orderId, newStatus);
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      fetchAllOrders();
      fetchOrderStats();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleAutoCancellation = async () => {
    setAutoCancelLoading(true);
    setAutoCancelResult(null);
    try {
      const result = await orderService.triggerAutoCancellation();
      setAutoCancelResult(result);
      if (result.cancelled > 0) {
        fetchAllOrders();
        fetchOrderStats();
      }
    } catch (err) {
      console.error('Auto-cancellation error:', err);
      setAutoCancelResult({
        success: false,
        message: err.message || 'Failed to trigger auto-cancellation'
      });
    } finally {
      setAutoCancelLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.deliveryAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.deliveryAddress?.phone?.includes(searchQuery)
  );

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#111827', mb: 0.5 }}>
            Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all customer orders
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={autoCancelLoading ? <CircularProgress size={20} /> : <AutoDelete />}
            onClick={handleAutoCancellation}
            disabled={autoCancelLoading}
            sx={{
              borderColor: '#F59E0B',
              color: '#F59E0B',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#D97706',
                bgcolor: '#FEF3C7'
              }
            }}
          >
            {autoCancelLoading ? 'Processing...' : 'Auto-Cancel Overdue'}
          </Button>
          <IconButton
            onClick={() => {
              fetchAllOrders();
              fetchOrderStats();
            }}
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
      </Box>

      {/* Auto-cancel Result Alert */}
      {autoCancelResult && (
        <Alert
          severity={autoCancelResult.success ? 'success' : 'error'}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setAutoCancelResult(null)}
        >
          {autoCancelResult.message}
          {autoCancelResult.cancelled > 0 && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Cancelled orders: {autoCancelResult.orders?.join(', ')}
            </Typography>
          )}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>
                    {stats.total}
                  </Typography>
                </Box>
                <ShoppingCart sx={{ color: '#6B7280', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Pending
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#F59E0B' }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <HourglassEmpty sx={{ color: '#F59E0B', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Processing
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#3B82F6' }}>
                    {stats.processing}
                  </Typography>
                </Box>
                <LocalShipping sx={{ color: '#3B82F6', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Shipped
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#8B5CF6' }}>
                    {stats.shipped}
                  </Typography>
                </Box>
                <LocalShipping sx={{ color: '#8B5CF6', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Delivered
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#10B981' }}>
                    {stats.delivered}
                  </Typography>
                </Box>
                <CheckCircle sx={{ color: '#10B981', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Cancelled
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#EF4444' }}>
                    {stats.cancelled}
                  </Typography>
                </Box>
                <Cancel sx={{ color: '#EF4444', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search orders by ID, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
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
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Seller</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }} align="center">Items</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Payment</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order) => {
                        const StatusIcon = statusIcons[order.status] || HourglassEmpty;
                        // Get unique sellers from order items
                        const sellers = order.items?.reduce((acc, item) => {
                          if (item.productCreatedBy && !acc.find(s => s.id === item.productCreatedBy)) {
                            acc.push({
                              id: item.productCreatedBy,
                              name: item.productCreatedByName || 'Unknown',
                              role: item.productCreatedByRole || 'admin'
                            });
                          }
                          return acc;
                        }, []) || [];
                        
                        return (
                          <TableRow key={order._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} sx={{ color: '#111827' }}>
                                {order.orderId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {order.deliveryAddress?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.deliveryAddress?.phone || ''}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {sellers.length > 0 ? (
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                  {sellers.slice(0, 2).map((seller, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={0.5}>
                                      <Avatar
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          fontSize: '0.65rem',
                                          bgcolor: seller.role === 'superadmin' ? '#EF4444' : '#00bd7d',
                                          fontWeight: 600
                                        }}
                                      >
                                        {seller.name.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                        {seller.name}
                                      </Typography>
                                    </Box>
                                  ))}
                                  {sellers.length > 2 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      +{sellers.length - 2} more
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={order.items?.length || 0}
                                size="small"
                                sx={{
                                  backgroundColor: '#E0E7FF',
                                  color: '#3730A3',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} sx={{ color: '#00bd7d' }}>
                                ₹{order.pricing?.total || order.total || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="caption" display="block" textTransform="uppercase" fontWeight={600}>
                                  {order.payment?.method || 'N/A'}
                                </Typography>
                                <Chip
                                  label={order.payment?.status || 'pending'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    backgroundColor: order.payment?.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                                    color: order.payment?.status === 'completed' ? '#065F46' : '#92400E',
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 16 }} />}
                                label={order.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusColors[order.status]?.bg || '#F3F4F6',
                                  color: statusColors[order.status]?.text || '#6B7280',
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDetailDialogOpen(true);
                                }}
                                sx={{ color: '#00bd7d', mr: 1 }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                  setStatusDialogOpen(true);
                                }}
                                sx={{
                                  borderColor: '#E5E7EB',
                                  color: '#6B7280',
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  '&:hover': {
                                    borderColor: '#00bd7d',
                                    color: '#00bd7d'
                                  }
                                }}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            No orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredOrders.length}
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

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Order Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Order ID</Typography>
                <Typography variant="h6" fontWeight={600}>{selectedOrder.orderId}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1">{selectedOrder.deliveryAddress?.name}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedOrder.deliveryAddress?.phone}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Delivery Address</Typography>
                <Typography variant="body1">
                  {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" sx={{ color: '#00bd7d' }}>
                  ₹{selectedOrder.pricing?.total || selectedOrder.total}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                <Typography variant="body1" textTransform="uppercase">
                  {selectedOrder.payment?.method}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedOrder.payment?.status}
                    size="small"
                    sx={{
                      backgroundColor: selectedOrder.payment?.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                      color: selectedOrder.payment?.status === 'completed' ? '#065F46' : '#92400E',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Order Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedOrder.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[selectedOrder.status]?.bg,
                      color: statusColors[selectedOrder.status]?.text,
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Items ({selectedOrder.items?.length})
                </Typography>
                <Box>
                  {selectedOrder.items?.map((item, index) => (
                    <Card
                      key={index}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        boxShadow: 'none'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" gap={2}>
                          {/* Product Image */}
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              bgcolor: '#F3F4F6',
                              overflow: 'hidden',
                              flexShrink: 0
                            }}
                          >
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                              >
                                <Typography variant="caption" color="text.secondary">
                                  No Image
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Product Details */}
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Quantity: {item.quantity} × ₹{item.price}
                            </Typography>
                            
                            {/* Seller Info */}
                            {item.productCreatedByName && (
                              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                <Avatar
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: item.productCreatedByRole === 'superadmin' ? '#EF4444' : '#00bd7d',
                                    fontWeight: 600
                                  }}
                                >
                                  {item.productCreatedByName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#6B7280' }}>
                                  {item.productCreatedByRole === 'superadmin' ? '👑 Super Admin' : `🏪 ${item.productCreatedByName}`}
                                </Typography>
                              </Box>
                            )}

                            {/* Product Category & Stock */}
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {item.productCategory && (
                                <Chip
                                  label={item.productCategory}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: '#F3F4F6',
                                    color: '#6B7280'
                                  }}
                                />
                              )}
                              {item.productStock !== undefined && (
                                <Chip
                                  label={`Stock: ${item.productStock}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: item.productStock < 10 ? '#FEF3C7' : '#E0E7FF',
                                    color: item.productStock < 10 ? '#92400E' : '#3730A3'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Item Total */}
                          <Box textAlign="right">
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#00bd7d' }}>
                              ₹{item.price * item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Order Summary */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F9FAFB',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{selectedOrder.pricing?.subtotal || selectedOrder.total || 0}
                    </Typography>
                  </Box>
                  {selectedOrder.pricing?.discount > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Discount</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#10B981' }}>
                        -₹{selectedOrder.pricing.discount}
                      </Typography>
                    </Box>
                  )}
                  {selectedOrder.pricing?.deliveryCharge > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Delivery Charge</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{selectedOrder.pricing.deliveryCharge}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    pt={1}
                    mt={1}
                    borderTop="1px solid #E5E7EB"
                  >
                    <Typography variant="body1" fontWeight={700}>Total Amount</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#00bd7d' }}>
                      ₹{selectedOrder.pricing?.total || selectedOrder.total || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: '#6B7280' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Update Order Status
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedOrder && (
            <Box>
              <Typography variant="caption" color="text.secondary">Order ID</Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                {selectedOrder.orderId}
              </Typography>

              <Typography variant="caption" color="text.secondary">Customer</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedOrder.deliveryAddress?.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">Current Status</Typography>
              <Box mb={3} mt={0.5}>
                <Chip
                  label={selectedOrder.status}
                  size="small"
                  sx={{
                    backgroundColor: statusColors[selectedOrder.status]?.bg,
                    color: statusColors[selectedOrder.status]?.text,
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
              </Box>

              <TextField
                fullWidth
                select
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#00bd7d',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#00bd7d',
                  },
                }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus || newStatus === selectedOrder?.status}
            sx={{
              bgcolor: '#00bd7d',
              '&:hover': { bgcolor: '#00a56d' }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
