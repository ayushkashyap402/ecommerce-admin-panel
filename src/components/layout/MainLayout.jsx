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

const drawerWidth = 280;
const drawerCollapsedWidth = 70;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Products', icon: <Inventory />, path: '/products' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
  { text: 'Returns', icon: <AssignmentReturn />, path: '/returns' },
  { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
];

const superAdminItems = [
  { text: 'Admins', icon: <People />, path: '/admins' },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role, username } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Modern AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                {getInitials(username)}
              </Avatar>
              <KeyboardArrowDown sx={{ ml: 0.5 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {username || 'Admin User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, gap: 1.5 }}>
                <Logout fontSize="small" />
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Sidebar */}
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
          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ mt: 1 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      color: isActive ? '#667eea' : 'text.primary',
                      justifyContent: isDrawerExpanded ? 'initial' : 'center',
                      px: isDrawerExpanded ? 2 : 1.5,
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0,0,0,0.04)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive ? '#667eea' : 'text.secondary',
                      minWidth: isDrawerExpanded ? 40 : 'auto',
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {isDrawerExpanded && (
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.95rem'
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>

            {role === 'superadmin' && (
              <>
                <Divider sx={{ my: 2 }} />
                {isDrawerExpanded && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 2, 
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}
                  >
                    Administration
                  </Typography>
                )}
                <List sx={{ mt: 1 }}>
                  {superAdminItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <ListItemButton
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          bgcolor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          color: isActive ? '#667eea' : 'text.primary',
                          justifyContent: isDrawerExpanded ? 'initial' : 'center',
                          px: isDrawerExpanded ? 2 : 1.5,
                          '&:hover': {
                            bgcolor: isActive ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0,0,0,0.04)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: isActive ? '#667eea' : 'text.secondary',
                          minWidth: isDrawerExpanded ? 40 : 'auto',
                          justifyContent: 'center',
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        {isDrawerExpanded && (
                          <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '0.95rem'
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </>
            )}
          </Box>

          {/* Logout Button at Bottom */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <ListItemButton
              onClick={handleLogout}
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
                  primary="Logout"
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
