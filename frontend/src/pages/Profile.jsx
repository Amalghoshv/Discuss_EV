import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Paper,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  LocationOn,
  CalendarToday,
  FormatQuote,
  Email,
  Grid3x3 as GridView,
  Info,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserProfile, followUser, unfollowUser, clearProfile } from '../store/slices/userSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { currentProfile, isLoading, followLoading, error } = useSelector((state) => state.user);
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const profileId = id || currentUser?.id;
    if (profileId) {
      dispatch(fetchUserProfile(profileId));
    }
    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, id, currentUser]);

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentProfile.isFollowing) {
      dispatch(unfollowUser(id));
    } else {
      dispatch(followUser(id));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Accelerating to profile..." />;
  }

  if (error || !currentProfile) {
    return (
      <Container maxWidth={false} sx={{ py: 8, textAlign: 'center', px: { xs: 2, md: 4, lg: 6 } }} className="animate-in">
        <Typography variant="h5" color="text.secondary">
          {error || 'User not found'}
        </Typography>
        <Button variant="contained" sx={{ mt: 3, borderRadius: '20px' }} onClick={() => navigate('/')}>
          Back to Discussions
        </Button>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentProfile && String(currentUser.id) === String(currentProfile.id);

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, overflowX: 'hidden' }}>
      {/* Profile Hero Header */}
      <Box
        sx={{
          height: { xs: 150, md: 250 },
          background: 'linear-gradient(135deg, #2E7D32 0%, #00B8D4 100%)',
          position: 'relative',
          mb: 10,
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, lg: 6 } }}>
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-end' },
              gap: 3,
              width: '100%',
              px: { xs: 2, md: 0 },
              left: 0
            }}
          >
            <Avatar
              src={currentProfile.avatar}
              sx={{
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                border: `6px solid ${theme.palette.background.paper}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {currentProfile.firstName?.[0]}
            </Avatar>

            <Box sx={{ pb: { md: 2 }, textAlign: { xs: 'center', md: 'left' }, flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: { xs: 'text.primary', md: '#fff' }, textShadow: { md: '0 2px 4px rgba(0,0,0,0.2)' } }}>
                {currentProfile.firstName} {currentProfile.lastName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8, color: { xs: 'text.secondary', md: '#fff' } }}>
                @{currentProfile.username}
              </Typography>
            </Box>

            <Box sx={{ pb: { md: 2 }, display: 'flex', gap: 2 }}>
              {!isOwnProfile && (
                <Button
                  variant={currentProfile.isFollowing ? "outlined" : "contained"}
                  startIcon={currentProfile.isFollowing ? <PersonRemove /> : <PersonAdd />}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  sx={{ borderRadius: '30px', px: 4, py: 1, ...(currentProfile.isFollowing ? { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: '#fff' } : {}) }}
                >
                  {currentProfile.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
              {isOwnProfile && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/settings')}
                  sx={{ borderRadius: '30px', px: 4, py: 1 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, lg: 6 } }}>
        <Grid container spacing={4}>
          {/* Side Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper className="glass-panel" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>About</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 3 }}>
                  {currentProfile.bio || "No bio yet. This EV enthusiast is quiet for now."}
                </Typography>

                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <LocationOn color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Planet Earth</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <CalendarToday color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Joined</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(currentProfile.createdAt)}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Email color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Contact</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentProfile.email}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Paper className="glass-panel" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Community Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentProfile.posts?.length || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Posts</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentProfile.followerCount}</Typography>
                      <Typography variant="caption" color="text.secondary">Followers</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentProfile.followingCount}</Typography>
                      <Typography variant="caption" color="text.secondary">Following</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Activity Feed */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' },
                  '& .MuiTab-root': { fontWeight: 700, fontSize: '1rem', textTransform: 'none', minWidth: 100 }
                }}
              >
                <Tab icon={<GridView sx={{ mr: 1 }} fontSize="small" />} iconPosition="start" label="Posts" />
                <Tab icon={<Info sx={{ mr: 1 }} fontSize="small" />} iconPosition="start" label="Activity" />
              </Tabs>
              <Divider sx={{ mt: 0 }} />
            </Box>

            {activeTab === 0 && (
              <Stack spacing={3} className="animate-in">
                {currentProfile.posts && currentProfile.posts.length > 0 ? (
                  currentProfile.posts.map((post) => (
                    <Card
                      key={post.id}
                      className="premium-card"
                      onClick={() => navigate(`/post/${post.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Chip label={post.category} size="small" color="primary" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">{new Date(post.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{post.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                          {post.content}
                        </Typography>
                        <Button variant="text" color="primary" endIcon={<GridView />}>View discussion</Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'action.hover' }}>
                    <Typography color="text.secondary">This motor hasn't started yet. No posts found.</Typography>
                  </Paper>
                )}
              </Stack>
            )}

            {activeTab === 1 && (
              <Box className="animate-in">
                <Paper className="glass-panel" sx={{ p: 4, borderRadius: 4 }}>
                  <Typography variant="body1" color="text.secondary">Recently liked posts and followed users will appear here.</Typography>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
