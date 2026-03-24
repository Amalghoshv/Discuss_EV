import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Paper, useTheme,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip,
} from '@mui/material';
import analyticsService from '../services/analyticsService';
import adminService from '../services/adminService';
import { BarChart as BarChartIcon, Group, TrendingUp, Chat, Tag, ElectricBolt } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

/* ── palette ── */
const GREEN = '#2E7D32';
const GREEN_LIGHT = '#43A047';
const GREEN_PALE = '#E8F5E9';
const CHART_COLORS = ['#2E7D32', '#43A047', '#81C784', '#C8E6C9'];

/* ── keyframes ── */
const injectKeyframes = () => {
  if (document.getElementById('adash-kf')) return;
  const s = document.createElement('style');
  s.id = 'adash-kf';
  s.textContent = `
    @keyframes adash-fade-up {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes adash-scale-in {
      from { opacity:0; transform:scale(0.94); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes adash-pulse-dot {
      0%,100% { transform:scale(1); opacity:1; }
      50%      { transform:scale(1.7); opacity:.4; }
    }
  `;
  document.head.appendChild(s);
};

/* ── animated counter ── */
const useCounter = (target, duration = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
};

/* ── stat card ── */
const StatCard = ({ title, value, icon, gradient, delay = 0 }) => {
  const n = useCounter(value);
  return (
    <Box sx={{
      borderRadius: '14px',
      background: gradient,
      p: 2.5,
      display: 'flex', alignItems: 'center', gap: 2,
      color: '#fff',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
      animation: 'adash-fade-up 0.5s ease both',
      animationDelay: `${delay}ms`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(0,0,0,0.2)' },
    }}>
      <Box sx={{ position: 'absolute', right: -18, top: -18, width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ width: 46, height: 46, borderRadius: '11px', bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>{title}</Typography>
        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1, mt: 0.25 }}>{n.toLocaleString()}</Typography>
      </Box>
    </Box>
  );
};

/* ── dash card shell ── */
const DashCard = ({ children, sx = {} }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Paper elevation={0} sx={{
      borderRadius: '14px',
      border: '1px solid',
      borderColor: isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)',
      bgcolor: isLight ? '#fff' : '#0F1E12',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...sx,
    }}>
      {children}
    </Paper>
  );
};

