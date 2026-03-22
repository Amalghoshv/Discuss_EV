import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { resetPassword } from '../store/slices/authSlice';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long');
            return;
        }

        try {
            await dispatch(resetPassword({ token, passwordData: { password: formData.password } })).unwrap();
            setSuccessMsg('Your password has been successfully reset. You can now log in.');
            setFormData({ password: '', confirmPassword: '' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setErrorMsg(err || 'Failed to reset password. The token may be expired or invalid.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 12 }} className="animate-in">
            <Paper className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                    <LockReset fontSize="large" />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                    Reset Password
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Please enter your new password below.
                </Typography>

                {errorMsg && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{errorMsg}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>{successMsg}</Alert>}

                {!successMsg && (
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="New Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            sx={{ mb: 4 }}
                        />
                        
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="secondary"
                            size="large"
                            disabled={isLoading || !formData.password || !formData.confirmPassword}
                            sx={{ py: 1.5, mb: 3, borderRadius: '20px', fontWeight: 600 }}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Box>
                )}

                {successMsg && (
                    <Button
                        fullWidth
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                        sx={{ py: 1.5, borderRadius: '20px', fontWeight: 600 }}
                    >
                        Go to Login
                    </Button>
                )}
            </Paper>
        </Container>
    );
};

export default ResetPassword;
