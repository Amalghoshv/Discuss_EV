import React, { useEffect, useState, useRef } from 'react';
import {
  Typography, Box, Avatar, Button, IconButton,
  Tooltip, useTheme, Paper, Divider,
} from '@mui/material';
import {
  ThumbUp, ThumbDown, Comment, Visibility, Share,
  Edit, Delete, Reply, PersonAdd, PersonRemove,
  Flag, BookmarkBorder, Bookmark, ElectricCar,
  MoreHoriz, Check,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostById, likePost, deletePost } from '../store/slices/postSlice';
import { fetchComments } from '../store/slices/commentSlice';
import { followUser, unfollowUser, fetchUserProfile } from '../store/slices/userSlice';
import { showSnackbar, openDialog } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

/* ── keyframes ── */
const injectKf = () => {
  if (document.getElementById('pd-kf')) return;
  const s = document.createElement('style');
  s.id = 'pd-kf';
  s.textContent = `
    @keyframes pd-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pd-in   { from{opacity:0;transform:scale(.97)}       to{opacity:1;transform:scale(1)} }
    @keyframes pd-pulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.45);opacity:.5} }
  `;
  document.head.appendChild(s);
};

/* ── relative time ── */
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ── shared card ── */
const PCard = ({ children, sx = {} }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '16px',
      border: '1px solid',
      borderColor: isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)',
      bgcolor: isLight ? '#fff' : '#0F1E12',
      overflow: 'hidden',
      ...sx,
    }}>
      {children}
    </Paper>
  );
};

/* ── action button ── */
const ActBtn = ({ icon, label, onClick, active, activeColor = GL, disabled }) => (
  <Box
    onClick={disabled ? undefined : onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: 0.6,
      px: 1.25, py: 0.6, borderRadius: '8px', cursor: disabled ? 'default' : 'pointer',
      color: active ? activeColor : 'text.secondary',
      bgcolor: active ? `${activeColor}12` : 'transparent',
      transition: 'all 0.15s',
      '&:hover': disabled ? {} : { color: activeColor, bgcolor: `${activeColor}12` },
    }}
  >
    {React.cloneElement(icon, { sx: { fontSize: 16 } })}
    {label != null && <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1 }}>{label}</Typography>}
  </Box>
);

