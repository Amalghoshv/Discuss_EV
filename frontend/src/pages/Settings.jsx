import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Avatar,
    IconButton,
    Divider,
    Switch,
    FormControlLabel,
    Stack,
    Alert,
    useTheme,
} from '@mui/material';
import {
    PhotoCamera,
    Person,
    Lock,
    Notifications,
    Security,
    Save,
    ChevronRight,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword } from '../store/slices/authSlice';

const Settings = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { user, isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        email: user?.email || '',
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const initialFormData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        email: user?.email || '',
        avatar: user?.avatar || ''
    };

    // Derived state to check if profile changes have been made
    const isProfileDirty = 
        avatarPreview !== null || 
        JSON.stringify(formData) !== JSON.stringify(initialFormData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(false);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setPasswordSuccess('');
        setPasswordError('');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData({ ...formData, avatar: reader.result });
                setSuccess(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateProfile(formData));
        if (!result.error) {
            setSuccess(true);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        try {
            const resultAction = await dispatch(changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })).unwrap();
            
            setPasswordSuccess('Password successfully updated!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err || 'Failed to update password');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6, px: { xs: 2, md: 4 } }} className="animate-in">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Settings</Typography>

            <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, mb: 4 }}>
                <Box component="form" onSubmit={handleSubmitProfile}>
                    <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Profile Information</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={avatarPreview || user?.avatar}
                                                sx={{ width: 100, height: 100, border: `4px solid ${theme.palette.divider}` }}
                                            >
                                                {user?.firstName?.[0]}
                                            </Avatar>
                                            <IconButton
                                                color="primary"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: -5,
                                                    right: -5,
                                                    bgcolor: 'background.paper',
                                                    boxShadow: 2,
                                                    '&:hover': { bgcolor: 'action.hover' }
                                                }}
                                                component="label"
                                            >
                                                <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                                                <PhotoCamera fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Profile Picture</Typography>
                                            <Typography variant="caption" color="text.secondary">PNG, JPG or GIF. Max 5MB.</Typography>
                                        </Box>
                                    </Box>

                                    {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Profile updated successfully!</Alert>}
                                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                variant="outlined"
                                                multiline
                                                rows={4}
                                                placeholder="Tell the community about your EV journey..."
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                variant="outlined"
                                                disabled
                                                helperText="Email cannot be changed currently."
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Save />}
                                            disabled={isLoading || !isProfileDirty}
                                            sx={{ borderRadius: '20px', px: 4 }}
                                        >
                                            Save Profile
                                        </Button>
                                    </Box>
                </Box>
            </Paper>

            <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                <Box component="form" onSubmit={handleSubmitPassword}>
                    <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Security: Change Password</Typography>
                    
                    {passwordSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{passwordSuccess}</Alert>}
                    {passwordError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{passwordError}</Alert>}

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Current Password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                required
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            startIcon={<Lock />}
                            disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                            sx={{ borderRadius: '20px', px: 4 }}
                        >
                            Update Password
                        </Button>
                    </Box>
                </Box>
            </Paper>

        </Container>
    );
};

export default Settings;
