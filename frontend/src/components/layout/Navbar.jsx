import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Badge, Box, InputBase, useTheme, useMediaQuery, Avatar, Tooltip,
  List, ListItem, ListItemText, ListItemAvatar, Divider, Paper, Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ElectricCar as ElectricCarIcon,
  Logout, Person, Settings, Add as AddIcon,
  DoneAll as DoneAllIcon,
  FiberManualRecord as UnreadIcon,
  Close as CloseIcon,
  NotificationsNone,
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
  KeyboardCommandKey,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { setMobileMenuOpen, openDialog } from '../../store/slices/uiSlice';
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../store/slices/notificationSlice';

/* ── helpers ── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const groupNotifications = (list) => {
  const today = [], earlier = [];
  const now = Date.now();
  list.forEach((n) => {
    const diff = now - new Date(n.createdAt).getTime();
    (diff < 86400000 ? today : earlier).push(n);
  });
  return { today, earlier };
};

/* ── Notification popover ── */
const NotifPopover = ({ anchorEl, onClose, notifications, unreadCount, onMarkAll, onNotifClick, isLight, GREEN, GREEN_LIGHT }) => {
  const open = Boolean(anchorEl);
  const { today, earlier } = groupNotifications(notifications.slice(0, 10));
  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';

  const NotifItem = ({ notif }) => (
    <Box
      onClick={() => onNotifClick(notif)}
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.25,
        cursor: 'pointer',
        bgcolor: notif.isRead ? 'transparent' : isLight ? '#F0F7F0' : 'rgba(67,160,71,0.07)',
        borderLeft: notif.isRead ? '3px solid transparent' : `3px solid ${GREEN_LIGHT}`,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: isLight ? '#F5FAF5' : 'rgba(255,255,255,0.04)' },
      }}
    >
      <Avatar
        src={notif.fromUser?.avatar}
        sx={{
          width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0,
          bgcolor: GREEN,
          border: `2px solid ${notif.isRead ? 'transparent' : GREEN_LIGHT}`,
          mt: 0.25,
        }}
      >
        {notif.fromUser?.firstName?.[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: notif.isRead ? 400 : 600, lineHeight: 1.4, color: isLight ? '#1a1a1a' : '#e0e0e0' }}>
          {notif.message}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: isLight ? '#888' : '#666', mt: 0.25 }}>
          {timeAgo(notif.createdAt)}
        </Typography>
      </Box>
      {!notif.isRead && (
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GREEN_LIGHT, flexShrink: 0, mt: 0.75 }} />
      )}
    </Box>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '14px',
          mt: 1.5,
          width: 340,
          maxHeight: 480,
          border: `1px solid ${border}`,
          boxShadow: isLight
            ? '0 8px 32px rgba(0,0,0,0.12)'
            : '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Box sx={{ bgcolor: GREEN_LIGHT, color: '#fff', borderRadius: '10px', px: 0.9, py: 0.1, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.6 }}>
              {unreadCount}
            </Box>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={onMarkAll}
            startIcon={<DoneAllIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ fontSize: '0.72rem', textTransform: 'none', color: GREEN_LIGHT, p: 0.5, minWidth: 0, fontWeight: 600 }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: border, borderRadius: 2 } }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 40, color: isLight ? '#ccc' : '#333', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>You're all caught up!</Typography>
          </Box>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <Typography sx={{ px: 2.5, pt: 1.5, pb: 0.5, fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>Today</Typography>
                {today.map((n) => <NotifItem key={n.id} notif={n} />)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <Typography sx={{ px: 2.5, pt: 1.5, pb: 0.5, fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>Earlier</Typography>
                {earlier.map((n) => <NotifItem key={n.id} notif={n} />)}
              </>
            )}
          </>
        )}
      </Box>
    </Menu>
  );
};

