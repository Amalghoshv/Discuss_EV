import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Avatar,
  Chip,
  Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserStatus, bootstrapAdmin } from '../store/slices/adminSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, isLoadingUsers } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleStatus = async (user) => {
    try {
      await dispatch(toggleUserStatus({ id: user.id, isActive: !user.isActive })).unwrap();
      dispatch(showSnackbar({
        message: `User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to update user status', severity: 'error' }));
    }
  };

  const handleBootstrap = async () => {
    try {
      const result = await dispatch(bootstrapAdmin()).unwrap();
      dispatch(showSnackbar({ message: result.message, severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Bootstrap failed', severity: 'error' }));
    }
  };

  if (isLoadingUsers) return <LoadingSpinner message="Loading Admin Panel..." />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom align="left" sx={{ fontWeight: 800 }}>
            Admin Control Panel
          </Typography>
          <Typography variant="body1" color="text.secondary" align="left">
            Manage users, moderate content, and oversee the DiscussEV platform.
          </Typography>
        </Box>
        <Button variant="outlined" color="warning" onClick={handleBootstrap}>
          Trigger Init Script
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            User Management ({users.length})
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
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
                      <Chip 
                        label={user.role} 
                        size="small"
                        color={user.role === 'admin' ? 'error' : user.role === 'moderator' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Blocked'} 
                        size="small"
                        color={user.isActive ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleStatus(user)}
                        color="success"
                        disabled={user.role === 'admin'} // Prevent banning other admins
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Global Post Moderation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admins have a global "Delete" override applied directly to the Community Feed. Navigate to any individual post or card to completely purge inappropriate content.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