/* ── comment item ── */
const CommentItem = ({ comment, currentUser, isAuthenticated, dispatch, navigate, isLight, border, delay }) => {
  const [liked, setLiked] = useState(false);
  return (
    <Box sx={{ animation: 'pd-up 0.35s ease both', animationDelay: `${delay}ms` }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Avatar
          src={comment.author?.avatar}
          onClick={() => navigate(`/profile/${comment.author?.id}`)}
          sx={{
            width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0,
            bgcolor: G, cursor: 'pointer',
            border: `1.5px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}`,
            mt: 0.25,
          }}
        >
          {comment.author?.firstName?.[0]}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Bubble */}
          <Box sx={{
            bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${border}`,
            borderRadius: '0 12px 12px 12px',
            px: 1.75, py: 1.25,
            mb: 0.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{ fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:hover': { color: GL } }}
                  onClick={() => navigate(`/profile/${comment.author?.id}`)}
                >
                  {comment.author?.firstName} {comment.author?.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  {timeAgo(comment.createdAt)}
                </Typography>
              </Box>
              {isAuthenticated && currentUser?.id !== comment.author?.id && (
                <Tooltip title="Report comment">
                  <Box
                    onClick={() => dispatch(openDialog({ type: 'report', data: { targetType: 'comment', targetId: comment.id } }))}
                    sx={{ display: 'flex', p: 0.3, borderRadius: '5px', cursor: 'pointer', color: 'text.disabled', '&:hover': { color: '#FF8F00', bgcolor: 'rgba(255,143,0,0.08)' } }}
                  >
                    <Flag sx={{ fontSize: 13 }} />
                  </Box>
                </Tooltip>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
              {comment.content}
            </Typography>
          </Box>

          {/* Comment actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
            <Box onClick={() => setLiked((v) => !v)} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer', color: liked ? GL : 'text.disabled', transition: 'color 0.15s', fontSize: '0.68rem', fontWeight: 600, '&:hover': { color: GL } }}>
              <ThumbUp sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'inherit' }}>Like</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>·</Typography>
            <Box 
              onClick={() => {
                if (!isAuthenticated) return navigate('/login');
                dispatch(openDialog({ type: 'createComment', data: { postId: comment.postId, parentId: comment.id } }));
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer', color: 'text.disabled', transition: 'color 0.15s', '&:hover': { color: GL } }}
            >
              <Reply sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'inherit' }}>Reply</Typography>
            </Box>
          </Box>

          {/* Render Replies */}
          {comment.replies?.length > 0 && (
            <Box sx={{ 
              mt: 1.5, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              borderLeft: `1px solid ${border}`, 
              ml: 0.5, 
              pl: 2 
            }}>
              {comment.replies.map((reply, i) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  isAuthenticated={isAuthenticated}
                  dispatch={dispatch}
                  navigate={navigate}
                  isLight={isLight}
                  border={border}
                  delay={0}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
const PostDetail = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentPost, isLoading, isDeleting } = useSelector((s) => s.posts);
  const { comments, isLoading: commentsLoading } = useSelector((s) => s.comments);
  const { user: currentUser, isAuthenticated } = useSelector((s) => s.auth);
  const { currentProfile, followLoading } = useSelector((s) => s.user);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [voted, setVoted] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => { injectKf(); }, []);

  useEffect(() => {
    if (id) { dispatch(fetchPostById(id)); dispatch(fetchComments({ postId: id })); }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPost?.author?.id) dispatch(fetchUserProfile(currentPost.author.id));
    if (currentPost) {
      setLikeCount(currentPost.likeCount || 0);
      setDislikeCount(currentPost.dislikeCount || 0);
    }
  }, [dispatch, currentPost?.author?.id, currentPost]);

  const handleVote = (dir) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    
    // Optimistic update
    const type = dir === 'up' ? 'like' : 'dislike';
    const prev = voted;
    
    if (voted === dir) {
      // Remove vote
      setVoted(null);
      if (dir === 'up') setLikeCount(c => Math.max(0, c - 1));
      if (dir === 'down') setDislikeCount(c => Math.max(0, c - 1));
    } else {
      // Change or add vote
      setVoted(dir);
      if (dir === 'up') {
        setLikeCount(c => c + 1);
        if (prev === 'down') setDislikeCount(c => Math.max(0, c - 1));
      } else {
        setDislikeCount(c => c + 1);
        if (prev === 'up') setLikeCount(c => Math.max(0, c - 1));
      }
    }
    
    // Backend call
    dispatch(likePost({ id, type }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentPost?.title, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      dispatch(showSnackbar({ message: 'Link copied!', severity: 'success' }));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    if (commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(id)).unwrap();
      dispatch(showSnackbar({ message: 'Post deleted', severity: 'success' }));
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete post', severity: 'error' }));
      setDeleteDialogOpen(false);
    }
  };

  const handleFollowToggle = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    currentProfile?.isFollowing ? dispatch(unfollowUser(currentPost.author.id)) : dispatch(followUser(currentPost.author.id));
  };

  if (isLoading) return <LoadingSpinner message="Loading post…" />;

  if (!currentPost) return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">Post not found</Typography>
    </Box>
  );

  const isAuthor = currentUser?.id === currentPost.author?.id;
  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: isLight ? '#F2F6F2' : '#0A160B',
      py: { xs: 3, md: 4 },
      px: { xs: 2, sm: 3, md: 5, xl: 8 },
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' },
      gap: 3,
      alignItems: 'start',
    }}>

      {/* ── Post & Comments Combined Card ── */}
        <PCard sx={{ animation: 'pd-in 0.4s ease both', display: 'flex', flexDirection: 'column' }}>
          {/* Images */}
          {currentPost.images?.length > 0 && (
            <Box sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: currentPost.images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px,1fr))',
              maxHeight: currentPost.images.length === 1 ? 420 : 280,
              overflow: 'hidden',
              borderBottom: `1px solid ${border}`,
            }}>
              {currentPost.images.map((img, i) => (
                <Box key={i} sx={{ overflow: 'hidden', height: currentPost.images.length === 1 ? 420 : 280 }}>
                  <Box component="img" src={img} alt={`Image ${i + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }} />
                </Box>
              ))}
            </Box>
          )}

          {/* ── Post Content Section ── */}
          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            {/* Author row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentPost.author?.avatar}
                  onClick={() => navigate(`/profile/${currentPost.author?.id}`)}
                  sx={{ width: 48, height: 48, fontSize: '1.1rem', bgcolor: G, cursor: 'pointer', border: `2px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}` }}
                >
                  {currentPost.author?.firstName?.[0]}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{ fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', '&:hover': { color: GL } }}
                      onClick={() => navigate(`/profile/${currentPost.author?.id}`)}
                    >
                      {currentPost.author?.firstName} {currentPost.author?.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>·</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>{timeAgo(currentPost.createdAt)}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>@{currentPost.author?.username}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentPost.category && (
                  <Box sx={{ px: 1.25, py: 0.4, borderRadius: '8px', bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.25)'}` }}>
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: GL, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{currentPost.category}</Typography>
                  </Box>
                )}
                {!isAuthor && isAuthenticated && (
                  <Button
                    size="small"
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    variant={currentProfile?.isFollowing ? 'outlined' : 'contained'}
                    startIcon={currentProfile?.isFollowing ? <PersonRemove sx={{ fontSize: '14px !important' }} /> : <PersonAdd sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                      px: 2, py: 0.6,
                      ...(currentProfile?.isFollowing
                        ? { borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)', color: GL, '&:hover': { bgcolor: GP, borderColor: GL } }
                        : { background: `linear-gradient(135deg,${G},${GL})`, color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(46,125,50,0.2)', '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.3)' } }),
                    }}
                  >
                    {currentProfile?.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
                <Tooltip title={bookmarked ? 'Saved' : 'Save post'}>
                  <Box
                    onClick={() => setBookmarked((v) => !v)}
                    sx={{
                      display: 'flex', p: 0.8, borderRadius: '10px', cursor: 'pointer',
                      color: bookmarked ? GL : 'text.disabled',
                      bgcolor: bookmarked ? (isLight ? GP : 'rgba(67,160,71,0.1)') : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { color: GL, bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)' }
                    }}
                  >
                    {bookmarked ? <Bookmark sx={{ fontSize: 20 }} /> : <BookmarkBorder sx={{ fontSize: 20 }} />}
                  </Box>
                </Tooltip>
              </Box>
            </Box>

            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.85rem' }, lineHeight: 1.25, letterSpacing: '-0.4px', mb: 2.5, color: isLight ? '#1a1a1a' : '#fff' }}>
              {currentPost.title}
            </Typography>

            <Typography sx={{ fontSize: '1rem', lineHeight: 1.9, whiteSpace: 'pre-wrap', color: isLight ? '#2d2d2d' : '#e0e0e0', mb: 4, letterSpacing: '0.01em' }}>
              {currentPost.content}
            </Typography>

            {currentPost.tagList?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {currentPost.tagList.map((tag) => (
                  <Box
                    key={tag.id}
                    onClick={() => navigate(`/search?tag=${tag.name}`)}
                    sx={{
                      px: 1.5, py: 0.5, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${border}`,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: GL, bgcolor: isLight ? GP : 'rgba(67,160,71,0.08)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>#{tag.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ mb: 2, borderColor: border }} />

            {/* Action bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ActBtn icon={<ThumbUp />} label={likeCount} active={voted === 'up'} activeColor={GL} onClick={() => handleVote('up')} />
                <ActBtn icon={<ThumbDown />} label={dislikeCount} active={voted === 'down'} activeColor="#EF5350" onClick={() => handleVote('down')} />
                <Box sx={{ width: '1px', height: 20, bgcolor: border, mx: 1 }} />
                <ActBtn icon={<Comment />} label={currentPost.commentCount || 0} activeColor={GL} onClick={scrollToComments} />
                <ActBtn icon={<Visibility />} label={currentPost.viewCount || 0} activeColor={GL} />
                <Box sx={{ width: '1px', height: 20, bgcolor: border, mx: 1 }} />
                <ActBtn icon={copied ? <Check /> : <Share />} label={copied ? 'Copied!' : 'Share'} onClick={handleShare} active={copied} activeColor={GL} />
                {isAuthenticated && !isAuthor && (
                  <ActBtn icon={<Flag />} label={null} activeColor="#FF8F00" onClick={() => dispatch(openDialog({ type: 'report', data: { targetType: 'post', targetId: currentPost.id } }))} />
                )}
              </Box>

              {/* Edit / Delete */}
              {isAuthenticated && (isAuthor || currentUser?.role === 'admin') && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isAuthor && (
                    <Tooltip title="Edit post">
                      <IconButton
                        size="small"
                        onClick={() => dispatch({ type: 'ui/openDialog', payload: { type: 'editPost', data: currentPost } })}
                        sx={{ color: 'text.secondary', border: `1px solid ${border}`, '&:hover': { color: GL, bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', borderColor: GL } }}
                      >
                        <Edit sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete post">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{ color: 'text.secondary', border: `1px solid ${border}`, '&:hover': { color: '#EF5350', bgcolor: 'rgba(239,83,80,0.08)', borderColor: '#EF5350' } }}
                    >
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Box>

          <Box 
            ref={commentRef}
            sx={{ 
              px: { xs: 2.5, md: 4 }, 
              py: { xs: 2, md: 2.5 }, 
              bgcolor: isLight ? '#f9fbf9' : 'rgba(0,0,0,0.15)', 
              borderTop: `1px solid ${border}`,
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Comment sx={{ fontSize: 20, color: GL }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.2px' }}>
                Discussion
              </Typography>
              <Box sx={{ bgcolor: GL, borderRadius: '12px', px: 1, py: 0.1, fontSize: '0.7rem', fontWeight: 800, color: '#fff', minWidth: 20, textAlign: 'center' }}>
                {currentPost.commentCount || 0}
              </Box>
            </Box>

            {isAuthenticated && (
              <Button
                size="small"
                fullWidth={isMobile}
                startIcon={<Reply sx={{ fontSize: '16px !important' }} />}
                onClick={() => dispatch({ type: 'ui/openDialog', payload: { type: 'createComment', data: { postId: id } } })}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '0.82rem', px: 2.5, py: 0.75,
                  background: `linear-gradient(135deg,${G},${GL})`,
                  color: '#fff', boxShadow: '0 4px 12px rgba(46,125,50,0.2)',
                  '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.3)' },
                }}
              >
                Add Response
              </Button>
            )}
          </Box>

          {/* ── Comments List Section ── */}
          <Box sx={{ px: { xs: 2.5, md: 4 }, py: 4, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {commentsLoading ? (
              <LoadingSpinner message="Loading discussion…" />
            ) : comments.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', opacity: 0.7 }}>
                <Comment sx={{ fontSize: 48, color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)', mb: 2 }} />
                <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>No comments yet. Start the conversation!</Typography>
              </Box>
            ) : (
              comments.map((comment, i) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  isAuthenticated={isAuthenticated}
                  dispatch={dispatch}
                  navigate={navigate}
                  isLight={isLight}
                  border={border}
                  delay={100 + (i * 45)}
                />
              ))
            )}
          </Box>
        </PCard>

      {/* ════ SIDEBAR ════ */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column', gap: 2,
        animation: 'pd-up 0.45s ease both', animationDelay: '120ms',
      }}>

        {/* About author */}
        <PCard>
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>About the Author</Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.25 }}>
            <Avatar
              src={currentPost.author?.avatar}
              onClick={() => navigate(`/profile/${currentPost.author?.id}`)}
              sx={{ width: 64, height: 64, fontSize: '1.4rem', bgcolor: G, cursor: 'pointer', border: `3px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}` }}
            >
              {currentPost.author?.firstName?.[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{currentPost.author?.firstName} {currentPost.author?.lastName}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>@{currentPost.author?.username}</Typography>
            </Box>
            {!isAuthor && isAuthenticated && (
              <Button
                fullWidth size="small"
                onClick={handleFollowToggle}
                disabled={followLoading}
                startIcon={currentProfile?.isFollowing ? <PersonRemove sx={{ fontSize: '14px !important' }} /> : <PersonAdd sx={{ fontSize: '14px !important' }} />}
                sx={{
                  borderRadius: '9px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem',
                  ...(currentProfile?.isFollowing
                    ? { border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)'}`, color: GL, '&:hover': { bgcolor: GP } }
                    : { background: `linear-gradient(135deg,${G},${GL})`, color: '#fff', boxShadow: '0 3px 10px rgba(46,125,50,0.25)', '&:hover': { boxShadow: '0 5px 14px rgba(46,125,50,0.35)' } }),
                }}
              >
                {currentProfile?.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Box>
        </PCard>

        {/* Post meta */}
        <PCard>
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Post Info</Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { label: 'Likes', value: likeCount },
              { label: 'Dislikes', value: dislikeCount },
              { label: 'Comments', value: currentPost.commentCount || 0 },
              { label: 'Views', value: currentPost.viewCount || 0 },
              { label: 'Published', value: timeAgo(currentPost.createdAt) },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </PCard>

        {/* Share */}
        <PCard>
          <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 0.5 }}>Share this post</Typography>
            <Button
              fullWidth variant="outlined" size="small"
              startIcon={copied ? <Check sx={{ fontSize: '15px !important' }} /> : <Share sx={{ fontSize: '15px !important' }} />}
              onClick={handleShare}
              sx={{
                borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)',
                color: GL,
                '&:hover': { bgcolor: GP, borderColor: GL },
              }}
            >
              {copied ? 'Link Copied!' : 'Copy Link'}
            </Button>
          </Box>
        </PCard>
      </Box>

      {/* ── Confirm delete ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Post?"
        content="Are you absolutely sure? This will permanently remove the post and all its comments."
        confirmText="Delete Post"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={isDeleting}
      />
    </Box>
  );
};

export default PostDetail;