import React from 'react';
import { Box, Avatar, Typography, useTheme } from '@mui/material';
import {
  ThumbUp, ThumbDown, Comment, Visibility,
  ArrowForward, ReportProblem, BookmarkBorder, Bookmark,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { likePost } from '../../store/slices/postSlice';
import { openDialog } from '../../store/slices/uiSlice';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

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
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── stat button ── */
const StatBtn = ({ icon, count, hoverColor, onClick, active, activeColor }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.5, borderRadius: '7px', cursor: 'pointer',
      transition: 'all 0.15s',
      color: active ? activeColor : 'text.secondary',
      bgcolor: active ? `${activeColor}12` : 'transparent',
      '&:hover': { color: hoverColor, bgcolor: `${hoverColor}12` },
    }}
  >
    {React.cloneElement(icon, { sx: { fontSize: 15 } })}
    {count != null && (
      <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, lineHeight: 1 }}>{count}</Typography>
    )}
  </Box>
);

/* ════════════════════════════
   POSTCARD
════════════════════════════ */
const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { isAuthenticated } = useSelector((s) => s.auth);

  const voted = post.reactions?.[0]?.type === 'like' ? 'up' : (post.reactions?.[0]?.type === 'dislike' ? 'down' : null);
  const likeCount = post.likeCount || 0;
  const bookmarked = false; // Placeholder as bookmarking is not the focus here

  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';

  const handleVote = (e, dir) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openDialog({ type: 'login' }));
      return;
    }
    const type = dir === 'up' ? 'like' : 'dislike';
    dispatch(likePost({ id: post.id, type }));
  };

  return (
    <Box
      onClick={() => navigate(`/post/${post.id}`)}
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderColor: border,
        bgcolor: isLight ? '#fff' : '#0F1E12',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)',
          boxShadow: `0 4px 22px ${isLight ? 'rgba(46,125,50,0.09)' : 'rgba(0,0,0,0.35)'}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* ── image (if any) ── */}
      {post.images?.[0] && (
        <Box sx={{
          height: 180,
          backgroundImage: `url(${post.images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
        }} />
      )}

      <Box sx={{ p: 2.5 }}>
        {/* ── top row: author + category + bookmark ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Avatar
              src={post.author?.avatar}
              sx={{
                width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0,
                bgcolor: G,
                border: `1.5px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}`,
              }}
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author?.id}`); }}
            >
              {post.author?.firstName?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {post.author?.firstName} {post.author?.lastName}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                {timeAgo(post.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Category pill */}
            {post.category && (
              <Box sx={{
                px: 1.1, py: 0.3, borderRadius: '6px',
                bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)',
                border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.25)'}`,
              }}>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: GL, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {post.category}
                </Typography>
              </Box>
            )}

            {/* Bookmark */}
            <Box
              onClick={(e) => { e.stopPropagation(); /* setBookmarked((b) => !b); */ }}
              sx={{
                display: 'flex', p: 0.5, borderRadius: '7px', cursor: 'pointer',
                color: bookmarked ? GL : 'text.disabled',
                transition: 'all 0.15s',
                '&:hover': { color: GL, bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)' },
              }}
            >
              {bookmarked
                ? <Bookmark sx={{ fontSize: 16 }} />
                : <BookmarkBorder sx={{ fontSize: 16 }} />}
            </Box>
          </Box>
        </Box>

        {/* ── title ── */}
        <Typography sx={{
          fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.4,
          mb: 0.75,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </Typography>

        {/* ── excerpt ── */}
        <Typography sx={{
          fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          mb: 2,
        }}>
          {post.content}
        </Typography>

        {/* ── tags ── */}
        {post.tags?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
            {post.tags.slice(0, 3).map((tag) => (
              <Box key={tag} sx={{ px: 0.9, py: 0.2, borderRadius: '5px', bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.05)', border: `1px solid ${border}` }}>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', fontWeight: 600 }}>#{tag}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── divider ── */}
        <Box sx={{ height: '1px', bgcolor: border, mb: 1.75 }} />

        {/* ── action row ── */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: 1
        }}>
          {/* Vote + stats */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.25 }, overflowX: { xs: 'auto', sm: 'visible' }, pb: { xs: 0.5, sm: 0 } }}>
            <StatBtn
              icon={<ThumbUp />}
              count={likeCount}
              hoverColor={GL}
              activeColor={GL}
              active={voted === 'up'}
              onClick={(e) => handleVote(e, 'up')}
            />
            <StatBtn
              icon={<ThumbDown />}
              count={null}
              hoverColor="#EF5350"
              activeColor="#EF5350"
              active={voted === 'down'}
              onClick={(e) => handleVote(e, 'down')}
            />

            <Box sx={{ width: '1px', height: 14, bgcolor: border, mx: 0.75 }} />

            <StatBtn icon={<Comment />} count={post.commentCount || 0} hoverColor={GL} onClick={(e) => e.stopPropagation()} />
            <StatBtn icon={<Visibility />} count={post.viewCount || 0} hoverColor="text.primary" onClick={(e) => e.stopPropagation()} />

            <Box sx={{ width: '1px', height: 14, bgcolor: border, mx: 0.75 }} />

            <StatBtn
              icon={<ReportProblem />}
              count={null}
              hoverColor="#FF8F00"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'ui/openDialog', payload: { type: 'report', data: { targetType: 'post', targetId: post.id } } });
              }}
            />
          </Box>

          {/* Read more */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              color: GL, opacity: 0.85,
              transition: 'opacity 0.15s',
              '&:hover': { opacity: 1 },
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Read more</Typography>
            <ArrowForward sx={{ fontSize: 13 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PostCard;