/* ══════════════════════════════════════════
   MAIN NAVBAR
══════════════════════════════════════════ */
const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLight = theme.palette.mode === 'light';

  const GREEN = '#2E7D32';
  const GREEN_LIGHT = '#43A047';

  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { notifications, unreadCount = 0 } = useSelector((s) => s.notifications);
  const { mobileMenuOpen } = useSelector((s) => s.ui);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  /* keyboard shortcut ⌘K / Ctrl+K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchNotifications({ limit: 20 }));
    const interval = setInterval(() => dispatch(fetchNotifications({ limit: 20 })), 30000);
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  const handleNotifMenuOpen = (e) => {
    setNotifAnchorEl(e.currentTarget);
    dispatch(fetchNotifications({ limit: 10 }));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
    setNotifAnchorEl(null);
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) dispatch(markNotificationAsRead(notif.id));
    setNotifAnchorEl(null);
    const postId = notif.metadata?.postId || notif.postId;
    if (postId) navigate(`/post/${postId}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      searchRef.current?.blur();
    }
  };

  /* active route check */
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* nav button style */
  const navBtnSx = (path, color = 'primary') => {
    const active = isActive(path);
    const isRed = color === 'error';
    return {
      borderRadius: '10px',
      px: 2.5,
      py: 0.7,
      fontWeight: 700,
      fontSize: '0.82rem',
      textTransform: 'none',
      transition: 'all 0.18s',
      ...(active ? {
        bgcolor: isRed ? 'rgba(211,47,47,0.1)' : isLight ? '#E8F5E9' : 'rgba(67,160,71,0.15)',
        color: isRed ? '#C62828' : GREEN_LIGHT,
        border: `1.5px solid ${isRed ? 'rgba(211,47,47,0.3)' : isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)'}`,
      } : {
        bgcolor: 'transparent',
        color: 'text.primary',
        border: `1.5px solid ${isLight ? '#D4D4D4' : 'rgba(255,255,255,0.12)'}`,
        '&:hover': {
          bgcolor: isRed ? 'rgba(211,47,47,0.06)' : isLight ? '#F0F7F0' : 'rgba(67,160,71,0.08)',
          borderColor: isRed ? 'rgba(211,47,47,0.35)' : isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)',
          color: isRed ? '#C62828' : GREEN_LIGHT,
        },
      }),
    };
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      className="glass-panel"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
        top: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 1, minHeight: { xs: 56, sm: 64 } }}>

        {/* ── Left: logo ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isMobile && isAuthenticated && (
            <IconButton edge="start" color="inherit" onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: { xs: 1, md: 3 } }} onClick={() => navigate('/')}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)', color: '#fff', mr: 1.25, boxShadow: '0 4px 10px rgba(46,125,50,0.3)' }}>
              <ElectricCarIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1rem', display: { xs: 'none', sm: 'block' } }}>
              DiscussEV
            </Typography>
          </Box>
        </Box>

        {/* ── Center: search ── */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: '11px',
            bgcolor: searchFocused
              ? isLight ? '#fff' : '#1a2e1b'
              : isLight ? '#F1F5F1' : '#1a2218',
            border: '1.5px solid',
            borderColor: searchFocused
              ? GREEN_LIGHT
              : isLight ? '#DDE8DD' : 'rgba(255,255,255,0.08)',
            boxShadow: searchFocused
              ? `0 0 0 3px ${isLight ? 'rgba(67,160,71,0.15)' : 'rgba(67,160,71,0.2)'}`
              : 'none',
            width: '100%',
            maxWidth: searchFocused
              ? { xs: '180px', sm: '360px', md: '500px' }
              : { xs: '140px', sm: '260px', md: '400px' },
            mx: { xs: 1, md: 2 },
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Box sx={{ px: 1.5, height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <SearchIcon sx={{ fontSize: 17, color: searchFocused ? GREEN_LIGHT : 'text.disabled' }} />
          </Box>
          <InputBase
            inputRef={searchRef}
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              width: '100%',
              '& .MuiInputBase-input': {
                py: '7px', pl: '36px',
                pr: searchQuery ? '60px' : '36px',
                fontSize: '0.85rem',
              },
            }}
          />
          {/* Clear button */}
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => setSearchQuery('')}
              sx={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', p: '3px', color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
          {/* ⌘K hint */}
          {!searchFocused && !searchQuery && !isMobile && (
            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 0.25, pointerEvents: 'none' }}>
              <Box sx={{ bgcolor: isLight ? '#E2E8E2' : 'rgba(255,255,255,0.08)', borderRadius: '5px', px: 0.7, py: 0.15 }}>
                <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600, letterSpacing: '0.02em' }}>⌘K</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Right: actions ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && !isMobile && (
                <>
                  <Button variant="outlined" onClick={() => navigate('/admin')} sx={navBtnSx('/admin', 'error')}
                    startIcon={<DashboardIcon sx={{ fontSize: '16px !important' }} />}>
                    Dashboard
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/admin/analytics')} sx={navBtnSx('/admin/analytics')}
                    startIcon={<BarChartIcon sx={{ fontSize: '16px !important' }} />}>
                    Analytics
                  </Button>
                </>
              )}
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: '17px !important' }} />}
                  onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  sx={{
                    borderRadius: '10px', px: 2.5, py: 0.7,
                    fontWeight: 700, fontSize: '0.82rem', textTransform: 'none',
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    boxShadow: '0 3px 10px rgba(46,125,50,0.25)',
                    '&:hover': { boxShadow: '0 5px 16px rgba(46,125,50,0.35)', background: `linear-gradient(135deg, #1B5E20, ${GREEN})` },
                  }}
                >
                  Post
                </Button>
              )}

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleNotifMenuOpen}
                  sx={{
                    width: 36, height: 36, borderRadius: '9px',
                    border: `1.5px solid ${Boolean(notifAnchorEl) ? GREEN_LIGHT : isLight ? '#DDE8DD' : 'rgba(255,255,255,0.1)'}`,
                    bgcolor: Boolean(notifAnchorEl) ? isLight ? '#E8F5E9' : 'rgba(67,160,71,0.12)' : 'transparent',
                    transition: 'all 0.18s',
                    '&:hover': { borderColor: GREEN_LIGHT, bgcolor: isLight ? '#F0F7F0' : 'rgba(67,160,71,0.1)' },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error" overlap="circular"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16, p: '0 4px' } }}>
                    <NotificationsIcon sx={{ fontSize: 18 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <NotifPopover
                anchorEl={notifAnchorEl}
                onClose={() => setNotifAnchorEl(null)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAll={handleMarkAllRead}
                onNotifClick={handleNotifClick}
                isLight={isLight}
                GREEN={GREEN}
                GREEN_LIGHT={GREEN_LIGHT}
              />

              {/* Avatar */}
              <Tooltip title="Account">
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    p: 0, ml: 0.5,
                    borderRadius: '50%',
                    border: `2px solid ${Boolean(anchorEl) ? GREEN_LIGHT : 'transparent'}`,
                    transition: 'border-color 0.18s',
                    '&:hover': { borderColor: GREEN_LIGHT },
                  }}
                >
                  <Avatar
                    src={user?.avatar}
                    sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: GREEN }}
                  >
                    {user?.firstName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* ── Profile menu ── */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    borderRadius: '14px', mt: 1.5, minWidth: 210,
                    border: `1px solid ${isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isLight ? '0 8px 32px rgba(0,0,0,0.12)' : '0 8px 32px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                  },
                }}
              >
                {/* User info header */}
                <Box sx={{
                  px: 2, pt: 2, pb: 1.75,
                  borderBottom: `1px solid ${isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{ width: 40, height: 40, fontSize: '0.95rem', bgcolor: GREEN, border: `2px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}` }}
                  >
                    {user?.firstName?.[0]}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </Typography>
                    {user?.role && (
                      <Box sx={{ display: 'inline-flex', mt: 0.4, bgcolor: user.role === 'admin' ? 'rgba(211,47,47,0.1)' : isLight ? '#E8F5E9' : 'rgba(67,160,71,0.15)', border: `1px solid ${user.role === 'admin' ? 'rgba(211,47,47,0.25)' : 'rgba(67,160,71,0.3)'}`, borderRadius: '6px', px: 0.8, py: 0.1 }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: user.role === 'admin' ? '#C62828' : GREEN_LIGHT, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          {user.role}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Menu items */}
                {[
                  { icon: <Person sx={{ fontSize: 17 }} />, label: 'Profile', path: '/profile', color: GREEN_LIGHT },
                  { icon: <Settings sx={{ fontSize: 17 }} />, label: 'Settings', path: '/settings', color: GREEN_LIGHT },
                ].map(({ icon, label, path, color }) => {
                  const active = isActive(path);
                  return (
                    <MenuItem
                      key={label}
                      onClick={() => { navigate(path); setAnchorEl(null); }}
                      sx={{
                        mx: 1, my: 0.4, borderRadius: '9px', px: 1.25, py: 0.9,
                        fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                        bgcolor: active ? isLight ? '#E8F5E9' : 'rgba(67,160,71,0.12)' : 'transparent',
                        color: active ? color : 'text.primary',
                        gap: 1.5,
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: isLight ? '#F0F7F0' : 'rgba(67,160,71,0.08)', color },
                      }}
                    >
                      <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: active ? isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)' : isLight ? '#F1F5F1' : 'rgba(255,255,255,0.06)', color: active ? color : 'text.secondary', flexShrink: 0 }}>
                        {icon}
                      </Box>
                      {label}
                    </MenuItem>
                  );
                })}

                <Box sx={{ mx: 1, my: 0.5, borderTop: `1px solid ${isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)'}` }} />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    mx: 1, mb: 1, borderRadius: '9px', px: 1.25, py: 0.9,
                    fontSize: '0.84rem', fontWeight: 500, gap: 1.5,
                    color: '#EF5350',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'rgba(239,83,80,0.08)', color: '#C62828' },
                  }}
                >
                  <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(239,83,80,0.1)', color: '#EF5350', flexShrink: 0 }}>
                    <Logout sx={{ fontSize: 17 }} />
                  </Box>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', textTransform: 'none', borderColor: isLight ? '#D4D4D4' : 'rgba(255,255,255,0.15)', '&:hover': { borderColor: GREEN_LIGHT, color: GREEN_LIGHT } }}
              >
                Login
              </Button>
              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', textTransform: 'none', background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`, boxShadow: '0 3px 10px rgba(46,125,50,0.25)', '&:hover': { boxShadow: '0 5px 16px rgba(46,125,50,0.35)' } }}
                >
                  Join Now
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