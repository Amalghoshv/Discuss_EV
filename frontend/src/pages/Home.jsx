import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Visibility,
  TrendingUp,
  ElectricCar,
  ChargingStation,
  Build,
  Article,
  KeyboardArrowRight,
  Whatshot,
  Public,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchTrendingPosts } from '../store/slices/postSlice';
import { fetchEVNews } from '../store/slices/newsSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, trendingPosts, isLoading } = useSelector((state) => state.posts);
  const { articles: newsArticles, isLoading: isNewsLoading } = useSelector((state) => state.news);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 10 }));
    dispatch(fetchTrendingPosts(5));
    dispatch(fetchEVNews());
  }, [dispatch]);

  const categories = [
    { id: 'charging-stations', label: 'Charging', icon: <ChargingStation /> },
    { id: 'maintenance', label: 'Service', icon: <Build /> },
    { id: 'technology', label: 'Tech', icon: <ElectricCar /> },
    { id: 'news', label: 'News', icon: <Article /> },
    { id: 'reviews', label: 'Reviews', icon: <Article /> },
  ];

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    dispatch(fetchPosts({
      page: 1,
      limit: 10,
      category: category || undefined
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && posts.length === 0) {
    return <LoadingSpinner message="Igniting motors..." />;
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
            : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          mb: -10,
          overflow: 'hidden'
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, lg: 6 } }} className="animate-in">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 2,
                  background: 'linear-gradient(135deg, #2E7D32 0%, #00B8D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Driving the Future <br /> of Conversations
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', lineHeight: 1.6 }}>
                The premier hub for EV owners, enthusiasts, and innovators to discuss charging, maintenance, and the road ahead.
              </Typography>
              {!isAuthenticated && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5, borderRadius: '30px' }}
                  >
                    Join Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ px: 4, py: 1.5, borderRadius: '30px' }}
                  >
                    Explore
                  </Button>
                </Stack>
              )}
            </Grid>
            {!isMobile && (
              <Grid item md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '10%',
                      left: '10%',
                      width: '80%',
                      height: '80%',
                      background: theme.palette.primary.main,
                      filter: 'blur(100px)',
                      opacity: 0.2,
                      zIndex: 0
                    }
                  }}
                >
                  <ElectricCar sx={{ fontSize: '300px', color: theme.palette.primary.main, opacity: 0.1, transform: 'rotate(-20deg)' }} />
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 4, lg: 6 } }}>
        <Grid container spacing={4}>
          {/* Main Feed */}
          <Grid item xs={12} lg={8}>
            <Paper
              className="glass-panel"
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              <Chip
                label="All"
                onClick={() => handleCategoryFilter('')}
                color={selectedCategory === '' ? 'primary' : 'default'}
                sx={{ px: 1 }}
              />
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  onClick={() => handleCategoryFilter(category.id)}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  sx={{ px: 1 }}
                />
              ))}
            </Paper>

            {posts.length === 0 && !isLoading ? (
              <Box className="animate-in">
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, mb: 4, bgcolor: 'action.hover' }}>
                  <Typography variant="h6" gutterBottom>No community posts yet.</Typography>
                  <Typography variant="body2" color="text.secondary">Why not be the first to start a conversation?</Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/create-post')}
                    sx={{ mt: 2 }}
                  >
                    Start Discussion
                  </Button>
                </Paper>

                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Global EV News & Trends
                </Typography>
                <Grid container spacing={3}>
                  {newsArticles.slice(0, 6).map((article, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card className="premium-card" sx={{ height: '100%' }}>
                        <Box
                          sx={{
                            height: 140,
                            bgcolor: 'primary.light',
                            backgroundImage: `url(${article.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        <CardContent>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>NEWS</Typography>
                          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, height: '3em', overflow: 'hidden' }}>
                            {article.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ height: '4em', overflow: 'hidden' }}>
                            {article.description || article.content.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...'}
                          </Typography>
                          <Button
                            size="small"
                            href={article.link}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            Source
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Whatshot color="error" /> Latest Activity
                </Typography>

                <Stack spacing={3}>
                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="premium-card animate-in"
                      onClick={() => navigate(`/post/${post.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={post.author?.avatar} sx={{ width: 40, height: 40, mr: 2 }}>
                            {post.author?.firstName?.[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {post.author?.firstName} {post.author?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(post.createdAt)}
                            </Typography>
                          </Box>
                          <Chip label={post.category} size="small" variant="outlined" color="primary" />
                        </Box>

                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                          {post.title}
                        </Typography>

                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mb: 3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.6
                          }}
                        >
                          {post.content}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Stack direction="row" spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ThumbUp fontSize="small" sx={{ opacity: 0.6 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.likeCount}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Comment fontSize="small" sx={{ opacity: 0.6 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.commentCount}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Visibility fontSize="small" sx={{ opacity: 0.6 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.viewCount}</Typography>
                            </Box>
                          </Stack>
                          <Button size="small" endIcon={<KeyboardArrowRight />}>Read More</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </>
            )}

            {posts.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>World Wide EV Trends</Typography>
                <Grid container spacing={3}>
                  {newsArticles.slice(0, 4).map((article, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card className="premium-card">
                        <CardContent>
                          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 1 }}>{article.title}</Typography>
                          <Button size="small" href={article.link} target="_blank">View Article</Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="primary" /> Trending Now
                </Typography>
                <Stack spacing={2}>
                  {trendingPosts.map((post, index) => (
                    <Box
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        display: 'flex',
                        gap: 2
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 900, opacity: 0.2 }}>0{index + 1}</Typography>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{post.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{post.viewCount} weekly views</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Card sx={{ p: 1, textAlign: 'center', background: theme.palette.primary.main, color: '#fff' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Join the discussion</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                    Share your EV journey with thousands of enthusiasts worldwide.
                  </Typography>
                  <Button variant="contained" color="secondary" fullWidth sx={{ borderRadius: '20px' }}>
                    Create Account
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
