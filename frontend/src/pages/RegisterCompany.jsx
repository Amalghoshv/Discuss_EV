import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerCompany } from '../store/slices/companySlice';
import { showSnackbar } from '../store/slices/uiSlice';
import { ElectricCar, LockPerson } from '@mui/icons-material';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.companies);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerCompany(formData)).unwrap();
      dispatch(showSnackbar({ message: 'Company registered! Awaiting admin approval.', severity: 'success' }));
      navigate('/');
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Registration failed', severity: 'error' }));
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
          <LockPerson sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            To officially register and manage an EV Business on the platform, you must first create a personal manager account.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Create Account
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Log In
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ElectricCar sx={{ fontSize: 48, color: 'primary.main' }} />
        </Box>
        <Typography variant="h4" fontWeight="800" gutterBottom align="center">
          Register Your EV Business
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Join DiscussEV as an official company to publish verified industry insights and reach thousands of EV enthusiasts.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Company Name"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant="outlined"
          />
          <TextField
            label="Company Description"
            required
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            variant="outlined"
            placeholder="Tell the community what your business does..."
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
          >
            {isLoading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterCompany;
