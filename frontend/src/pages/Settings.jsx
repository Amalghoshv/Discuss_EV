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
import { updateProfile } from '../store/slices/authSlice';

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

    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateProfile(formData));
        if (!result.error) {
            setSuccess(true);
        }
    };

    const sections = [
        { id: 'profile', label: 'Public Profile', icon: <Person /> },
        { id: 'account', label: 'Account Settings', icon: <Lock /> },
        { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
        { id: 'security', label: 'Privacy & Security', icon: <Security /> },
    ];

    return (
        <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, md: 4, lg: 6 } }} className="animate-in">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Settings</Typography>

            <Grid container spacing={4}>
                {/* Sidebar Navigation */}
                <Grid item xs={12} md={3}>
                    <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <Stack>
                            {sections.map((section) => (
                                <Box
                                    key={section.id}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        cursor: 'pointer',
                                        bgcolor: section.id === 'profile' ? 'action.selected' : 'transparent',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Box sx={{ color: section.id === 'profile' ? 'primary.main' : 'text.secondary' }}>
                                        {section.icon}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                        {section.label}
                                    </Typography>
                                    <ChevronRight fontSize="small" sx={{ opacity: 0.3 }} />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Main Settings Area */}
                <Grid item xs={12} md={9}>
                    <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Profile Information</Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={user?.avatar}
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
                                        <input hidden accept="image/*" type="file" />
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

                            <Divider sx={{ my: 5 }} />

                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Preferences</Typography>
                            <Stack spacing={2}>
                                <FormControlLabel
                                    control={<Switch defaultChecked color="primary" />}
                                    label={<Typography variant="body2">Email notifications for new comments</Typography>}
                                />
                                <FormControlLabel
                                    control={<Switch defaultChecked color="primary" />}
                                    label={<Typography variant="body2">Show my profile in public search</Typography>}
                                />
                            </Stack>

                            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" sx={{ borderRadius: '20px', px: 4 }}>Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Save />}
                                    disabled={isLoading}
                                    sx={{ borderRadius: '20px', px: 4 }}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Settings;
