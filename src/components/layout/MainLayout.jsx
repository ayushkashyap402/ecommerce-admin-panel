import React from 'react';
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
  MenuItem
} from '@mui/material';
import { 
  Dashboard, 
  Inventory, 
  ShoppingCart, 
  People, 
  Analytics, 
  Logout,
  KeyboardArrowDown,
  AssignmentReturn
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { clearAuthCookie } from '../../services/api';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Products', icon: <Inventory />, path: '/dashboard/products' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/dashboard/orders' },
  { text: 'Returns', icon: <AssignmentReturn />, path: '/dashboard/returns' },
  { text: 'Analytics', icon: <Analytics />, path: '/dashboard/analytics' },
];

const superAdminItems = [
  { text: 'Sellers', icon: <People />, path: '/dashboard/admins' },
  { text: 'Customers', icon: <People />, path: '/dashboard/customers' },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role, username } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    dispatch(logout());
    clearAuthCookie();
    localStorage.removeItem('adminState');
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* Modern AppBar with Search */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, pl: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* OG Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00bd7d 0%, #00a56d 100%)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#FFFFFF',
                letterSpacing: '-0.5px',
                boxShadow: '0 2px 8px rgba(0, 189, 125, 0.3)',
              }}
            >
              OG
            </Box>
            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>
              Dashboard
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{ 
                color: '#6B7280',
                '&:hover': { bgcolor: '#F3F4F6' }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </IconButton>
            <IconButton
              sx={{ 
                color: '#6B7280',
                '&:hover': { bgcolor: '#F3F4F6' }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </IconButton>
            <IconButton
              sx={{ 
                color: '#6B7280',
                '&:hover': { bgcolor: '#F3F4F6' }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </IconButton>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: '#111827',
                '&:hover': { bgcolor: '#F3F4F6' },
                p: 0.5
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: '#00bd7d',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {getInitials(username)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                  {username || 'Admin User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, gap: 1.5, color: '#EF4444' }}>
                <Logout fontSize="small" />
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modern Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid #E5E7EB',
            boxShadow: 'none',
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
          {/* Main Menu Label */}
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              mb: 1,
              color: '#9CA3AF',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem'
            }}
          >
            Main menu
          </Typography>

          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isActive ? '#00bd7d' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#6B7280',
                      px: 2.5,
                      py: 1.5,
                      minHeight: 48,
                      '&:hover': {
                        bgcolor: isActive ? '#00a56d' : '#F3F4F6',
                        color: isActive ? '#FFFFFF' : '#111827',
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'inherit',
                      minWidth: 40,
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.95rem'
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>

            {role === 'superadmin' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    px: 2, 
                    mb: 1,
                    color: '#9CA3AF',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem'
                  }}
                >
                  Management
                </Typography>
                <List sx={{ p: 0 }}>
                  {superAdminItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          bgcolor: isActive ? '#00bd7d' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#6B7280',
                          px: 2.5,
                          py: 1.5,
                          minHeight: 48,
                          '&:hover': {
                            bgcolor: isActive ? '#00a56d' : '#F3F4F6',
                            color: isActive ? '#FFFFFF' : '#111827',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: 'inherit',
                          minWidth: 40,
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.95rem'
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </>
            )}
          </Box>

          {/* User Profile Section at Bottom */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#F9FAFB',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
                transition: 'all 0.2s',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: '#00bd7d',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {getInitials(username)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {username || 'Admin'}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#6B7280',
                    fontSize: '0.75rem'
                  }}
                >
                  {role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#EF4444',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F8F9FA',
        }}
      >
        <Toolbar />
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
        
        {/* Footer */}
        <Box 
          sx={{ 
            mt: 6,
            pt: 3,
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 <Box component="span" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#00bd7d' }}>OutfitGo</Box>. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                cursor: 'pointer',
                '&:hover': { color: '#00bd7d' },
                transition: 'color 0.2s'
              }}
            >
              Privacy Policy
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                cursor: 'pointer',
                '&:hover': { color: '#00bd7d' },
                transition: 'color 0.2s'
              }}
            >
              Terms of Service
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                cursor: 'pointer',
                '&:hover': { color: '#00bd7d' },
                transition: 'color 0.2s'
              }}
            >
              Support
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
