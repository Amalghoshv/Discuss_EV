import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Avatar,
  Paper, Stack, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import {
  TrendingUp, ElectricCar, ChargingStation, Build,
  Article, Whatshot, Public, Add, ArrowForward, Forum,
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
    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>
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
        <Box sx={{ height: 110, backgroundImage: `url(${article.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
      ) : (
        <Box sx={{ height: 70, bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Public sx={{ fontSize: 28, color: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)' }} />
        </Box>
      )}
      <Box sx={{ p: 1.75, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'inline-flex', mb: 0.6, px: 0.85, py: 0.2, borderRadius: '5px', bgcolor: GP, border: '1px solid rgba(67,160,71,0.3)', width: 'fit-content' }}>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: GL, textTransform: 'uppercase', letterSpacing: '0.08em' }}>EV News</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: GL }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Read article</Typography>
          <ArrowForward sx={{ fontSize: 11 }} />
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
  // treat anything below 450px as "xs" mobile
  const isXsMobile = useMediaQuery('(max-width:449px)');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, trendingPosts, feedPosts, isLoading } = useSelector((s) => s.posts);
  const { articles: newsArticles } = useSelector((s) => s.news);
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
    { id: 'charging-stations', label: 'Charging', icon: <ChargingStation sx={{ fontSize: 14 }} /> },
    { id: 'maintenance', label: 'Service', icon: <Build sx={{ fontSize: 14 }} /> },
    { id: 'technology', label: 'Tech', icon: <ElectricCar sx={{ fontSize: 14 }} /> },
    { id: 'news', label: 'News', icon: <Article sx={{ fontSize: 14 }} /> },
  ];

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    dispatch(fetchPosts({ page: 1, limit: 10, category: cat || undefined }));
  };

  const displayPosts = feedTab === 1 ? (feedPosts || []) : posts;
  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';
  const shouldShowBusinessCta = !isAuthenticated || (!user?.companyId && !user?.company);

  // Horizontal padding — tighter on very small screens
  const hPx = { xs: '12px', sm: '20px', md: '40px', xl: '64px' };

  if (isLoading && displayPosts.length === 0) return <LoadingSpinner message="Igniting motors…" />;

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: isLight ? '#F2F6F2' : '#0A160B',
      pb: 8,
      width: '100%',
      overflowX: 'hidden',          // prevent any child from causing overflow
      boxSizing: 'border-box',
    }}>

      {/* ── Hero (logged out) ── */}
      {!isAuthenticated && (
        <Box sx={{
          position: 'relative',
          background: isLight
            ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #00796B 100%)'
            : 'linear-gradient(135deg, #0A1F0B 0%, #1B3A1C 50%, #003D33 100%)',
          pt: { xs: 6, md: 10 },
          pb: { xs: 7, md: 14 },
          overflow: 'hidden',
          width: '100%',
        }}>
          {/* dot grid */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

          {/* Floating car – hide on very small screens */}
          {!isMobile && (
            <Box sx={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', opacity: 0.12, animation: 'home-float 4s ease-in-out infinite', pointerEvents: 'none' }}>
              <ElectricCar sx={{ fontSize: 260, color: '#fff' }} />
            </Box>
          )}

          <Box sx={{ px: hPx, position: 'relative', zIndex: 1, boxSizing: 'border-box', width: '100%' }}>
            {/* Live badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', px: 1.5, py: 0.45, mb: 2 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#69F0AE', animation: 'home-pulse 1.6s ease infinite', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>LIVE COMMUNITY</Typography>
            </Box>

            <Typography sx={{
              fontWeight: 900,
              fontSize: { xs: '1.6rem', sm: '2.4rem', md: '3.2rem', lg: '3.8rem' },
              lineHeight: 1.12,
              color: '#fff',
              letterSpacing: '-0.5px',
              mb: 1.5,
              maxWidth: 680,
              wordBreak: 'break-word',
            }}>
              Driving the Future<br />of Conversations
            </Typography>

            <Typography sx={{
              fontSize: { xs: '0.82rem', md: '1rem' },
              color: 'rgba(255,255,255,0.75)',
              mb: 3,
              maxWidth: 480,
              lineHeight: 1.65,
            }}>
              The premier hub for EV owners, enthusiasts, and innovators. Join thousands already discussing charging, maintenance, and the road ahead.
            </Typography>

            {/* CTA buttons — stack on xs */}
            <Box sx={{ display: 'flex', gap: 1.25, flexDirection: { xs: 'column', sm: 'row' }, maxWidth: { xs: '100%', sm: 'fit-content' } }}>
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: '11px', px: { xs: 2, sm: 3.5 }, py: 1,
                  fontWeight: 700, fontSize: '0.88rem', textTransform: 'none',
                  background: '#ffffff',
                  color: G,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: '#E8F5E9',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
                  },
                  '&.MuiButton-contained': {
                    background: '#ffffff',
                    color: G,
                  },
                }}
              >
                Join for free
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: '11px', px: { xs: 2, sm: 3.5 }, py: 1,
                  fontWeight: 700, fontSize: '0.88rem', textTransform: 'none',
                  border: '1.5px solid rgba(255,255,255,0.75)',
                  color: '#fff',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    border: '1.5px solid #fff',
                  },
                  '&.MuiButton-outlined': {
                    border: '1.5px solid rgba(255,255,255,0.75)',
                    color: '#fff',
                  },
                }}
              >
                Log in
              </Button>
            </Box>

            {/* Stat pills */}
            <Box sx={{ display: 'flex', gap: { xs: 2.5, sm: 3 }, mt: 3, flexWrap: 'wrap' }}>
              {[
                { value: `${posts.length}+`, label: 'Discussions' },
                { value: '10k+', label: 'Members' },
                { value: '24/7', label: 'Active' },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' }, color: '#fff', lineHeight: 1.1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Main content grid ── */}
      <Box sx={{
        px: hPx,
        pt: isAuthenticated ? 3 : 3.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' },
        gap: { xs: 2, md: 3 },
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ════ LEFT: feed ════ */}
        <Box sx={{ minWidth: 0, width: '100%' }}>   {/* minWidth:0 prevents grid blowout */}

          {/* Create post bar */}
          {isAuthenticated && (
            <HomeCard sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, animation: 'home-up 0.4s ease both' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 34, height: 34, bgcolor: G, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0, border: `2px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)'}` }}
                  onClick={() => navigate('/profile')}
                >
                  {user?.firstName?.[0]}
                </Avatar>
                <Box
                  onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  sx={{
                    flex: 1, minWidth: 0,
                    px: 1.5, py: 1, borderRadius: '10px', cursor: 'pointer',
                    bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${border}`,
                    color: 'text.disabled', fontSize: '0.82rem',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: isLight ? '#E8F5E9' : 'rgba(67,160,71,0.08)', borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)', color: 'text.secondary' },
                  }}
                >
                  {isXsMobile ? "What's on your mind?" : "What's on your mind about EVs?"}
                </Box>
                <Button
                  onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  variant="contained"
                  sx={{ borderRadius: '9px', minWidth: 0, px: 1.25, py: 0.9, flexShrink: 0, background: `linear-gradient(135deg,${G},${GL})`, boxShadow: '0 3px 8px rgba(46,125,50,0.25)' }}
                >
                  <Add sx={{ fontSize: 18 }} />
                </Button>
              </Box>

              <Divider sx={{ my: 1.25, borderColor: border }} />

              {/* Quick post type buttons */}
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                {[
                  { label: isXsMobile ? 'Post' : 'Discussion', icon: <Forum sx={{ fontSize: 14 }} /> },
                  { label: isXsMobile ? 'Review' : 'Review', icon: <ElectricCar sx={{ fontSize: 14 }} /> },
                  { label: isXsMobile ? 'Charge' : 'Charging', icon: <ChargingStation sx={{ fontSize: 14 }} /> },
                ].map((q) => (
                  <Button
                    key={q.label}
                    startIcon={q.icon}
                    onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                    sx={{
                      flex: 1, textTransform: 'none', fontWeight: 600,
                      fontSize: { xs: '0.72rem', sm: '0.78rem' },
                      borderRadius: '8px', py: 0.65,
                      color: 'text.secondary',
                      '& .MuiButton-startIcon': { mr: { xs: 0.4, sm: 0.75 } },
                      '&:hover': { bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', color: GL },
                    }}
                  >
                    {q.label}
                  </Button>
                ))}
              </Box>
            </HomeCard>
          )}

          {/* Category filter strip — scrollable, no outer overflow */}
          <Box sx={{
            display: 'flex', gap: 1, mb: 2,
            overflowX: 'auto', pb: 0.5,
            // negative margin trick to let strip reach screen edge on mobile
            mx: { xs: `-12px`, sm: 0 },
            px: { xs: '12px', sm: 0 },
            '&::-webkit-scrollbar': { height: 3 },
            '&::-webkit-scrollbar-thumb': { bgcolor: border, borderRadius: 2 },
            animation: 'home-up 0.4s ease both', animationDelay: '60ms',
            WebkitOverflowScrolling: 'touch',
          }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: { xs: 1.25, sm: 1.5 }, py: 0.55,
                    borderRadius: '20px', cursor: 'pointer', flexShrink: 0,
                    border: '1.5px solid',
                    fontSize: { xs: '0.72rem', sm: '0.78rem' },
                    fontWeight: active ? 700 : 500,
                    transition: 'all 0.15s',
                    bgcolor: active ? GP : 'transparent',
                    borderColor: active ? (isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)') : border,
                    color: active ? G : 'text.secondary',
                    userSelect: 'none',
                    '&:hover': { borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)', color: GL },
                  }}
                >
                  {cat.icon && <Box sx={{ color: 'inherit', display: 'flex', flexShrink: 0 }}>{cat.icon}</Box>}
                  <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', whiteSpace: 'nowrap' }}>{cat.label}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Feed tabs */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', mb: 2, borderBottom: `1px solid ${border}`, animation: 'home-up 0.4s ease both', animationDelay: '80ms' }}>
              {['Global Feed', 'For You'].map((label, i) => (
                <Box
                  key={label}
                  onClick={() => setFeedTab(i)}
                  sx={{
                    px: { xs: 1.5, sm: 2 }, py: 1, cursor: 'pointer',
                    borderBottom: feedTab === i ? `2.5px solid ${GL}` : '2.5px solid transparent',
                    color: feedTab === i ? GL : 'text.secondary',
                    fontWeight: feedTab === i ? 700 : 500,
                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                    mb: '-1px',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    '&:hover': { color: GL },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
          )}

          {/* Posts / empty state */}
          {displayPosts.length === 0 && !isLoading ? (
            <Box sx={{ animation: 'home-in 0.4s ease both' }}>
              <HomeCard sx={{ py: 5, px: { xs: 2, sm: 3 }, textAlign: 'center', mb: 2.5 }}>
                <ElectricCar sx={{ fontSize: 46, color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)', mb: 1.25 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>No posts yet</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 2 }}>Be the first to start a conversation!</Typography>
                <Button variant="contained" onClick={() => dispatch(openDialog({ type: 'createPost' }))}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', background: `linear-gradient(135deg,${G},${GL})`, boxShadow: '0 4px 14px rgba(46,125,50,0.3)' }}>
                  Start Discussion
                </Button>
              </HomeCard>

              <SectionHead icon={<Public sx={{ fontSize: 17 }} />} title="Global EV News" />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
                {newsArticles.slice(0, 6).map((a, i) => <NewsCard key={i} article={a} idx={i} />)}
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.75, animation: 'home-up 0.4s ease both', animationDelay: '100ms' }}>
                <Whatshot sx={{ fontSize: 17, color: '#EF5350' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Latest Activity</Typography>
              </Box>

              <Stack spacing={2} sx={{ animation: 'home-up 0.4s ease both', animationDelay: '120ms' }}>
                {displayPosts.map((post) => <PostCard key={post.id} post={post} />)}
              </Stack>

              {newsArticles.length > 0 && (
                <Box sx={{ mt: 4.5 }}>
                  <SectionHead icon={<Public sx={{ fontSize: 17 }} />} title="World Wide EV Trends" delay={0} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
                    {newsArticles.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} idx={i} />)}
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* ════ RIGHT: sidebar — hidden on mobile, shown lg+ ════ */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2, minWidth: 0 }}>

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
                    px: 1, py: 1, borderRadius: '9px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    animation: 'home-up 0.35s ease both',
                    animationDelay: `${140 + i * 50}ms`,
                    '&:hover': { bgcolor: isLight ? GP : 'rgba(67,160,71,0.08)' },
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.25)', lineHeight: 1.2, minWidth: 22, flexShrink: 0, mt: 0.1 }}>
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
          {shouldShowBusinessCta && (
          <Paper elevation={0} sx={{
            borderRadius: '14px', overflow: 'hidden',
            border: '1px solid rgba(216,67,21,0.2)',
            bgcolor: isLight ? '#FFF8F5' : 'rgba(216,67,21,0.06)',
            animation: 'home-up 0.4s ease both', animationDelay: '200ms',
          }}>
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #d84315, #ff8a65)' }} />
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg, #d84315, #ff8a65)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ElectricCar sx={{ fontSize: 18, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>EV Business Owner?</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6, mb: 1.75 }}>
                Register your company on DiscussEV to connect with thousands of verified EV owners.
              </Typography>
              <Button
                fullWidth variant="contained"
                onClick={() => navigate('/register-company')}
                sx={{
                  borderRadius: '9px', fontWeight: 700, textTransform: 'none', fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, #d84315, #ff8a65)',
                  boxShadow: '0 4px 12px rgba(216,67,21,0.3)',
                  '&:hover': { boxShadow: '0 6px 18px rgba(216,67,21,0.45)' },
                }}
              >
                Apply for Verification
              </Button>
            </Box>
          </Paper>
          )}

          {/* Join CTA */}
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
                  <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: `linear-gradient(135deg,${G},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChargingStation sx={{ fontSize: 18, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Join the Discussion</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.6, mb: 1.75 }}>
                  Share your EV journey with thousands of enthusiasts worldwide.
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '9px', fontWeight: 700, textTransform: 'none', fontSize: '0.8rem',
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
