import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, Avatar, Chip, Button, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Paper,
} from '@mui/material';
import {
  Delete, Visibility, CheckCircle, Cancel, VerifiedUser,
  AssignmentInd, ReportProblem, Forum, Shield, Warning,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserStatus, fetchReports, resolveReport, bootstrapAdmin } from '../store/slices/adminSlice';
import { fetchCompanies, verifyCompany } from '../store/slices/companySlice';
import { fetchPosts, deletePost } from '../store/slices/postSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

/* ── keyframes ── */
const injectKf = () => {
  if (document.getElementById('adm-kf')) return;
  const s = document.createElement('style');
  s.id = 'adm-kf';
  s.textContent = `
    @keyframes adm-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes adm-in { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
    @keyframes adm-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
  `;
  document.head.appendChild(s);
};

/* ── TabPanel ── */
const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Box sx={{ animation: 'adm-in 0.3s ease both' }}>{children}</Box>
    )}
  </div>
);

/* ── Section card ── */
const AdminCard = ({ children, sx = {} }) => (
  <Paper elevation={0} sx={{
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'rgba(46,125,50,0.15)',
    bgcolor: 'background.paper',
    overflow: 'hidden',
    ...sx,
  }}>
    {children}
  </Paper>
);

/* ── Table head cell ── */
const TH = ({ children, align }) => (
  <TableCell align={align} sx={{
    fontWeight: 700, fontSize: '0.67rem', letterSpacing: '0.09em',
    textTransform: 'uppercase', color: 'text.secondary',
    bgcolor: 'transparent', py: 1.5,
    borderBottom: '1px solid rgba(46,125,50,0.12)',
  }}>
    {children}
  </TableCell>
);

/* ── Table row ── */
const TR = ({ children, delay = 0 }) => (
  <TableRow sx={{
    animation: 'adm-up 0.35s ease both',
    animationDelay: `${delay}ms`,
    transition: 'background 0.15s',
    '&:hover': { bgcolor: 'rgba(46,125,50,0.03)' },
    '&:last-child td': { border: 0 },
  }}>
    {children}
  </TableRow>
);

/* ── Tab button ── */
const AdminTab = ({ icon, label, index, active, count, onClick }) => (
  <Box
    onClick={() => onClick(index)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 2, py: 1.25, cursor: 'pointer', borderRadius: '10px',
      transition: 'all 0.18s',
      bgcolor: active ? GP : 'transparent',
      border: '1.5px solid',
      borderColor: active ? 'rgba(67,160,71,0.4)' : 'transparent',
      color: active ? G : 'text.secondary',
      '&:hover': { bgcolor: active ? GP : 'rgba(46,125,50,0.05)', color: active ? G : 'text.primary' },
    }}
  >
    <Box sx={{ color: active ? GL : 'inherit', display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</Typography>
    {count != null && (
      <Box sx={{
        bgcolor: active ? GL : 'action.selected',
        color: active ? '#fff' : 'text.secondary',
        borderRadius: '10px', px: 0.85, lineHeight: 1.7,
        fontSize: '0.65rem', fontWeight: 700, minWidth: 18, textAlign: 'center',
      }}>
        {count}
      </Box>
    )}
  </Box>
);

/* ── Action icon button ── */
const ActionBtn = ({ title, icon, color, onClick, disabled }) => (
  <Tooltip title={title}>
    <span>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        size="small"
        sx={{
          width: 30, height: 30, borderRadius: '7px',
          bgcolor: disabled ? 'transparent' : `${color}12`,
          color: disabled ? 'text.disabled' : color,
          transition: 'all 0.15s',
          '&:hover:not(:disabled)': { bgcolor: `${color}22`, transform: 'scale(1.08)' },
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 16 } })}
      </IconButton>
    </span>
  </Tooltip>
);

