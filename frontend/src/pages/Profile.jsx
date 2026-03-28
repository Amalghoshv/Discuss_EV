import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Avatar, Button, Paper, Tab, Tabs,
  Card, CardContent, Chip, Stack, useTheme,
} from '@mui/material';
import {
  PersonAdd, PersonRemove, LocationOn, CalendarToday,
  Email, Forum, Timeline, ElectricCar, ArrowForward,
  Edit, Verified, BusinessCenter,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserProfile, followUser, unfollowUser, clearProfile } from '../store/slices/userSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

/* ── keyframes ── */
const injectKf = () => {
  if (document.getElementById('prof-kf')) return;
  const s = document.createElement('style');
  s.id = 'prof-kf';
  s.textContent = `
    @keyframes prof-up   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes prof-in   { from{opacity:0;transform:scale(.95)}        to{opacity:1;transform:scale(1)} }
    @keyframes prof-fade { from{opacity:0} to{opacity:1} }
    @keyframes prof-scan {
      0%   { background-position: 200% center; }
      100% { background-position:-200% center; }
    }
  `;
  document.head.appendChild(s);
};

/* ── stat pill ── */
const StatPill = ({ value, label, delay }) => (
  <Box sx={{
    textAlign: 'center', flex: 1,
    animation: 'prof-up 0.4s ease both',
    animationDelay: `${delay}ms`,
  }}>
    <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.1, color: G }}>{value ?? 0}</Typography>
    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', mt: 0.25 }}>{label}</Typography>
  </Box>
);

/* ── info row ── */
const InfoRow = ({ icon, label, value, delay }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      animation: 'prof-up 0.4s ease both', animationDelay: `${delay}ms`,
    }}>
      <Box sx={{
        width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
        bgcolor: isLight ? GP : 'rgba(67,160,71,0.12)',
        border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 16, color: GL } })}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.67rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
      </Box>
    </Box>
  );
};

