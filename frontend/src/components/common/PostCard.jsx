import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  Stack,
  Button
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  Visibility,
  KeyboardArrowRight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className="premium-card animate-in"
      onClick={() => navigate(`/post/${post.id}`)}
      sx={{ cursor: 'pointer' }}
    >
      <CardContent sx={{ p: 3 }}>
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

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
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

        {post.images && post.images.length > 0 && (
          <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', maxHeight: 300 }}>
            <img src={post.images[0]} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                onClick={(e) => { e.stopPropagation(); /* logic for upvote here */ }}
              >
                <ThumbUp fontSize="small" sx={{ opacity: 0.6 }} titleAccess="Upvote" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.likeCount}</Typography>
              </Box>
              <Box 
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: 'error.main' } }}
                onClick={(e) => { e.stopPropagation(); /* logic for downvote here */ }}
              >
                <ThumbDown fontSize="small" sx={{ opacity: 0.6 }} titleAccess="Downvote" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment fontSize="small" sx={{ opacity: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.commentCount || 0}</Typography>
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
  );
};

export default PostCard;
