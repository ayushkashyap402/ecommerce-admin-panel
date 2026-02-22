import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  HighlightOff as RejectedIcon,
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';

const RETURN_STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  pickup_scheduled: { label: 'Pickup Scheduled', color: 'info' },
  picked_up: { label: 'Picked Up', color: 'secondary' },
  received: { label: 'Received', color: 'primary' },
  inspected: { label: 'Inspected', color: 'info' },
  refund_initiated: { label: 'Refund Initiated', color: 'success' },
  refund_completed: { label: 'Refund Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

const STATUS_TRANSITIONS = {
  requested: ['approved', 'rejected'],
  approved: ['pickup_scheduled'],
  pickup_scheduled: ['picked_up'],
  picked_up: ['received'],
  received: ['inspected'],
  inspected: ['refund_initiated', 'rejected'],
  refund_initiated: ['refund_completed'],
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAdminReturns();
      setReturns(response.returns || []);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await orderService.getReturnStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = (returnData) => {
    setSelectedReturn(returnData);
    setDetailsOpen(true);
  };

  const handleStatusUpdate = (returnData) => {
    setSelectedReturn(returnData);
    setNewStatus('');
    setAdminNotes('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    try {
      setUpdating(true);
      await orderService.updateReturnStatus(selectedReturn.returnId, {
        status: newStatus,
        notes: adminNotes,
      });
      
      setStatusDialogOpen(false);
      setDetailsOpen(false);
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update return status');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      field: 'returnId',
      headerName: 'Return ID',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'returnReasonText',
      headerName: 'Reason',
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'refundAmount',
      headerName: 'Refund Amount',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" color="success.main">
          ₹{params.value?.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => {
        const config = RETURN_STATUS_CONFIG[params.value] || { label: params.value, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Requested Date',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewDetails(params.row)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          {STATUS_TRANSITIONS[params.row.status] && (
            <IconButton
              size="small"
              color="success"
              onClick={() => handleStatusUpdate(params.row)}
            >
              {params.row.status === 'requested' ? <ApproveIcon fontSize="small" /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Returns Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchReturns();
            fetchStats();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="700">
                        {stats.totalReturns}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Returns
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="700">
                        {stats.pendingReturns}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending
                      </Typography>
                    </Box>
                    <PendingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="700">
                        {stats.completedReturns}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completed
                      </Typography>
                    </Box>
                    <CompletedIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="700">
                        ₹{stats.totalRefundAmount?.toFixed(0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Refunded
                      </Typography>
                    </Box>
                    <RejectedIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
      )}

      {/* Returns Table */}
      <Fade in timeout={500}>
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={returns}
            columns={columns}
            getRowId={(row) => row.returnId}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
              },
            }}
          />
        </Paper>
      </Fade>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          Return Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReturn && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Return ID
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedReturn.returnId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedReturn.orderId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={RETURN_STATUS_CONFIG[selectedReturn.status]?.label || selectedReturn.status}
                  color={RETURN_STATUS_CONFIG[selectedReturn.status]?.color || 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Refund Amount
                </Typography>
                <Typography variant="body1" fontWeight="600" color="success.main">
                  ₹{selectedReturn.refundAmount?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Return Reason
                </Typography>
                <Typography variant="body1">
                  {selectedReturn.returnReasonText}
                </Typography>
              </Grid>
              {selectedReturn.additionalComments && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Comments
                  </Typography>
                  <Typography variant="body1">
                    {selectedReturn.additionalComments}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Items
                </Typography>
                {selectedReturn.items?.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qty: {item.quantity} × ₹{item.price}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
              {selectedReturn.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Admin Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedReturn.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReturn && STATUS_TRANSITIONS[selectedReturn.status] && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setDetailsOpen(false);
                handleStatusUpdate(selectedReturn);
              }}
            >
              Update Status
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Return Status</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            {selectedReturn &&
              STATUS_TRANSITIONS[selectedReturn.status]?.map((status) => (
                <MenuItem key={status} value={status}>
                  {RETURN_STATUS_CONFIG[status]?.label || status}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Admin Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this status update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={!newStatus || updating}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
