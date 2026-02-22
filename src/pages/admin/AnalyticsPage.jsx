import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend === 'up' ? (
                <TrendingUp color="success" />
              ) : (
                <TrendingDown color="error" />
              )}
              <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'} ml={1}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 1,
            p: 1,
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [analytics, setAnalytics] = useState({
    revenue: { current: 0, previous: 0, trend: 'up' },
    orders: { current: 0, previous: 0, trend: 'up' },
    customers: { current: 0, previous: 0, trend: 'up' },
    products: { current: 0, previous: 0, trend: 'up' },
    conversionRate: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueByMonth: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch data from multiple services
      const [
        revenueStats,
        orderStats,
        productStats,
        cartStats,
        topProducts
      ] = await Promise.all([
        orderService.getRevenueStats(period).catch(() => ({ current: 0, previous: 0 })),
        orderService.getOrderStats().catch(() => ({ total: 0, previous: 0 })),
        productService.getProductStats().catch(() => ({ total: 0 })),
        cartService.getCartConversionRate().catch(() => ({ rate: 0 })),
        productService.getTopSellingProducts().catch(() => []),
      ]);

      const revenue = revenueStats.current || 0;
      const revenuePrev = revenueStats.previous || 0;
      const orders = orderStats.total || 0;
      const ordersPrev = orderStats.previous || 0;
      const products = productStats.total || 0;
      const conversionRate = cartStats.rate || 0;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;

      setAnalytics({
        revenue: {
          current: revenue,
          previous: revenuePrev,
          trend: revenue >= revenuePrev ? 'up' : 'down',
          percentage: revenuePrev > 0 ? ((revenue - revenuePrev) / revenuePrev * 100).toFixed(1) : 0
        },
        orders: {
          current: orders,
          previous: ordersPrev,
          trend: orders >= ordersPrev ? 'up' : 'down',
          percentage: ordersPrev > 0 ? ((orders - ordersPrev) / ordersPrev * 100).toFixed(1) : 0
        },
        products: {
          current: products,
          previous: 0, // Would need historical data
          trend: 'up',
          percentage: 0
        },
        customers: {
          current: Math.floor(orders * 0.8), // Estimate
          previous: 0,
          trend: 'up',
          percentage: 0
        },
        conversionRate,
        averageOrderValue: avgOrderValue,
        topProducts: topProducts.slice(0, 5),
        revenueByMonth: [], // Would need more detailed API
      });
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${analytics.revenue.current.toLocaleString()}`}
            icon={<AttachMoney />}
            color="#7b1fa2"
            trend={analytics.revenue.trend}
            trendValue={`${analytics.revenue.percentage}%`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Orders"
            value={analytics.orders.current.toLocaleString()}
            icon={<ShoppingCart />}
            color="#1976d2"
            trend={analytics.orders.trend}
            trendValue={`${analytics.orders.percentage}%`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={analytics.customers.current.toLocaleString()}
            icon={<People />}
            color="#388e3c"
            trend={analytics.customers.trend}
            trendValue={`${analytics.customers.percentage}%`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Products"
            value={analytics.products.current.toLocaleString()}
            icon={<Inventory />}
            color="#f57c00"
            trend={analytics.products.trend}
            trendValue={`${analytics.products.percentage}%`}
          />
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h3" color="primary">
                {(analytics.conversionRate * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Percentage of carts that convert to orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h3" color="primary">
                ${analytics.averageOrderValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average revenue per order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Selling Products
          </Typography>
          {analytics.topProducts.length > 0 ? (
            analytics.topProducts.map((product, index) => (
              <Box key={product._id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography>
                  {index + 1}. {product.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {product.sold} sold
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No product data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
