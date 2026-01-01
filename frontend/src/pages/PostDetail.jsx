import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Visibility,
  Share,
  Edit,
  Delete,
  Reply,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, likePost } from '../store/slices/postSlice';
import { fetchComments, createComment } from '../store/slices/commentSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PostDetail = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { currentPost, isLoading } = useSelector((state) => state.posts);
  const { comments, isLoading: commentsLoading } = useSelector((state) => state.comments);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchComments({ postId: id }));
    }
  }, [dispatch, id]);

  const handleLike = () => {
    if (isAuthenticated) {
      dispatch(likePost({ id, type: 'like' }));
    } else {
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (!currentPost) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" color="text.secondary" align="center">
          Post not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Post Content */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Author Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={currentPost.author?.avatar}
              sx={{ mr: 2, width: 50, height: 50 }}
            >
              {currentPost.author?.firstName?.[0]}{currentPost.author?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentPost.author?.firstName} {currentPost.author?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{currentPost.author?.username} • {formatDate(currentPost.createdAt)}
              </Typography>
            </Box>
            <Chip
              label={currentPost.category}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Post Title */}
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {currentPost.title}
          </Typography>

          {/* Post Content */}
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              mb: 3,
              whiteSpace: 'pre-wrap',
            }}
          >
            {currentPost.content}
          </Typography>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentPost.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
            </Box>
          )}

          {/* Post Actions */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ThumbUp />}
              onClick={handleLike}
              color={currentPost.userLiked ? 'primary' : 'default'}
            >
              {currentPost.likeCount} Likes
            </Button>
            <Button startIcon={<Comment />}>
              {currentPost.commentCount} Comments
            </Button>
            <Button startIcon={<Visibility />}>
              {currentPost.viewCount} Views
            </Button>
            <Button startIcon={<Share />}>
              Share
            </Button>
            
            {/* Edit/Delete buttons for post author */}
            {isAuthenticated && user?.id === currentPost.author?.id && (
              <>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton onClick={() => navigate(`/edit-post/${currentPost.id}`)}>
                  <Edit />
                </IconButton>
                <IconButton color="error">
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Comments ({currentPost.commentCount})
          </Typography>
          
          {isAuthenticated && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Reply />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Add a comment
              </Button>
            </Box>
          )}

          {commentsLoading ? (
            <LoadingSpinner message="Loading comments..." />
          ) : comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={comment.author?.avatar}
                    sx={{ mr: 2, width: 32, height: 32 }}
                  >
                    {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {comment.author?.firstName} {comment.author?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ ml: 5, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PostDetail;