/* ════════════════════════════
   MAIN
════════════════════════════ */
const Profile = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { currentProfile, isLoading, followLoading, error } = useSelector((s) => s.user);
  const { user: currentUser, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    injectKf();
    const profileId = id || currentUser?.id;
    if (profileId) dispatch(fetchUserProfile(profileId));
    return () => dispatch(clearProfile());
  }, [dispatch, id, currentUser]);

  const handleFollowToggle = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    currentProfile.isFollowing ? dispatch(unfollowUser(id)) : dispatch(followUser(id));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  if (isLoading) return <LoadingSpinner message="Loading profile…" />;

  if (error || !currentProfile) return (
    <Box sx={{ py: 10, textAlign: 'center', px: 2 }}>
      <Typography variant="h5" color="text.secondary">{error || 'User not found'}</Typography>
      <Button variant="contained" sx={{ mt: 3, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }} onClick={() => navigate('/')}>
        Back to Discussions
      </Button>
    </Box>
  );

  const isOwnProfile = currentUser && String(currentUser.id) === String(currentProfile.id);
  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';
  const isApprovedCompanyProfile = currentProfile.company?.verificationStatus === 'approved';
  const displayName = isApprovedCompanyProfile
    ? currentProfile.company.name
    : `${currentProfile.firstName} ${currentProfile.lastName}`;
  const secondaryLabel = isApprovedCompanyProfile
    ? `Managed by ${currentProfile.firstName} ${currentProfile.lastName}`
    : `@${currentProfile.username}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isLight ? '#F2F6F2' : '#0A160B', pb: 8, overflowX: 'hidden' }}>

      {/* ── Hero banner ── */}
      <Box sx={{
        position: 'relative',
        height: { xs: 140, md: 200 },
        background: `linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #00796B 100%)`,
        overflow: 'hidden',
      }}>
        {/* Decorative EV icon watermark */}
        <ElectricCar sx={{
          position: 'absolute', right: -20, bottom: -30,
          fontSize: { xs: 160, md: 220 },
          color: 'rgba(255,255,255,0.06)',
          transform: 'scaleX(-1)',
        }} />
        {/* Subtle grid pattern overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }} />
      </Box>

      {/* ── Avatar + name row ── */}
      <Box sx={{
        px: { xs: 2, sm: 3, md: 5, xl: 8 },
        mt: { xs: '-55px', md: '-72px' },
        position: 'relative', zIndex: 1,
        mb: 3,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: { xs: 1.5, md: 3 },
        }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative', flexShrink: 0, animation: 'prof-in 0.5s ease both' }}>
            <Avatar
              src={currentProfile.avatar}
              sx={{
                width: { xs: 100, md: 130 },
                height: { xs: 100, md: 130 },
                border: `4px solid ${isLight ? '#fff' : '#0A160B'}`,
                boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
                bgcolor: G, fontSize: '2.5rem',
              }}
            >
              {currentProfile.firstName?.[0]}
            </Avatar>
            {/* Online dot */}
            <Box sx={{
              position: 'absolute', bottom: 6, right: 6,
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: GL,
              border: `2.5px solid ${isLight ? '#fff' : '#0A160B'}`,
            }} />
          </Box>

          {/* Name block */}
          <Box sx={{
            flex: 1,
            textAlign: { xs: 'center', md: 'left' },
            pb: { md: 1 },
            animation: 'prof-up 0.45s ease both',
            animationDelay: '80ms',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                {displayName}
              </Typography>
              {(currentProfile.role === 'admin' || currentProfile.isVerified || isApprovedCompanyProfile) && (
                <Verified sx={{ color: '#1E88E5', fontSize: 20 }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
              {secondaryLabel}
            </Typography>
            {isApprovedCompanyProfile && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1, px: 1.1, py: 0.35, borderRadius: '999px', bgcolor: isLight ? GP : 'rgba(67,160,71,0.12)', border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.25)'}` }}>
                <BusinessCenter sx={{ fontSize: 14, color: GL }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: GL, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Verified Company Profile
                </Typography>
              </Box>
            )}
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: isApprovedCompanyProfile ? 0.75 : 0.35, fontWeight: 500 }}>
              @{currentProfile.username}
            </Typography>
            {currentProfile.bio && (
              <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary', mt: 0.75, maxWidth: 480, lineHeight: 1.55, display: { xs: 'none', md: 'block' } }}>
                {isApprovedCompanyProfile ? currentProfile.company?.description || currentProfile.bio : currentProfile.bio}
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.25, pb: { md: 1 }, animation: 'prof-up 0.45s ease both', animationDelay: '140ms' }}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<Edit sx={{ fontSize: '16px !important' }} />}
                onClick={() => navigate('/settings')}
                sx={{
                  borderRadius: '10px', px: 2.5, py: 0.8,
                  fontWeight: 700, fontSize: '0.82rem', textTransform: 'none',
                  borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)',
                  color: GL,
                  '&:hover': { bgcolor: GP, borderColor: GL },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={currentProfile.isFollowing ? 'outlined' : 'contained'}
                startIcon={currentProfile.isFollowing
                  ? <PersonRemove sx={{ fontSize: '16px !important' }} />
                  : <PersonAdd sx={{ fontSize: '16px !important' }} />}
                onClick={handleFollowToggle}
                disabled={followLoading}
                sx={{
                  borderRadius: '10px', px: 2.5, py: 0.8,
                  fontWeight: 700, fontSize: '0.82rem', textTransform: 'none',
                  ...(currentProfile.isFollowing ? {
                    borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)',
                    color: GL,
                    '&:hover': { bgcolor: GP, borderColor: GL },
                  } : {
                    background: `linear-gradient(135deg, ${G}, ${GL})`,
                    boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
                    '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.4)' },
                  }),
                }}
              >
                {currentProfile.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Body: sidebar + feed ── */}
      <Box sx={{
        px: { xs: 2, sm: 3, md: 5, xl: 8 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
        gap: 2.5,
        alignItems: 'start',
      }}>

        {/* ── LEFT sidebar ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Bio on mobile */}
          {currentProfile.bio && (
            <Paper elevation={0} sx={{ display: { xs: 'block', md: 'none' }, p: 2, borderRadius: '14px', border: `1px solid ${border}`, bgcolor: isLight ? '#fff' : '#0F1E12' }}>
              <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary', lineHeight: 1.6 }}>{currentProfile.bio}</Typography>
            </Paper>
          )}

          {/* Stats card */}
          <Paper elevation={0} sx={{
            borderRadius: '14px', border: `1px solid ${border}`,
            bgcolor: isLight ? '#fff' : '#0F1E12',
            overflow: 'hidden',
            animation: 'prof-up 0.45s ease both', animationDelay: '160ms',
          }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Community Stats</Typography>
            </Box>
            <Box sx={{ display: 'flex', px: 2, py: 2.5, gap: 1 }}>
              <StatPill value={currentProfile.posts?.length} label="Posts" delay={200} />
              <Box sx={{ width: '1px', bgcolor: border, mx: 0.5 }} />
              <StatPill value={currentProfile.followerCount} label="Followers" delay={250} />
              <Box sx={{ width: '1px', bgcolor: border, mx: 0.5 }} />
              <StatPill value={currentProfile.followingCount} label="Following" delay={300} />
            </Box>
          </Paper>

          {/* About card */}
          <Paper elevation={0} sx={{
            borderRadius: '14px', border: `1px solid ${border}`,
            bgcolor: isLight ? '#fff' : '#0F1E12',
            overflow: 'hidden',
            animation: 'prof-up 0.45s ease both', animationDelay: '220ms',
          }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>About</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isApprovedCompanyProfile && (
                <InfoRow icon={<BusinessCenter />} label="Company" value={currentProfile.company?.name} delay={240} />
              )}
              <InfoRow icon={<LocationOn />} label="Location" value="Planet Earth" delay={260} />
              <InfoRow icon={<CalendarToday />} label="Joined" value={formatDate(currentProfile.createdAt)} delay={300} />
              <InfoRow icon={<Email />} label="Contact" value={currentProfile.email} delay={340} />
            </Box>
          </Paper>

          {/* Role badge */}
          {currentProfile.role && (
            <Paper elevation={0} sx={{
              borderRadius: '14px', border: `1px solid ${border}`,
              bgcolor: isLight ? '#fff' : '#0F1E12', px: 2.5, py: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: 'prof-up 0.45s ease both', animationDelay: '360ms',
            }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Account type</Typography>
              <Box sx={{
                px: 1.25, py: 0.35, borderRadius: '7px',
                bgcolor: currentProfile.role === 'admin' ? 'rgba(211,47,47,0.1)' : GP,
                border: `1px solid ${currentProfile.role === 'admin' ? 'rgba(211,47,47,0.25)' : 'rgba(67,160,71,0.3)'}`,
              }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: currentProfile.role === 'admin' ? '#C62828' : GL }}>
                  {isApprovedCompanyProfile ? 'company profile' : currentProfile.role}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        {/* ── RIGHT: feed ── */}
        <Box sx={{ animation: 'prof-up 0.45s ease both', animationDelay: '180ms' }}>
          {/* Tab strip */}
          <Box sx={{
            display: 'flex', gap: 0.75, mb: 2.5,
            borderBottom: `1px solid ${border}`, pb: 0,
          }}>
            {[
              { icon: <Forum sx={{ fontSize: 16 }} />, label: 'Posts' },
              { icon: <Timeline sx={{ fontSize: 16 }} />, label: 'Activity' },
            ].map(({ icon, label }, i) => (
              <Box
                key={label}
                onClick={() => setActiveTab(i)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 2, py: 1.25, cursor: 'pointer',
                  borderBottom: activeTab === i ? `2.5px solid ${GL}` : '2.5px solid transparent',
                  color: activeTab === i ? GL : 'text.secondary',
                  fontWeight: activeTab === i ? 700 : 500,
                  fontSize: '0.85rem',
                  transition: 'all 0.15s',
                  mb: '-1px',
                  '&:hover': { color: GL },
                }}
              >
                <Box sx={{ color: 'inherit', display: 'flex' }}>{icon}</Box>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Posts tab */}
          {activeTab === 0 && (
            <Stack spacing={2} sx={{ animation: 'prof-in 0.3s ease both' }}>
              {currentProfile.posts?.length > 0 ? (
                currentProfile.posts.map((post, i) => (
                  <Paper
                    key={post.id}
                    elevation={0}
                    onClick={() => navigate(`/post/${post.id}`)}
                    sx={{
                      borderRadius: '14px',
                      border: `1px solid ${border}`,
                      bgcolor: isLight ? '#fff' : '#0F1E12',
                      p: 2.5, cursor: 'pointer',
                      transition: 'all 0.18s',
                      animation: 'prof-up 0.35s ease both',
                      animationDelay: `${i * 50}ms`,
                      '&:hover': {
                        borderColor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)',
                        boxShadow: `0 4px 20px ${isLight ? 'rgba(46,125,50,0.08)' : 'rgba(0,0,0,0.3)'}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                      {post.category && (
                        <Box sx={{ px: 1.1, py: 0.3, borderRadius: '6px', bgcolor: GP, border: '1px solid rgba(67,160,71,0.3)' }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: GL, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{post.category}</Typography>
                        </Box>
                      )}
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', ml: 'auto' }}>
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', mb: 0.75, lineHeight: 1.35 }}>{post.title}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.75 }}>
                      {post.content}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: GL }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: GL }}>View discussion</Typography>
                        <ArrowForward sx={{ fontSize: 13, color: GL }} />
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Paper elevation={0} sx={{
                  borderRadius: '14px', border: `1px solid ${border}`,
                  bgcolor: isLight ? '#fff' : '#0F1E12',
                  py: 7, textAlign: 'center',
                }}>
                  <ElectricCar sx={{ fontSize: 48, color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)', mb: 1.5 }} />
                  <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>No posts yet. This motor hasn't started.</Typography>
                </Paper>
              )}
            </Stack>
          )}

          {/* Activity tab */}
          {activeTab === 1 && (
            <Paper elevation={0} sx={{
              borderRadius: '14px', border: `1px solid ${border}`,
              bgcolor: isLight ? '#fff' : '#0F1E12',
              py: 7, textAlign: 'center',
              animation: 'prof-in 0.3s ease both',
            }}>
              <Timeline sx={{ fontSize: 44, color: isLight ? '#C8E6C9' : 'rgba(67,160,71,0.2)', mb: 1.5 }} />
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Liked posts and followed users will appear here.</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
