import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Chip, Avatar,
  Paper, Stack, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import {
  ThumbUp, Comment, Visibility, TrendingUp, ElectricCar,
  ChargingStation, Build, Article, KeyboardArrowRight,
  Whatshot, Public, Add, Bolt, ArrowForward, Forum,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchTrendingPosts, fetchFeedPosts } from '../store/slices/postSlice';
import { fetchEVNews } from '../store/slices/newsSlice';
import { openDialog } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/common/PostCard';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

/* ── keyframes ── */
const injectKf = () => {
  if (document.getElementById('home-kf')) return;
  const s = document.createElement('style');
  s.id = 'home-kf';
  s.textContent = `
    @keyframes home-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes home-in   { from{opacity:0;transform:scale(.96)}        to{opacity:1;transform:scale(1)} }
    @keyframes home-pulse{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
    @keyframes home-float{
      0%,100% { transform: translateY(0px) rotate(-12deg); }
      50%      { transform: translateY(-14px) rotate(-12deg); }
    }
    @keyframes home-scan {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
  `;
  document.head.appendChild(s);
};

/* ── shared card ── */
const HomeCard = ({ children, sx = {}, onClick }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Paper elevation={0} onClick={onClick} sx={{
      borderRadius: '14px',
      border: '1px solid',
      borderColor: isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)',
      bgcolor: isLight ? '#fff' : '#0F1E12',
      overflow: 'hidden',
      ...(onClick ? {
        cursor: 'pointer',
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)',
          boxShadow: `0 4px 20px ${isLight ? 'rgba(46,125,50,0.08)' : 'rgba(0,0,0,0.3)'}`,
          transform: 'translateY(-2px)',
        },
      } : {}),
      ...sx,
    }}>
      {children}
    </Paper>
  );
};

