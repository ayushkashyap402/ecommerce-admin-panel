import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { 
  ShoppingCart, 
  Inventory, 
  People, 
  TrendingUp,
  AttachMoney,
  LocalOffer
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { liveService } from '../../services/liveService';
import { setLiveStats } from '../../store/slices/liveSlice';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="subtitle1" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AdminDashboardPage = ({ adminId, adminInfo }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeCarts: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const liveStats = useSelector((state) => state.live.stats);
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.list); // Track product changes
  
  // Use adminInfo if provided (from AdminViewPage), otherwise use logged-in user
  const displayName = adminInfo?.name || user?.name;
  const isViewingAsAdmin = !!adminId; // True when opened in new tab from SuperAdmin

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    const fetchDashboardData = async () => {
      try {
        const [
          productStats,
          orderStats,
          cartStats,
          liveData,
          lowStock,
          pendingOrders
        ] = await Promise.allSettled([
          productService.getProductStats?.() ?? Promise.resolve({ total: 0 }),
          orderService.getOrderStats?.() ?? Promise.resolve({ total: 0, revenue: 0 }),
          cartService.getCartStats?.() ?? Promise.resolve({ active: 0 }),
          liveService.getLiveStats?.() ?? Promise.resolve({}),
          productService.getLowStockProducts?.() ?? Promise.resolve([]),
          orderService.getPendingOrders?.() ?? Promise.resolve([]),
        ]);

        if (cancelled) return;

        const p = productStats.status === 'fulfilled' ? productStats.value : {};
        const o = orderStats.status === 'fulfilled' ? orderStats.value : {};
        const c = cartStats.status === 'fulfilled' ? cartStats.value : {};
        const low = lowStock.status === 'fulfilled' ? lowStock.value : [];
        const pend = pendingOrders.status === 'fulfilled' ? pendingOrders.value : [];

        setStats({
          totalProducts: p.total ?? p.count ?? 0,
          totalOrders: o.total ?? o.count ?? 0,
          activeCarts: c.active ?? c.count ?? 0,
          totalRevenue: o.revenue ?? 0,
          lowStockProducts: Array.isArray(low) ? low.length : 0,
          pendingOrders: Array.isArray(pend) ? pend.length : 0,
        });

        if (liveData.status === 'fulfilled' && liveData.value) {
          dispatch(setLiveStats(liveData.value));
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load some data. Showing available stats.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    let eventSource;
    try {
      eventSource = liveService.subscribeToLiveUpdates?.( (data) => {
        dispatch(setLiveStats(data));
      });
    } catch (_) {}

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (eventSource?.close) eventSource.close();
    };
  }, [dispatch, products]); // Re-fetch when products change

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        {isViewingAsAdmin ? `${displayName}'s Dashboard` : 'Admin Dashboard'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Welcome back, {displayName}. Here's {isViewingAsAdmin ? 'their' : 'your'} store overview.
      </Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title={isViewingAsAdmin ? "Their Products" : "My Products"}
            value={stats.totalProducts}
            icon={<Inventory />}
            color="#1976d2"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart />}
            color="#388e3c"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Carts"
            value={stats.activeCarts}
            icon={<LocalOffer />}
            color="#f57c00"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="#7b1fa2"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockProducts}
            icon={<TrendingUp />}
            color="#d32f2f"
            trend="Needs attention"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<People />}
            color="#0288d1"
            trend="Action required"
          />
        </Grid>
      </Grid>

      {liveStats && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Live Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h3">
                    {liveStats.activeUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Live Revenue
                  </Typography>
                  <Typography variant="h3">
                    ₹{liveStats.liveRevenue || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};