/* ── Empty state ── */
const Empty = ({ message }) => (
  <Box sx={{ py: 6, textAlign: 'center' }}>
    <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>{message}</Typography>
  </Box>
);

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  const { users, reports, isLoadingUsers, isLoadingReports } = useSelector((s) => s.admin);
  const { companies, isLoading: isLoadingCompanies } = useSelector((s) => s.companies);
  const { posts, isLoading: isLoadingPosts } = useSelector((s) => s.posts);

  useEffect(() => { injectKf(); }, []);

  useEffect(() => {
    if (tabValue === 0 && users.length === 0) dispatch(fetchAllUsers());
    if (tabValue === 1 && posts.length === 0) dispatch(fetchPosts({ limit: 50 }));
    if (tabValue === 2 && reports.length === 0) dispatch(fetchReports());
    if (tabValue === 3 && companies.length === 0) dispatch(fetchCompanies());
  }, [tabValue, dispatch, users.length, posts.length, reports.length, companies.length]);

  const handleToggleStatus = async (user) => {
    try {
      await dispatch(toggleUserStatus({ id: user.id, isActive: !user.isActive })).unwrap();
      dispatch(showSnackbar({ message: `User ${!user.isActive ? 'activated' : 'deactivated'}.`, severity: 'success' }));
    } catch (e) {
      dispatch(showSnackbar({ message: e || 'Failed to update status', severity: 'error' }));
    }
  };

  const handleConfirmDeletePost = async () => {
    try {
      await dispatch(deletePost(selectedItem.id)).unwrap();
      dispatch(showSnackbar({ message: 'Post deleted.', severity: 'success' }));
      setDialogOpen(false);
    } catch (e) {
      dispatch(showSnackbar({ message: e || 'Failed to delete post.', severity: 'error' }));
    }
  };

  const handleResolveReport = async (reportId, status, targetId) => {
    try {
      await dispatch(resolveReport({ id: reportId, status })).unwrap();
      if (status === 'resolved' && targetId) {
        await dispatch(deletePost(targetId)).unwrap();
        dispatch(showSnackbar({ message: 'Report resolved and content removed.', severity: 'success' }));
      } else {
        dispatch(showSnackbar({ message: 'Report dismissed.', severity: 'info' }));
      }
    } catch (e) {
      dispatch(showSnackbar({ message: e || 'Failed to update report', severity: 'error' }));
    }
  };

  const handleVerifyCompany = async (id, status) => {
    try {
      await dispatch(verifyCompany({ id, status })).unwrap();
      dispatch(showSnackbar({ message: `Company ${status}.`, severity: 'success' }));
    } catch (e) {
      dispatch(showSnackbar({ message: e || 'Failed to update company.', severity: 'error' }));
    }
  };

  const openConfirmDialog = (item, type) => { setSelectedItem(item); setDialogType(type); setDialogOpen(true); };

  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'pending').length;

  const tabs = [
    { icon: <AssignmentInd sx={{ fontSize: 18 }} />, label: 'Users', count: users.length || null },
    { icon: <Forum sx={{ fontSize: 18 }} />, label: 'Global Feed', count: posts.length || null },
    { icon: <ReportProblem sx={{ fontSize: 18 }} />, label: 'Moderation', count: pendingReports || null },
    { icon: <VerifiedUser sx={{ fontSize: 18 }} />, label: 'Companies', count: pendingCompanies || null },
  ];

  if (isLoadingUsers && tabValue === 0) return <LoadingSpinner message="Loading Admin Panel…" />;

  return (
    <Box sx={{
      width: '100%', minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 3, md: 4 },
      px: { xs: 2, sm: 3, md: 4 },
      boxSizing: 'border-box',
    }}>

      {/* ── Header ── */}
      <Box sx={{
        mb: 3.5, display: 'flex', flexWrap: 'wrap',
        alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
        animation: 'adm-up 0.4s ease both',
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: `linear-gradient(135deg,${G},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(46,125,50,0.35)', flexShrink: 0 }}>
              <Shield sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.4px' }}>
              Master Control Panel
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage users, moderate content, resolve reports, and verify businesses.
          </Typography>
        </Box>

        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {[
            { label: 'Users', value: users.length, color: GL },
            { label: 'Reports', value: pendingReports, color: '#EF5350' },
            { label: 'Pending', value: pendingCompanies, color: '#FF8F00' },
          ].map((s) => (
            <Box key={s.label} sx={{ px: 2, py: 0.85, borderRadius: '10px', bgcolor: 'background.paper', border: '1px solid rgba(46,125,50,0.12)', textAlign: 'center', minWidth: 64 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.67rem', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Tab strip ── */}
      <Box sx={{
        display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2,
        animation: 'adm-up 0.4s ease both', animationDelay: '60ms',
      }}>
        {tabs.map((t, i) => (
          <AdminTab key={t.label} index={i} active={tabValue === i} onClick={setTabValue} {...t} />
        ))}
      </Box>

      {/* ── Content ── */}
      <AdminCard sx={{ animation: 'adm-in 0.35s ease both', animationDelay: '100ms' }}>

        {/* ── TAB 0: USERS ── */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer sx={{ '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(46,125,50,0.2)', borderRadius: 2 } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TH>User</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH align="right">Block / Unblock</TH>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, i) => (
                  <TR key={user.id} delay={i * 30}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user.avatar} sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: G, border: '1.5px solid rgba(67,160,71,0.35)' }}>{user.firstName?.[0]}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2 }}>{user.firstName} {user.lastName}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>@{user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}><Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{user.email}</Typography></TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25, borderRadius: '6px', bgcolor: user.role === 'admin' ? 'rgba(211,47,47,0.1)' : user.role === 'moderator' ? 'rgba(255,143,0,0.1)' : GP, border: `1px solid ${user.role === 'admin' ? 'rgba(211,47,47,0.25)' : user.role === 'moderator' ? 'rgba(255,143,0,0.3)' : 'rgba(67,160,71,0.3)'}` }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: user.role === 'admin' ? '#C62828' : user.role === 'moderator' ? '#E65100' : GL }}>{user.role}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: user.isActive ? GL : '#EF5350', ...(user.isActive ? { animation: 'adm-pulse 2s ease infinite' } : {}) }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: user.isActive ? GL : '#EF5350' }}>{user.isActive ? 'Active' : 'Blocked'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleStatus(user)}
                        disabled={user.role === 'admin'}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: GL },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: GL },
                        }}
                      />
                    </TableCell>
                  </TR>
                ))}
                {users.length === 0 && <TableRow><TableCell colSpan={5}><Empty message="No users found." /></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ── TAB 1: POSTS ── */}
        <TabPanel value={tabValue} index={1}>
          {isLoadingPosts ? <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></Box> : (
            <TableContainer sx={{ '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(46,125,50,0.2)', borderRadius: 2 } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TH>Title & Snippet</TH>
                    <TH>Author</TH>
                    <TH>Date</TH>
                    <TH align="right">Actions</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map((post, i) => (
                    <TR key={post.id} delay={i * 25}>
                      <TableCell sx={{ py: 1.5, maxWidth: 340 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 0.25 }}>{post.title}</Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.78rem' }}>{post.author?.firstName} {post.author?.lastName}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{new Date(post.createdAt).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
                          <ActionBtn title="View Post" icon={<Visibility />} color={GL} onClick={() => window.open(`/post/${post.id}`, '_blank')} />
                          <ActionBtn title="Force Delete" icon={<Delete />} color="#EF5350" onClick={() => openConfirmDialog(post, 'delete_post')} />
                        </Box>
                      </TableCell>
                    </TR>
                  ))}
                  {posts.length === 0 && <TableRow><TableCell colSpan={4}><Empty message="No posts found." /></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* ── TAB 2: REPORTS ── */}
        <TabPanel value={tabValue} index={2}>
          {isLoadingReports ? <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></Box> : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TH>Reason</TH>
                    <TH>Type</TH>
                    <TH>Target ID</TH>
                    <TH>Status</TH>
                    <TH align="right">Adjudicate</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report, i) => {
                    const isPending = report.status === 'pending';
                    const isResolved = report.status === 'resolved';
                    return (
                      <TR key={report.id} delay={i * 25}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Warning sx={{ fontSize: 14, color: '#EF5350', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#C62828' }}>{report.reason}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'inline-flex', px: 1, py: 0.25, borderRadius: '6px', border: '1px solid rgba(46,125,50,0.25)', bgcolor: GP }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: G, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{report.targetType}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography sx={{ fontSize: '0.73rem', fontFamily: 'monospace', color: 'text.secondary', bgcolor: 'action.hover', px: 0.8, borderRadius: '5px', display: 'inline' }}>
                            {report.targetId.substring(0, 8)}…
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isPending ? '#FF8F00' : isResolved ? GL : 'text.disabled', ...(isPending ? { animation: 'adm-pulse 1.8s ease infinite' } : {}) }} />
                            <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: isPending ? '#FF8F00' : isResolved ? GL : 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{report.status}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
                            <ActionBtn title="Resolve & Remove Content" icon={<CheckCircle />} color="#EF5350" disabled={!isPending} onClick={() => handleResolveReport(report.id, 'resolved', report.targetId)} />
                            <ActionBtn title="Dismiss" icon={<Cancel />} color="text.secondary" disabled={!isPending} onClick={() => handleResolveReport(report.id, 'dismissed', null)} />
                          </Box>
                        </TableCell>
                      </TR>
                    );
                  })}
                  {reports.length === 0 && <TableRow><TableCell colSpan={5}><Empty message="Moderation queue is empty. Good job!" /></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* ── TAB 3: COMPANIES ── */}
        <TabPanel value={tabValue} index={3}>
          {isLoadingCompanies ? <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></Box> : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TH>Company</TH>
                    <TH>Description</TH>
                    <TH>Status</TH>
                    <TH align="right">Verify</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.map((company, i) => {
                    const st = company.verificationStatus;
                    const statusColor = st === 'approved' ? GL : st === 'pending' ? '#FF8F00' : '#EF5350';
                    return (
                      <TR key={company.id} delay={i * 25}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: GP, border: '1px solid rgba(67,160,71,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <VerifiedUser sx={{ fontSize: 15, color: GL }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{company.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, maxWidth: 280 }}>
                          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{company.description}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, ...(st === 'pending' ? { animation: 'adm-pulse 1.8s ease infinite' } : {}) }} />
                            <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
                            <ActionBtn title="Approve" icon={<CheckCircle />} color={GL} disabled={st === 'approved'} onClick={() => handleVerifyCompany(company.id, 'approved')} />
                            <ActionBtn title="Reject" icon={<Cancel />} color="#EF5350" disabled={st === 'rejected'} onClick={() => handleVerifyCompany(company.id, 'rejected')} />
                          </Box>
                        </TableCell>
                      </TR>
                    );
                  })}
                  {companies.length === 0 && <TableRow><TableCell colSpan={4}><Empty message="No companies registered." /></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </AdminCard>

      {/* ── Confirm dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '16px',
            border: '1px solid rgba(239,83,80,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            minWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: 'rgba(239,83,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Delete sx={{ fontSize: 18, color: '#EF5350' }} />
          </Box>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this content? This action <strong>cannot be undone</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', color: 'text.secondary', border: '1px solid', borderColor: 'divider', px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={dialogType === 'delete_post' ? handleConfirmDeletePost : () => setDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#EF5350', '&:hover': { bgcolor: '#C62828' }, boxShadow: '0 4px 14px rgba(239,83,80,0.3)', px: 2.5 }}
          >
            Force Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;