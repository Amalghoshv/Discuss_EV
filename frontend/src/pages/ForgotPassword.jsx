import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { MailOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../store/slices/authSlice';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const result = await dispatch(forgotPassword({ email })).unwrap();
            setSuccessMsg(result.message || 'If that email is registered, you will receive a reset link shortly.');
            setEmail('');
        } catch (err) {
            setErrorMsg(err || 'Failed to process request.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 12 }} className="animate-in">
            <Paper className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <MailOutline fontSize="large" />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                    Forgot Password
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </Typography>

                {errorMsg && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{errorMsg}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>{successMsg}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        required
                        sx={{ mb: 4 }}
                    />
                    
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading || !email}
                        sx={{ py: 1.5, mb: 3, borderRadius: '20px', fontWeight: 600 }}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    
                    <Typography variant="body2" color="text.secondary">
                        Remember your password?{' '}
                        <Typography component={Link} to="/login" color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                            Log In
                        </Typography>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPassword;
