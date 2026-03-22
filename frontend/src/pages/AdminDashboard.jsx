import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Avatar,
  Chip, Button, Tabs, Tab, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Delete, Visibility, CheckCircle, Cancel, VerifiedUser, Lock, AssignmentInd, ReportProblem, Forum } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserStatus, fetchReports, resolveReport, bootstrapAdmin } from '../store/slices/adminSlice';
import { fetchCompanies, verifyCompany } from '../store/slices/companySlice';
import { fetchPosts, deletePost } from '../store/slices/postSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (<Box sx={{ pt: 3 }}>{children}</Box>)}
    </div>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  const { users, reports, isLoadingUsers, isLoadingReports } = useSelector((state) => state.admin);
  const { companies, isLoading: isLoadingCompanies } = useSelector((state) => state.companies);
  const { posts, isLoading: isLoadingPosts } = useSelector((state) => state.posts);

  // Load Data based on Tab
  useEffect(() => {
    if (tabValue === 0 && users.length === 0) dispatch(fetchAllUsers());
    if (tabValue === 1 && posts.length === 0) dispatch(fetchPosts({ limit: 50 }));
    if (tabValue === 2 && reports.length === 0) dispatch(fetchReports());
    if (tabValue === 3 && companies.length === 0) dispatch(fetchCompanies());
  }, [tabValue, dispatch, users.length, posts.length, reports.length, companies.length]);

  // General Handlers
  const handleTabChange = (event, newValue) => setTabValue(newValue);
  
  const handleBootstrap = async () => {
    try {
      const result = await dispatch(bootstrapAdmin()).unwrap();
      dispatch(showSnackbar({ message: result.message, severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Bootstrap failed', severity: 'error' }));
    }
  };

  // User Actions
  const handleToggleStatus = async (user) => {
    try {
      await dispatch(toggleUserStatus({ id: user.id, isActive: !user.isActive })).unwrap();
      dispatch(showSnackbar({ message: `User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`, severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to update user status', severity: 'error' }));
    }
  };

  // Post Actions
  const handleConfirmDeletePost = async () => {
    try {
      await dispatch(deletePost(selectedItem.id)).unwrap();
      dispatch(showSnackbar({ message: 'Post permanently deleted.', severity: 'success' }));
      setDialogOpen(false);
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to delete post.', severity: 'error' }));
    }
  };

  // Report Actions
  const handleResolveReport = async (reportId, status, targetId) => {
    try {
      await dispatch(resolveReport({ id: reportId, status })).unwrap();
      if (status === 'resolved' && targetId) {
        // If they "Approve" a report about a post, auto-delete the post.
        await dispatch(deletePost(targetId)).unwrap();
        dispatch(showSnackbar({ message: 'Report resolved and offending content removed.', severity: 'success' }));
      } else {
        dispatch(showSnackbar({ message: 'Report dismissed.', severity: 'info' }));
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to update report status', severity: 'error' }));
    }
  };

  // Company Actions
  const handleVerifyCompany = async (companyId, status) => {
    try {
      await dispatch(verifyCompany({ id: companyId, status })).unwrap();
      dispatch(showSnackbar({ message: `Company ${status} successfully.`, severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to update company.', severity: 'error' }));
    }
  };

  const openConfirmDialog = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  if (isLoadingUsers && tabValue === 0) return <LoadingSpinner message="Loading Admin Panel..." />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom align="left" sx={{ fontWeight: 800 }}>
            Master Control Panel
          </Typography>
          <Typography variant="body1" color="text.secondary" align="left">
            Manage users, moderate content, resolve reports, and verify businesses.
          </Typography>
        </Box>
        <Button variant="outlined" color="warning" onClick={handleBootstrap} sx={{ display: 'none' }}>
          Trigger Init Script
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<AssignmentInd />} iconPosition="start" label="Users" />
          <Tab icon={<Forum />} iconPosition="start" label="Global Feed" />
          <Tab icon={<ReportProblem />} iconPosition="start" label="Moderation Queue" />
          <Tab icon={<VerifiedUser />} iconPosition="start" label="Companies" />
        </Tabs>

        <CardContent>
          {/* TAB 0: USERS */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Block / Unblock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.avatar} alt={user.username} sx={{ width: 32, height: 32 }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color={user.role === 'admin' ? 'error' : user.role === 'moderator' ? 'warning' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={user.isActive ? 'Active' : 'Blocked'} size="small" color={user.isActive ? 'success' : 'error'} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Switch checked={user.isActive} onChange={() => handleToggleStatus(user)} color="success" disabled={user.role === 'admin'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* TAB 1: POSTS */}
          <TabPanel value={tabValue} index={1}>
            {isLoadingPosts ? <LoadingSpinner /> : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>Title & Snippet</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{post.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {post.content}
                          </Typography>
                        </TableCell>
                        <TableCell>{post.author?.firstName} {post.author?.lastName}</TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Post">
                            <IconButton color="primary" href={`/post/${post.id}`} target="_blank"><Visibility /></IconButton>
                          </Tooltip>
                          <Tooltip title="Force Delete">
                            <IconButton color="error" onClick={() => openConfirmDialog(post, 'delete_post')}><Delete /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {posts.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No posts found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* TAB 2: REPORTS */}
          <TabPanel value={tabValue} index={2}>
            {isLoadingReports ? <LoadingSpinner /> : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>Reason</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Target ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Adjudicate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell><Typography variant="body2" fontWeight="bold" color="error">{report.reason}</Typography></TableCell>
                        <TableCell><Chip label={report.targetType} size="small" variant="outlined" /></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{report.targetId.substring(0,8)}...</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status.toUpperCase()} 
                            size="small" 
                            color={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Approve & Neutralize Target">
                            <span>
                              <IconButton 
                                color="error" 
                                disabled={report.status !== 'pending'} 
                                onClick={() => handleResolveReport(report.id, 'resolved', report.targetId)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Dismiss false alarm">
                            <span>
                              <IconButton 
                                color="default" 
                                disabled={report.status !== 'pending'} 
                                onClick={() => handleResolveReport(report.id, 'dismissed', null)}
                              >
                                <Cancel />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Moderation queue is empty. Good job!</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* TAB 3: COMPANIES */}
          <TabPanel value={tabValue} index={3}>
            {isLoadingCompanies ? <LoadingSpinner /> : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Verify</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell><Typography variant="body2" fontWeight="bold">{company.name}</Typography></TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {company.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={company.verificationStatus.toUpperCase()} 
                            size="small" 
                            color={company.verificationStatus === 'pending' ? 'warning' : company.verificationStatus === 'approved' ? 'success' : 'error'} 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Approve Company">
                            <span>
                              <IconButton color="success" disabled={company.verificationStatus === 'approved'} onClick={() => handleVerifyCompany(company.id, 'approved')}>
                                <CheckCircle />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Reject Company">
                            <span>
                              <IconButton color="error" disabled={company.verificationStatus === 'rejected'} onClick={() => handleVerifyCompany(company.id, 'rejected')}>
                                <Cancel />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {companies.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No companies registered.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </CardContent>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>Are you absolutely sure you want to completely purge this item from the platform?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={dialogType === 'delete_post' ? handleConfirmDeletePost : () => setDialogOpen(false)} color="error" variant="contained">
            Force Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default AdminDashboard;
