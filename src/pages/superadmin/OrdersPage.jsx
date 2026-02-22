import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, Card, CardContent, Paper, IconButton, Tooltip, Fade, Zoom } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { orderService } from '../../services/orderService';
import { ShoppingCart, LocalShipping, CheckCircle, Cancel, HourglassEmpty, Refresh, AutoDelete, TrendingUp, Person, Payment } from '@mui/icons-material'
const statusColors = { pending: '#ff9800', confirmed: '#2196f3', processing: '#2196f3', shipped: '#9c27b0', delivered: '#4caf50', cancelled: '#f44336' };

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [autoCancelLoading, setAutoCancelLoading] = useState(false);
  const [autoCancelResult, setAutoCancelResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });

  useEffect(() => {
    console.log('ðŸŽ¯ SuperAdmin OrdersPage mounted');
    fetchAllOrders();
    fetchOrderStats();
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('ðŸ“ž Calling getAllOrders API...');
      const response = await orderService.getAllOrders();
      console.log('âœ… API Response:', response);
      console.log('ðŸ“¦ Orders:', response.orders);
      setOrders(response.orders || []);
    } catch (err) {
      console.error('âŒ Error fetching orders:', err);
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
      setAutoCancelResult({ success: false, message: err.message || 'Failed to trigger auto-cancellation' });
    } finally {
      setAutoCancelLoading(false);
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const columns = [
    { field: 'orderId', headerName: 'Order ID', width: 200, renderCell: (params) => <Typography variant="body2" fontWeight="500">{params.row?.orderId || 'N/A'}</Typography> },
    { field: 'customer', headerName: 'Customer', width: 180, renderCell: (params) => <Box><Typography variant="body2" fontWeight="500">{params.row?.deliveryAddress?.name || 'N/A'}</Typography><Typography variant="caption" color="textSecondary">{params.row?.deliveryAddress?.phone || ''}</Typography></Box> },
    { field: 'items', headerName: 'Items', width: 80, align: 'center', renderCell: (params) => <Chip label={params.row?.items?.length || 0} size="small" color="primary" variant="outlined" /> },
    { field: 'total', headerName: 'Total Amount', width: 130, renderCell: (params) => <Typography variant="body2" fontWeight="600" color="primary">â‚¹{params.row?.pricing?.total || params.row?.total || 0}</Typography> },
    { field: 'payment', headerName: 'Payment', width: 120, renderCell: (params) => <Box><Typography variant="caption" display="block" textTransform="uppercase">{params.row?.payment?.method || 'N/A'}</Typography><Chip label={params.row?.payment?.status || 'pending'} size="small" sx={{ fontSize: '0.7rem', height: '18px', backgroundColor: params.row?.payment?.status === 'completed' ? '#4caf50' : '#ff9800', color: 'white' }} /></Box> },
    { field: 'status', headerName: 'Order Status', width: 140, renderCell: (params) => <Chip label={params.value || 'pending'} size="small" sx={{ backgroundColor: statusColors[params.value] || '#666', color: 'white', fontWeight: 500, textTransform: 'capitalize' }} /> },
    { field: 'createdAt', headerName: 'Order Date', width: 150, renderCell: (params) => <Box><Typography variant="body2">{new Date(params.value).toLocaleDateString('en-IN')}</Typography><Typography variant="caption" color="textSecondary">{new Date(params.value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Typography></Box> },
    { field: 'actions', headerName: 'Actions', width: 150, sortable: false, renderCell: (params) => <Button size="small" variant="contained" color="primary" onClick={() => openStatusDialog(params.row)} sx={{ textTransform: 'none' }}>Update Status</Button> },
  ];

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Orders Management (SuperAdmin)</Typography>
        <Button variant="outlined" color="warning" onClick={handleAutoCancellation} disabled={autoCancelLoading} startIcon={autoCancelLoading ? <CircularProgress size={20} /> : null}>{autoCancelLoading ? 'Processing...' : 'Auto-Cancel Overdue Orders'}</Button>
      </Box>
      {autoCancelResult && <Alert severity={autoCancelResult.success ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setAutoCancelResult(null)}>{autoCancelResult.message}{autoCancelResult.cancelled > 0 && <Typography variant="caption" display="block" sx={{ mt: 1 }}>Cancelled orders: {autoCancelResult.orders?.join(', ')}</Typography>}</Alert>}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6">{stats.total}</Typography><Typography variant="body2" color="textSecondary">Total</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6" sx={{ color: statusColors.pending }}>{stats.pending}</Typography><Typography variant="body2" color="textSecondary">Pending</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6" sx={{ color: statusColors.processing }}>{stats.processing}</Typography><Typography variant="body2" color="textSecondary">Processing</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6" sx={{ color: statusColors.shipped }}>{stats.shipped}</Typography><Typography variant="body2" color="textSecondary">Shipped</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6" sx={{ color: statusColors.delivered }}>{stats.delivered}</Typography><Typography variant="body2" color="textSecondary">Delivered</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={4} md={2}><Card><CardContent><Typography variant="h6" sx={{ color: statusColors.cancelled }}>{stats.cancelled}</Typography><Typography variant="body2" color="textSecondary">Cancelled</Typography></CardContent></Card></Grid>
      </Grid>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={Array.isArray(orders) ? orders.map((o) => ({ ...o, id: o._id || o.orderId || Math.random() })) : []} columns={columns} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] } }} disableRowSelectionOnClick sx={{ '& .MuiDataGrid-cell': { padding: '8px' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', fontWeight: 600 } }} />
      </Box>
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && <Box sx={{ pt: 1 }}><Typography variant="body2" color="textSecondary" gutterBottom>Order ID</Typography><Typography variant="h6" gutterBottom>{selectedOrder?.orderId}</Typography><Typography variant="body2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>Customer</Typography><Typography variant="body1" gutterBottom>{selectedOrder?.deliveryAddress?.name}</Typography><Typography variant="body2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>Current Status</Typography><Chip label={selectedOrder?.status} size="small" sx={{ backgroundColor: statusColors[selectedOrder?.status] || '#666', color: 'white', textTransform: 'capitalize', mb: 2 }} /><TextField fullWidth select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} margin="normal" sx={{ mt: 2 }}><MenuItem value="pending">Pending</MenuItem><MenuItem value="confirmed">Confirmed</MenuItem><MenuItem value="processing">Processing</MenuItem><MenuItem value="shipped">Shipped</MenuItem><MenuItem value="delivered">Delivered</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem></TextField></Box>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setStatusDialogOpen(false)} color="inherit">Cancel</Button><Button onClick={handleStatusUpdate} variant="contained" color="primary" disabled={!newStatus || newStatus === selectedOrder?.status}>Update Status</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

