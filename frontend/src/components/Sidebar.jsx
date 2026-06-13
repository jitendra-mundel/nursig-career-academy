import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Description,
  Quiz,
  Settings,
  People,
  FileUpload,
  Assessment,
  Person,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar Component
 * Navigation sidebar for authenticated users
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 250;

  const userMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/user/dashboard' },
    { label: 'Profile', icon: <Person />, path: '/user/profile' },
    { label: 'My Notes', icon: <Description />, path: '/user/notes' },
    { label: 'Available Tests', icon: <Quiz />, path: '/user/tests' },
    { label: 'My Results', icon: <Assessment />, path: '/user/results' },
    { label: 'Settings', icon: <Settings />, path: '/user/settings' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { label: 'Profile', icon: <Person />, path: '/admin/profile' },
    { label: 'Upload Notes', icon: <FileUpload />, path: '/admin/upload-notes' },
    { label: 'Manage Notes', icon: <Description />, path: '/admin/notes' },
    { label: 'Manage Tests', icon: <Quiz />, path: '/admin/tests' },
    { label: 'Manage Users', icon: <People />, path: '/admin/users' },
    { label: 'View Results', icon: <Assessment />, path: '/admin/results' },
    { label: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', px: 1, pt: 2 }}>
      <Box sx={{ px: 2, py: 1, mb: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)' }}>
        <Typography variant="subtitle2" sx={{ color: 'secondary.main', fontWeight: 700 }}>
          {user?.role === 'admin' ? 'Admin Panel' : 'User Hub'}
        </Typography>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(124, 58, 237, 0.18)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'secondary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} sx={{ color: '#e2e8f0' }} />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Tooltip title="Open menu">
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            position: 'fixed',
            top: { xs: 64, sm: 72 },
            left: 12,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: 'rgba(15, 23, 42, 0.90)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 18px 40px rgba(7, 19, 50, 0.24)',
            '&:hover': {
              bgcolor: 'rgba(15, 23, 42, 0.98)',
            },
          }}
          aria-label="open sidebar"
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: { xs: 7, sm: 8 },
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            color: '#e2e8f0',
            borderRight: '1px solid rgba(255,255,255,0.10)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: 8,
            height: 'calc(100% - 64px)',
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            color: '#e2e8f0',
            borderRight: '1px solid rgba(255,255,255,0.10)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
