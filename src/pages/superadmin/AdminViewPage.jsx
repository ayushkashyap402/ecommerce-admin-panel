import { useEffect, useState } from 'react';
import { useParams, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Dashboard, 
  Inventory, 
  ShoppingCart, 
  Analytics, 
  Logout,
  KeyboardArrowDown
} from '@mui/icons-material';
import { authService } from '../../services/authService';

// Import admin pages
import * as AdminPages from '../admin';

const drawerWidth = 280;
const drawerCollapsedWidth = 70;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '' },
  { text: 'Products', icon: <Inventory />, path: 'products' },
  { text: 'Orders', icon: <ShoppingCart />, path: 'orders' },
  { text: 'Analytics', icon: <Analytics />, path: 'analytics' },
];

// Layout component for admin view
const AdminViewLayout = ({ adminInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClose = () => {
    window.close();
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  const isActive = (path) => {
    const currentPath = location.pathname.replace(`/admin-view/${adminId}`, '');
    if (path === '' && (currentPath === '' || currentPath === '/')) return true;
    return currentPath.startsWith(`/${path}`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              O
            </Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              OutfitGo Admin
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {getInitials(adminInfo?.name)}
              </Avatar>
              <KeyboardArrowDown sx={{ ml: 0.5 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {adminInfo?.name || 'Admin User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
              <MenuItem onClick={handleClose} sx={{ py: 1.5, gap: 1.5 }}>
                <Logout fontSize="small" />
                <Typography>Close Window</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => setIsDrawerExpanded(true)}
        onMouseLeave={() => setIsDrawerExpanded(false)}
        sx={{
          width: isDrawerExpanded ? drawerWidth : drawerCollapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isDrawerExpanded ? drawerWidth : drawerCollapsedWidth,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '4px 0 10px rgba(0,0,0,0.03)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          overflow: 'hidden', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)'
        }}>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ mt: 1 }}>
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => navigate(`/admin-view/${adminId}/${item.path}`)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: active ? 'rgba(0, 189, 125, 0.1)' : 'transparent',
                      color: active ? '#00bd7d' : 'text.primary',
                      justifyContent: isDrawerExpanded ? 'initial' : 'center',
                      px: isDrawerExpanded ? 2 : 1.5,
                      '&:hover': {
                        bgcolor: active ? 'rgba(0, 189, 125, 0.15)' : 'rgba(0,0,0,0.04)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: active ? '#00bd7d' : 'text.secondary',
                      minWidth: isDrawerExpanded ? 40 : 'auto',
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {isDrawerExpanded && (
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: active ? 600 : 500,
                          fontSize: '0.95rem'
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          {/* Close Button at Bottom */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <ListItemButton
              onClick={handleClose}
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(244, 67, 54, 0.08)',
                color: '#f44336',
                justifyContent: isDrawerExpanded ? 'initial' : 'center',
                px: isDrawerExpanded ? 2 : 1.5,
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.15)',
                },
                transition: 'all 0.2s',
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ 
                color: '#f44336',
                minWidth: isDrawerExpanded ? 40 : 'auto',
                justifyContent: 'center',
              }}>
                <Logout />
              </ListItemIcon>
              {isDrawerExpanded && (
                <ListItemText 
                  primary="Close"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}
                />
              )}
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isDrawerExpanded ? drawerWidth : drawerCollapsedWidth}px)` },
          minHeight: '100vh',
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

// Main AdminViewPage component
export const AdminViewPage = () => {
  const { adminId } = useParams();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        const adminsData = await authService.getAdmins();
        const admins = adminsData.admins || adminsData;
        const admin = admins.find(a => a._id === adminId);
        if (!admin) {
          setError('Admin not found');
        } else {
          setAdminInfo(admin);
        }
      } catch (err) {
        setError('Failed to load admin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (adminId) {
      fetchAdminInfo();
    }
  }, [adminId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Routes>
      <Route element={<AdminViewLayout adminInfo={adminInfo} />}>
        <Route index element={<AdminPages.DashboardPage adminId={adminId} adminInfo={adminInfo} />} />
        <Route path="products" element={<AdminPages.ProductsPage adminId={adminId} adminInfo={adminInfo} />} />
        <Route path="orders" element={<AdminPages.OrdersPage adminId={adminId} adminInfo={adminInfo} />} />
        <Route path="analytics" element={<AdminPages.AnalyticsPage adminId={adminId} adminInfo={adminInfo} />} />
        <Route path="*" element={<Navigate to={`/admin-view/${adminId}`} replace />} />
      </Route>
    </Routes>
  );
};