/* ── section header ── */
const SectionHead = ({ icon, title, delay = 0 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, animation: 'home-up 0.4s ease both', animationDelay: `${delay}ms` }}>
    <Box sx={{ color: GL, display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
  </Box>
);

/* ── news card ── */
const NewsCard = ({ article, idx }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Paper
      elevation={0}
      component="a"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)',
        bgcolor: isLight ? '#fff' : '#0F1E12',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        animation: 'home-up 0.4s ease both',
        animationDelay: `${idx * 60}ms`,
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)',
          boxShadow: `0 4px 20px ${isLight ? 'rgba(46,125,50,0.08)' : 'rgba(0,0,0,0.3)'}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {article.thumbnail ? (
        <Box sx={{ height: 120, backgroundImage: `url(${article.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
      ) : (
        <Box sx={{ height: 80, bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Public sx={{ fontSize: 32, color: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)' }} />
        </Box>
      )}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'inline-flex', mb: 0.75, px: 1, py: 0.2, borderRadius: '5px', bgcolor: GP, border: '1px solid rgba(67,160,71,0.3)', width: 'fit-content' }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: GL, textTransform: 'uppercase', letterSpacing: '0.08em' }}>EV News</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25, color: GL }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>Read article</Typography>
          <ArrowForward sx={{ fontSize: 12 }} />
        </Box>
      </Box>
    </Paper>
  );
};

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
const Home = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, trendingPosts, feedPosts, isLoading } = useSelector((s) => s.posts);
  const { articles: newsArticles, isLoading: isNewsLoading } = useSelector((s) => s.news);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedTab, setFeedTab] = useState(0);

  useEffect(() => {
    injectKf();
    dispatch(fetchPosts({ page: 1, limit: 10 }));
    dispatch(fetchTrendingPosts(5));
    dispatch(fetchEVNews());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && feedTab === 1) dispatch(fetchFeedPosts({ page: 1, limit: 10 }));
  }, [dispatch, isAuthenticated, feedTab]);

  const categories = [
    { id: '', label: 'All', icon: null },
    { id: 'charging-stations', label: 'Charging', icon: <ChargingStation sx={{ fontSize: 15 }} /> },
    { id: 'maintenance', label: 'Service', icon: <Build sx={{ fontSize: 15 }} /> },
    { id: 'technology', label: 'Tech', icon: <ElectricCar sx={{ fontSize: 15 }} /> },
    { id: 'news', label: 'News', icon: <Article sx={{ fontSize: 15 }} /> },
  ];

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    dispatch(fetchPosts({ page: 1, limit: 10, category: cat || undefined }));
  };

  const displayPosts = feedTab === 1 ? (feedPosts || []) : posts;
  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';

  if (isLoading && displayPosts.length === 0) return <LoadingSpinner message="Igniting motors…" />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isLight ? '#F2F6F2' : '#0A160B', pb: 8 }}>

      {/* ── Hero (logged out) ── */}
      {!isAuthenticated && (
        <Box sx={{
          position: 'relative',
          background: isLight
            ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #00796B 100%)'
            : 'linear-gradient(135deg, #0A1F0B 0%, #1B3A1C 50%, #003D33 100%)',
          pt: { xs: 8, md: 10 },
          pb: { xs: 10, md: 14 },
          overflow: 'hidden',
        }}>
          {/* dot grid overlay */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

          {/* Floating car */}
          {!isMobile && (
            <Box sx={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', opacity: 0.12, animation: 'home-float 4s ease-in-out infinite', pointerEvents: 'none' }}>
              <ElectricCar sx={{ fontSize: 280, color: '#fff' }} />
            </Box>
          )}

          <Box sx={{ px: { xs: 3, sm: 4, md: 6, xl: 8 }, position: 'relative', zIndex: 1 }}>
            {/* Live badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', px: 1.75, py: 0.5, mb: 2.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#69F0AE', animation: 'home-pulse 1.6s ease infinite' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.07em' }}>LIVE COMMUNITY</Typography>
            </Box>

            <Typography sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', md: '3.4rem', lg: '4rem' },
              lineHeight: 1.1,
              color: '#fff',
              letterSpacing: '-1px',
              mb: 2,
              maxWidth: 700,
            }}>
              Driving the Future<br />of Conversations
            </Typography>

            <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: 'rgba(255,255,255,0.75)', mb: 3.5, maxWidth: 500, lineHeight: 1.65 }}>
              The premier hub for EV owners, enthusiasts, and innovators. Join thousands already discussing charging, maintenance, and the road ahead.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: '11px', px: 3.5, py: 1.1,
                  fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
                  background: '#ffffff !important', // Force white background
                  color: `${G} !important`,         // Force green text
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  '&:hover': { background: '#F1F8F1 !important', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' },
                }}
              >
                Join for free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: '11px', px: 3.5, py: 1.1,
                  fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
                  border: '2px solid rgba(255,255,255,0.8) !important', // Thicker white border
                  color: '#ffffff !important',                          // Force white text
                  '&:hover': { background: 'rgba(255,255,255,0.1) !important', border: '2px solid #ffffff !important' },
                }}
              >
                Log in
              </Button>
            </Box>

            {/* Stat pills */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
              {[
                { value: `${posts.length}+`, label: 'Discussions' },
                { value: '10k+', label: 'Members' },
                { value: '24/7', label: 'Active' },
              ].map((s) => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Main content ── */}
      <Box sx={{
        px: { xs: 2, sm: 3, md: 5, xl: 8 },
        pt: isAuthenticated ? 3.5 : 4,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
        gap: 3,
        alignItems: 'start',
      }}>

        {/* ════ LEFT: feed ════ */}
        <Box>

          {/* Create post bar */}
          {isAuthenticated && (
            <HomeCard sx={{ p: 2, mb: 2.5, animation: 'home-up 0.4s ease both' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 38, height: 38, bgcolor: G, fontSize: '0.9rem', cursor: 'pointer', border: `2px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)'}` }}
                  onClick={() => navigate('/profile')}
                >
                  {user?.firstName?.[0]}
                </Avatar>
                <Box
                  onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  sx={{
                    flex: 1, px: 2, py: 1.1, borderRadius: '10px', cursor: 'pointer',
                    bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${border}`,
                    color: 'text.disabled', fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: isLight ? '#E8F5E9' : 'rgba(67,160,71,0.08)', borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)', color: 'text.secondary' },
                  }}
                >
                  What's on your mind about EVs?
                </Box>
                <Button
                  onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  variant="contained"
                  sx={{ borderRadius: '10px', minWidth: 0, px: 1.5, py: 1, background: `linear-gradient(135deg,${G},${GL})`, boxShadow: '0 3px 10px rgba(46,125,50,0.25)', flexShrink: 0 }}
                >
                  <Add sx={{ fontSize: 20 }} />
                </Button>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: border }} />

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[
                  { label: 'Discussion', icon: <Forum sx={{ fontSize: 15 }} /> },
                  { label: 'Review', icon: <ElectricCar sx={{ fontSize: 15 }} /> },
                  { label: 'Charging', icon: <ChargingStation sx={{ fontSize: 15 }} /> },
                ].map((q) => (
                  <Button
                    key={q.label}
                    startIcon={q.icon}
                    onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                    sx={{
                      flex: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                      borderRadius: '9px', py: 0.75,
                      color: 'text.secondary',
                      '&:hover': { bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', color: GL },
                    }}
                  >
                    {q.label}
                  </Button>
                ))}
              </Box>
            </HomeCard>
          )}

          {/* Category filter strip */}
          <Box sx={{
            display: 'flex', gap: 1, mb: 2.5, flexWrap: 'nowrap',
            overflowX: 'auto', pb: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
            animation: 'home-up 0.4s ease both', animationDelay: '60ms',
          }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.6,
                    px: 1.5, py: 0.6, borderRadius: '20px', cursor: 'pointer', flexShrink: 0,
                    border: '1.5px solid',
                    fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                    transition: 'all 0.15s',
                    bgcolor: active ? GP : 'transparent',
                    borderColor: active ? isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)' : border,
                    color: active ? G : 'text.secondary',
                    '&:hover': { borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)', color: GL },
                  }}
                >
                  {cat.icon && <Box sx={{ color: 'inherit', display: 'flex' }}>{cat.icon}</Box>}
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{cat.label}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Feed tabs */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2.5, borderBottom: `1px solid ${border}`, animation: 'home-up 0.4s ease both', animationDelay: '80ms' }}>
              {['Global Feed', 'For You'].map((label, i) => (
                <Box
                  key={label}
                  onClick={() => setFeedTab(i)}
                  sx={{
                    px: 2, py: 1.1, cursor: 'pointer',
                    borderBottom: feedTab === i ? `2.5px solid ${GL}` : '2.5px solid transparent',
                    color: feedTab === i ? GL : 'text.secondary',
                    fontWeight: feedTab === i ? 700 : 500,
                    fontSize: '0.85rem',
                    mb: '-1px',
                    transition: 'all 0.15s',
                    '&:hover': { color: GL },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
          )}

          {/* Posts or empty */}
          {displayPosts.length === 0 && !isLoading ? (
            <Box sx={{ animation: 'home-in 0.4s ease both' }}>
              <HomeCard sx={{ py: 6, px: 3, textAlign: 'center', mb: 3 }}>
                <ElectricCar sx={{ fontSize: 52, color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>No posts yet</Typography>
                <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary', mb: 2.5 }}>Be the first to start a conversation!</Typography>
                <Button variant="contained" onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: `linear-gradient(135deg,${G},${GL})`, boxShadow: '0 4px 14px rgba(46,125,50,0.3)' }}>
                  Start Discussion
                </Button>
              </HomeCard>

              {/* News grid when no posts */}
              <SectionHead icon={<Public sx={{ fontSize: 18 }} />} title="Global EV News" />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {newsArticles.slice(0, 6).map((a, i) => <NewsCard key={i} article={a} idx={i} />)}
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, animation: 'home-up 0.4s ease both', animationDelay: '100ms' }}>
                <Whatshot sx={{ fontSize: 18, color: '#EF5350' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Latest Activity</Typography>
              </Box>

              <Stack spacing={2} sx={{ animation: 'home-up 0.4s ease both', animationDelay: '120ms' }}>
                {displayPosts.map((post) => <PostCard key={post.id} post={post} />)}
              </Stack>

              {/* News section below posts */}
              {newsArticles.length > 0 && (
                <Box sx={{ mt: 5 }}>
                  <SectionHead icon={<Public sx={{ fontSize: 18 }} />} title="World Wide EV Trends" delay={0} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {newsArticles.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} idx={i} />)}
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* ════ RIGHT: sidebar ════ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Trending */}
          <HomeCard sx={{ animation: 'home-up 0.4s ease both', animationDelay: '100ms' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ fontSize: 17, color: GL }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Trending Now</Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {trendingPosts.length === 0 && (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', py: 2, textAlign: 'center' }}>No trending posts yet.</Typography>
              )}
              {trendingPosts.map((post, i) => (
                <Box
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  sx={{
                    display: 'flex', gap: 1.5, alignItems: 'flex-start',
                    px: 1, py: 1.1, borderRadius: '9px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    animation: 'home-up 0.35s ease both',
                    animationDelay: `${140 + i * 50}ms`,
                    '&:hover': { bgcolor: isLight ? GP : 'rgba(67,160,71,0.08)' },
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.25)', lineHeight: 1.2, minWidth: 24, flexShrink: 0, mt: 0.1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.3 }}>
                      {post.viewCount} views
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </HomeCard>

          {/* EV Business CTA */}
          <Paper elevation={0} sx={{
            borderRadius: '14px', overflow: 'hidden',
            border: '1px solid rgba(216,67,21,0.2)',
            bgcolor: isLight ? '#FFF8F5' : 'rgba(216,67,21,0.06)',
            animation: 'home-up 0.4s ease both', animationDelay: '200ms',
          }}>
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #d84315, #ff8a65)' }} />
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg, #d84315, #ff8a65)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ElectricCar sx={{ fontSize: 19, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>EV Business Owner?</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                Register your company on DiscussEV to connect with thousands of verified EV owners.
              </Typography>
              <Button
                fullWidth variant="contained"
                onClick={() => navigate('/register-company')}
                sx={{
                  borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, #d84315, #ff8a65)',
                  boxShadow: '0 4px 12px rgba(216,67,21,0.3)',
                  '&:hover': { boxShadow: '0 6px 18px rgba(216,67,21,0.45)' },
                }}
              >
                Apply for Verification
              </Button>
            </Box>
          </Paper>

          {/* Join CTA (logged out) */}
          {!isAuthenticated && (
            <Paper elevation={0} sx={{
              borderRadius: '14px', overflow: 'hidden',
              border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)'}`,
              bgcolor: isLight ? '#F1F8F1' : 'rgba(46,125,50,0.07)',
              animation: 'home-up 0.4s ease both', animationDelay: '260ms',
            }}>
              <Box sx={{ height: 3, background: `linear-gradient(90deg, ${G}, ${GL})` }} />
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: `linear-gradient(135deg,${G},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChargingStation sx={{ fontSize: 19, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Join the Discussion</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                  Share your EV journey with thousands of enthusiasts worldwide.
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: '0.82rem',
                    background: `linear-gradient(135deg,${G},${GL})`,
                    boxShadow: '0 4px 12px rgba(46,125,50,0.25)',
                    '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.4)' },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;