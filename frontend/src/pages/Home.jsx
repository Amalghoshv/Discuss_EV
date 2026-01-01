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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchTrendingPosts } from '../store/slices/postSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { posts, trendingPosts, isLoading } = useSelector((state) => state.posts);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 10 }));
    dispatch(fetchTrendingPosts(5));
  }, [dispatch]);

  const categories = [
    { id: 'charging-stations', label: 'Charging Stations', icon: <ChargingStation /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Build /> },
    { id: 'technology', label: 'Technology', icon: <ElectricCar /> },
    { id: 'news', label: 'News', icon: <Article /> },
    { id: 'policy', label: 'Policy', icon: <Article /> },
    { id: 'reviews', label: 'Reviews', icon: <Article /> },
    { id: 'general', label: 'General', icon: <Article /> },
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

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : <Article />;
  };

  const getCategoryLabel = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.label : category;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading posts..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to DiscussEV
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Join the electric vehicle community and share your experiences
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
            >
              Join Community
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Category Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Browse by Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => handleCategoryFilter('')}
                color={selectedCategory === '' ? 'primary' : 'default'}
                variant={selectedCategory === '' ? 'filled' : 'outlined'}
              />
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  onClick={() => handleCategoryFilter(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          {/* Posts List */}
          <Typography variant="h5" gutterBottom>
            Latest Discussions
          </Typography>
          
          {posts.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No posts found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Be the first to start a discussion!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} sx={{ mb: 3, cursor: 'pointer' }} 
                    onClick={() => navigate(`/post/${post.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={post.author?.avatar}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    >
                      {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {post.author?.firstName} {post.author?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getCategoryIcon(post.category)}
                      label={getCategoryLabel(post.category)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content}
                  </Typography>
                  
                  {post.tags && post.tags.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                      {post.tags.length > 3 && (
                        <Chip
                          label={`+${post.tags.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUp fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {post.likeCount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Comment fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {post.commentCount}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {post.viewCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            ))
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Trending Posts */}
          {trendingPosts.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  Trending Posts
                </Typography>
                {trendingPosts.map((post, index) => (
                  <Box
                    key={post.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                      px: 1,
                    }}
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        minWidth: 24,
                        textAlign: 'center',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        mr: 2,
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.likeCount} likes • {post.viewCount} views
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Community Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Posts</Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    {posts.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Members</Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    1,234
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Discussions Today</Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    45
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
