import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  InputBase,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Menu as MenuIcon,
  ElectricCar as ElectricCarIcon,
  Logout,
  Person,
  Settings,
  Add as AddIcon,
  DoneAll as DoneAllIcon,
  FiberManualRecord as UnreadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { setMobileMenuOpen } from '../../store/slices/uiSlice';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../store/slices/notificationSlice';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notifications, unreadCount = 0 } = useSelector((state) => state.notifications);
  const { mobileMenuOpen } = useSelector((state) => state.ui);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotifMenuOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
    dispatch(fetchNotifications({ limit: 5 }));
  };
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
    handleNotifMenuClose();
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markNotificationAsRead(notif.id));
    }
    handleNotifMenuClose();
    // Navigate based on notification type if needed
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="glass-panel"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
        top: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (isAuthenticated) && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: { xs: 1, md: 4 },
            }}
            onClick={() => navigate('/')}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
              color: '#fff',
              mr: 1.5,
              boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)'
            }}>
              <ElectricCarIcon />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              DiscussEV
            </Typography>
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: '12px',
            backgroundColor: theme.palette.mode === 'light' ? '#f1f5f9' : '#334155',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'light' ? '#e2e8f0' : '#475569',
            },
            width: '100%',
            maxWidth: { xs: '150px', sm: '300px', md: '450px' },
            mx: 2,
            transition: 'all 0.2s',
          }}
        >
          <Box sx={{
            padding: '0 12px',
            height: '100%',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center'
          }}>
            <SearchIcon fontSize="small" color="action" />
          </Box>
          <InputBase
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              '& .MuiInputBase-input': {
                padding: '8px 12px 8px 40px',
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
          {isAuthenticated ? (
            <>
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-post')}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    boxShadow: '0 4px 10px rgba(46, 125, 50, 0.2)'
                  }}
                >
                  Post
                </Button>
              )}

              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleNotifMenuOpen}>
                  <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 5,
                  sx: { borderRadius: 3, mt: 1.5, width: 320, maxHeight: 400 }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Button
                      size="small"
                      startIcon={<DoneAllIcon />}
                      onClick={handleMarkAllRead}
                      sx={{ textTransform: 'none' }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </Box>
                <Divider />
                {notifications.length > 0 ? (
                  <List sx={{ py: 0 }}>
                    {notifications.slice(0, 5).map((notif) => (
                      <ListItem
                        key={notif.id}
                        button
                        onClick={() => handleNotifClick(notif)}
                        sx={{
                          bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={notif.sender?.avatar}>{notif.sender?.firstName?.[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notif.message}
                          secondary={new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: notif.isRead ? 400 : 700 }}
                        />
                        {!notif.isRead && <UnreadIcon sx={{ fontSize: 10, color: 'primary.main', ml: 1 }} />}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
                  </Box>
                )}
              </Menu>

              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  {user?.firstName?.[0]}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 5,
                  sx: { borderRadius: 3, mt: 1.5, minWidth: 180 }
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Person sx={{ mr: 1.5, fontSize: 20 }} color="action" />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                  <Settings sx={{ mr: 1.5, fontSize: 20 }} color="action" />
                  Settings
                </MenuItem>
                <Box sx={{ my: 1, borderTop: `1px solid ${theme.palette.divider}` }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => navigate('/login')}>Login</Button>
              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{ borderRadius: '20px' }}
                >
                  Join
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
