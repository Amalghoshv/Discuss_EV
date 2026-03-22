import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Category as CategoryIcon,
  ElectricCar as ElectricCarIcon,
  ChargingStation as ChargingIcon,
  Build as BuildIcon,
  Article as ArticleIcon,
  Policy as PolicyIcon,
  Star as StarIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { sidebarOpen, mobileMenuOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(!mobileMenuOpen));
    } else {
      dispatch(setSidebarOpen(!sidebarOpen));
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const menuItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
    },
    {
      text: 'Trending',
      icon: <TrendingIcon />,
      path: '/trending',
    },
  ];

  const categories = [
    {
      text: 'Charging Stations',
      icon: <ChargingIcon />,
      path: '/category/charging-stations',
    },
    {
      text: 'Maintenance',
      icon: <BuildIcon />,
      path: '/category/maintenance',
    },
    {
      text: 'Technology',
      icon: <ElectricCarIcon />,
      path: '/category/technology',
    },
    {
      text: 'News',
      icon: <ArticleIcon />,
      path: '/category/news',
    },
    {
      text: 'Policy',
      icon: <PolicyIcon />,
      path: '/category/policy',
    },
    {
      text: 'Reviews',
      icon: <StarIcon />,
      path: '/category/reviews',
    },
    {
      text: 'General',
      icon: <CategoryIcon />,
      path: '/category/general',
    },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Categories
        </Typography>
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          EV Categories
        </Typography>
      </Box>

      <List>
        {categories.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/help')}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>

        {user?.role === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/admin')}>
              <ListItemIcon>
                <SecurityIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Admin Panel" primaryTypographyProps={{ color: 'error', fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={isMobile ? mobileMenuOpen : sidebarOpen}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: isMobile ? 0 : 64, // Account for AppBar height
          height: isMobile ? '100%' : 'calc(100% - 64px)',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