/* ── custom recharts tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#1B2E1C', color: '#fff', px: 2, py: 1.25, borderRadius: '10px', fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
      <Typography sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.76rem' }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} sx={{ fontSize: '0.8rem', color: GREEN_LIGHT }}>
          {p.name ?? p.dataKey}: <strong>{p.value?.toLocaleString()}</strong>
        </Typography>
      ))}
    </Box>
  );
};

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ engagement: null, growth: null, popularTags: [], users: [] });
  const [error, setError] = useState(null);

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [eRes, gRes, tRes, uRes] = await Promise.all([
          analyticsService.getEngagement(),
          analyticsService.getGrowth(),
          analyticsService.getPopularTags(),
          adminService.getAllUsers(),
        ]);
        setData({ engagement: eRes.engagement, growth: gRes.growth, popularTags: tRes.popularTags, users: uRes.users || [] });
      } catch { setError('Failed to load analytics data.'); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ── loading ── */
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
      <Box sx={{ width: 50, height: 50, borderRadius: '13px', background: `linear-gradient(135deg,${GREEN},${GREEN_LIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'adash-pulse-dot 1.4s ease infinite' }}>
        <ElectricBolt sx={{ color: '#fff', fontSize: 24 }} />
      </Box>
      <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>Loading analytics…</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light', color: 'error.dark', borderRadius: 3, m: 3 }}>
      <Typography variant="h6">{error}</Typography>
    </Box>
  );

  const { engagement, growth, popularTags, users } = data;

  const growthData = [
    { name: 'Total', value: growth?.totalUsers || 0 },
    { name: 'Active', value: growth?.activeUsers || 0 },
    { name: 'Verified', value: growth?.verifiedUsers || 0 },
  ];
  const engagementData = [
    { name: 'Posts', value: engagement?.totalPosts || 0 },
    { name: 'Comments', value: engagement?.totalComments || 0 },
    { name: 'Reactions', value: engagement?.totalReactions || 0 },
  ];

  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      bgcolor: isLight ? '#F2F6F2' : '#0A160B',
      py: { xs: 3, md: 4 },
      px: { xs: 2, sm: 3, md: 4 },
      boxSizing: 'border-box',
    }}>

      {/* ── Header ── */}
      <Box sx={{
        mb: 3,
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 1.5,
        animation: 'adash-fade-up 0.4s ease both',
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: `linear-gradient(135deg,${GREEN},${GREEN_LIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px rgba(46,125,50,0.35)` }}>
              <BarChartIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.4px' }}>
              Platform Analytics
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            Monitor growth, engagement, and content trends in one place.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: isLight ? GREEN_PALE : 'rgba(67,160,71,0.12)', border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)'}`, borderRadius: '20px', px: 1.75, py: 0.6 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: GREEN_LIGHT, animation: 'adash-pulse-dot 1.6s ease infinite' }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: GREEN_LIGHT, letterSpacing: '0.07em' }}>LIVE DATA</Typography>
        </Box>
      </Box>

      {/* ── Stat cards — 3 equal columns, always full width ── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
        gap: 2,
        mb: 2.5,
      }}>
        <Box sx={{ animation: 'adash-fade-up 0.5s ease both', animationDelay: '80ms' }}>
          <StatCard title="Total Users" value={growth?.totalUsers || 0} icon={<Group sx={{ color: '#fff', fontSize: 22 }} />} gradient={`linear-gradient(135deg,#1B5E20,${GREEN_LIGHT})`} delay={80} />
        </Box>
        <Box sx={{ animation: 'adash-fade-up 0.5s ease both', animationDelay: '160ms' }}>
          <StatCard title="Engagement Score" value={engagement?.engagementScore || 0} icon={<Chat sx={{ color: '#fff', fontSize: 22 }} />} gradient="linear-gradient(135deg,#E65100,#FF8F00)" delay={160} />
        </Box>
        <Box sx={{ animation: 'adash-fade-up 0.5s ease both', animationDelay: '240ms' }}>
          <StatCard title="Active Participants" value={growth?.activeUsers || 0} icon={<TrendingUp sx={{ color: '#fff', fontSize: 22 }} />} gradient="linear-gradient(135deg,#006064,#00ACC1)" delay={240} />
        </Box>
      </Box>

      {/* ── Charts — 2 columns, always full width ── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
        gap: 2,
        mb: 2.5,
        animation: 'adash-scale-in 0.5s ease both',
        animationDelay: '300ms',
      }}>
        {/* Pie */}
        <DashCard>
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>User Demographics</Typography>
            <Typography variant="caption" color="text.secondary">Total vs active vs verified</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 280, px: 1, pb: 2 }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={growthData} cx="50%" cy="45%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="value" animationBegin={400} animationDuration={900}>
                  {growthData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} stroke="none" />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.76rem', color: isLight ? '#555' : '#aaa' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </DashCard>

        {/* Bar */}
        <DashCard>
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Content Engagement</Typography>
            <Typography variant="caption" color="text.secondary">Posts · Comments · Reactions</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 280, px: 1, pb: 2, pr: 2 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={engagementData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} barCategoryGap="38%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GREEN_LIGHT} />
                    <stop offset="100%" stopColor={GREEN} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#E4EDE4' : 'rgba(255,255,255,0.06)'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#777' : '#888', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#777' : '#888', fontSize: 11 }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" name="Count" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={60} animationBegin={500} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DashCard>
      </Box>

      {/* ── Bottom — tags + user table, always full width ── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '4fr 8fr' },
        gap: 2,
        animation: 'adash-scale-in 0.5s ease both',
        animationDelay: '420ms',
      }}>
        {/* Trending tags */}
        <DashCard>
          <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Trending Topics</Typography>
            <Typography variant="caption" color="text.secondary">Most used tags on platform</Typography>
          </Box>
          <Box sx={{ flex: 1, px: 2.5, py: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignContent: 'flex-start' }}>
            {popularTags.length === 0
              ? <Typography color="text.secondary" variant="body2">No active trends yet.</Typography>
              : popularTags.map((tag, i) => (
                <Box key={tag.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  bgcolor: isLight ? GREEN_PALE : 'rgba(67,160,71,0.1)',
                  border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.25)'}`,
                  px: 1.25, py: 0.55, borderRadius: '20px',
                  animation: 'adash-fade-up 0.4s ease both',
                  animationDelay: `${480 + i * 45}ms`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(46,125,50,0.15)' },
                }}>
                  <Tag sx={{ fontSize: '0.8rem', color: GREEN_LIGHT }} />
                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: isLight ? GREEN : GREEN_LIGHT }}>{tag.name}</Typography>
                  <Box sx={{ bgcolor: isLight ? '#fff' : 'rgba(255,255,255,0.1)', px: 0.65, borderRadius: '10px', ml: 0.2 }}>
                    <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary', fontWeight: 600 }}>{tag.usageCount}</Typography>
                  </Box>
                </Box>
              ))
            }
          </Box>
        </DashCard>

        {/* User directory */}
        <DashCard>
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>User Directory</Typography>
              <Typography variant="caption" color="text.secondary">Recent platform members</Typography>
            </Box>
            <Chip label={`${users.length} total`} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: isLight ? GREEN_PALE : 'rgba(67,160,71,0.15)', color: GREEN_LIGHT, border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)'}` }} />
          </Box>

          <TableContainer sx={{ flex: 1, '&::-webkit-scrollbar': { width: 4, height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: isLight ? '#C8E6C9' : 'rgba(255,255,255,0.1)', borderRadius: 3 } }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['User', 'Email', 'Role', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.67rem', letterSpacing: '0.08em', textTransform: 'uppercase', bgcolor: isLight ? '#F2F6F2' : '#0F1E12', color: 'text.secondary', py: 1.2, borderBottom: `1px solid ${border}` }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(0, 15).map((user, i) => (
                  <TableRow key={user.id} sx={{ animation: 'adash-fade-up 0.35s ease both', animationDelay: `${540 + i * 35}ms`, transition: 'background 0.15s', '&:hover': { bgcolor: isLight ? '#F2F6F2' : 'rgba(67,160,71,0.05)' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar src={user.avatar} alt={user.username} sx={{ width: 26, height: 26, fontSize: '0.72rem', bgcolor: GREEN, border: `1.5px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}` }}>{user.firstName?.[0]}</Avatar>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.firstName} {user.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}><Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>{user.email}</Typography></TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Chip label={user.role} size="small" sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700, bgcolor: user.role === 'admin' ? 'rgba(211,47,47,0.1)' : isLight ? GREEN_PALE : 'rgba(67,160,71,0.12)', color: user.role === 'admin' ? '#C62828' : GREEN_LIGHT, border: `1px solid ${user.role === 'admin' ? 'rgba(211,47,47,0.25)' : 'rgba(67,160,71,0.3)'}` }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: user.isActive ? GREEN_LIGHT : '#EF5350', ...(user.isActive ? { animation: 'adash-pulse-dot 2s ease infinite' } : {}) }} />
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: user.isActive ? GREEN_LIGHT : '#EF5350' }}>{user.isActive ? 'Active' : 'Banned'}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><Typography color="text.secondary" variant="body2">No users found.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DashCard>
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;