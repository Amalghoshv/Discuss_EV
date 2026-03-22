import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Visibility,
  Share,
  Edit,
  Delete,
  Reply,
  PersonAdd,
  PersonRemove,
  ReportProblem,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, likePost, deletePost } from '../store/slices/postSlice';
import { fetchComments } from '../store/slices/commentSlice';
import { followUser, unfollowUser, fetchUserProfile } from '../store/slices/userSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const PostDetail = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentPost, isLoading, isDeleting } = useSelector((state) => state.posts);
  const { comments, isLoading: commentsLoading } = useSelector((state) => state.comments);
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const { currentProfile, followLoading } = useSelector((state) => state.user);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchComments({ postId: id }));
    }
  }, [dispatch, id]);

  // Fetch author profile to get initial following status
  useEffect(() => {
    if (currentPost?.author?.id) {
      dispatch(fetchUserProfile(currentPost.author.id));
    }
  }, [dispatch, currentPost?.author?.id]);

  const handleLike = () => {
    if (isAuthenticated) {
      dispatch(likePost({ id, type: 'like' }));
    } else {
      navigate('/login');
    }
  };

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (currentProfile?.isFollowing) {
      dispatch(unfollowUser(currentPost.author.id));
    } else {
      dispatch(followUser(currentPost.author.id));
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

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(id)).unwrap();
      dispatch(showSnackbar({ message: 'Post deleted successfully', severity: 'success' }));
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to delete post', severity: 'error' }));
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (!currentPost) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
        <Typography variant="h5" color="text.secondary" align="center">
          Post not found
        </Typography>
      </Container>
    );
  }

  const isAuthor = currentUser?.id === currentPost.author?.id;

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      {/* Post Content */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Author Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={currentPost.author?.avatar}
              sx={{ mr: 2, width: 50, height: 50, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${currentPost.author?.id}`)}
            >
              {currentPost.author?.firstName?.[0]}{currentPost.author?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  onClick={() => navigate(`/profile/${currentPost.author?.id}`)}
                >
                  {currentPost.author?.firstName} {currentPost.author?.lastName}
                </Typography>
                {!isAuthor && (
                  <Button
                    size="small"
                    variant={currentProfile?.isFollowing ? "outlined" : "contained"}
                    startIcon={currentProfile?.isFollowing ? <PersonRemove /> : <PersonAdd />}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    sx={{ borderRadius: 10, textTransform: 'none', py: 0 }}
                  >
                    {currentProfile?.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </Box>
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

          {/* Image Attachments */}
          {currentPost.images && currentPost.images.length > 0 && (
            <Box sx={{ mb: 4, display: 'grid', gap: 1, gridTemplateColumns: currentPost.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {currentPost.images.map((img, index) => (
                <Box key={index} sx={{ borderRadius: 2, overflow: 'hidden', height: currentPost.images.length === 1 ? 400 : 250 }}>
                  <img src={img} alt={`Attachment ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Box>
          )}

          {/* Tags */}
          {currentPost.tagList && currentPost.tagList.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentPost.tagList.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate(`/search?tag=${tag.name}`)}
                  sx={{ cursor: 'pointer' }}
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
              color={currentPost.userLiked ? 'primary' : 'inherit'}
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
            <Tooltip title="Report this post">
              <IconButton 
                color="warning" 
                onClick={() => dispatch({ type: 'ui/openDialog', payload: { type: 'report', data: { targetType: 'post', targetId: currentPost.id } } })}
              >
                <ReportProblem />
              </IconButton>
            </Tooltip>

            {/* Edit/Delete buttons for post author */}
            {isAuthenticated && (isAuthor || currentUser?.role === 'admin') && (
              <>
                <Box sx={{ flexGrow: 1 }} />
                {isAuthor && (
                  <IconButton onClick={() => dispatch({ type: 'ui/openDialog', payload: { type: 'editPost', data: currentPost } })}>
                    <Edit />
                  </IconButton>
                )}
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
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
                onClick={() => dispatch({ type: 'ui/openDialog', payload: { type: 'createComment', data: { postId: id } } })}
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
                    sx={{ mr: 2, width: 32, height: 32, cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${comment.author?.id}`)}
                  >
                    {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => navigate(`/profile/${comment.author?.id}`)}
                    >
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

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Post?"
        content="Are you absolutely sure you want to permanently delete this post? This action cannot be undone and will remove all associated comments."
        confirmText="Delete Post"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={isDeleting}
      />
    </Container>
  );
};

export default PostDetail;
