import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Stack,
  Divider,
  Avatar,
  Button,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../store/slices/postSlice';
import { searchUsers, followUser, unfollowUser } from '../store/slices/userSlice';
import PostCard from '../components/common/PostCard';
import { PersonAdd, PersonRemove, SearchOff } from '@mui/icons-material';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [tabValue, setTabValue] = useState(0);

  const { posts, isLoading: isPostsLoading } = useSelector((state) => state.posts);
  const { searchResults: users, isSearchLoading, followLoading } = useSelector((state) => state.user);
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (query) {
      dispatch(fetchPosts({ search: query, limit: 20 }));
      dispatch(searchUsers(query));
    }
  }, [dispatch, query]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = (userId, isFollowing) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isFollowing) {
      dispatch(unfollowUser(userId));
    } else {
      dispatch(followUser(userId));
    }
  };

  const renderEmptyState = (message) => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <SearchOff sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Try adjusting your keywords or filters.
      </Typography>
    </Box>
  );

  if (!query) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 }, minHeight: '60vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Search
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter a keyword to search for discussions or people.
          </Typography>
        </Box>
        {renderEmptyState("What are you looking for?")}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Search Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Showing results for <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>"{query}"</Box>
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: '1rem' } }}
        >
          <Tab label={`Discussions (${posts?.length || 0})`} />
          <Tab label={`People (${users?.length || 0})`} />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        <Box className="animate-in">
          {isPostsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <Stack spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Stack>
          ) : (
            renderEmptyState("No discussions found for your search.")
          )}
        </Box>
      ) : (
        <Box className="animate-in">
          {isSearchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : users.length > 0 ? (
            <Grid container spacing={3}>
              {users.map((u) => (
                <Grid item xs={12} sm={6} md={4} key={u.id}>
                  <Paper
                    className="premium-card"
                    sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Avatar 
                      src={u.avatar} 
                      sx={{ width: 60, height: 60, cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      {u.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${u.id}`)}
                        noWrap
                      >
                        {u.firstName} {u.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        @{u.username}
                      </Typography>
                      {u.id !== currentUser?.id && (
                        <Button
                          size="small"
                          startIcon={u.isFollowing ? <PersonRemove /> : <PersonAdd />}
                          variant={u.isFollowing ? "outlined" : "contained"}
                          onClick={() => handleFollowToggle(u.id, u.isFollowing)}
                          disabled={followLoading}
                          sx={{ mt: 1, borderRadius: '20px', textTransform: 'none' }}
                        >
                          {u.isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            renderEmptyState("No people found matching your search.")
          )}
        </Box>
      )}
    </Container>
  );
};

export default Search;
