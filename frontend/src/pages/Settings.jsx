import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Paper, Grid, TextField, Button,
    Avatar, IconButton, Alert, useTheme,
} from '@mui/material';
import { PhotoCamera, Save, Lock } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword } from '../store/slices/authSlice';

/* ── shared field style ── */
const fieldSx = (isLight) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        fontSize: '0.875rem',
        bgcolor: isLight ? '#F7FAF7' : 'rgba(255,255,255,0.04)',
        '& fieldset': { borderColor: isLight ? '#D4E4D4' : 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: '#43A047' },
        '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2E7D32' },
    '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
});

/* ── section card ── */
const SectionCard = ({ children, sx = {} }) => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';
    return (
        <Paper elevation={0} sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)',
            bgcolor: isLight ? '#fff' : '#0F1E12',
            p: { xs: 2.5, sm: 3 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...sx,
        }}>
            {children}
        </Paper>
    );
};

/* ── section header ── */
const SectionHeader = ({ icon, title, subtitle }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: '9px',
            background: 'linear-gradient(135deg, #2E7D32, #43A047)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 3px 10px rgba(46,125,50,0.3)',
        }}>
            {icon}
        </Box>
        <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
    </Box>
);

/* ════════════════════════════════════════════
   MAIN
════════════════════════════════════════════ */
const Settings = () => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';
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

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            username: user?.username || '',
            bio: user?.bio || '',
            email: user?.email || '',
            avatar: user?.avatar || '',
        });
    }, [user]);

    const initialFormData = {
        firstName: user?.firstName || '', lastName: user?.lastName || '',
        username: user?.username || '', bio: user?.bio || '',
        email: user?.email || '', avatar: user?.avatar || '',
    };

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
                setFormData((prev) => ({ ...prev, avatar: reader.result }));
                setSuccess(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateProfile(formData));
        if (!result.error) setSuccess(true);
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setPasswordError(''); setPasswordSuccess('');
        if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError('New passwords do not match'); return; }
        if (passwordData.newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
        try {
            await dispatch(changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })).unwrap();
            setPasswordSuccess('Password successfully updated!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err || 'Failed to update password');
        }
    };

    const GREEN = '#2E7D32';
    const GREEN_LIGHT = '#43A047';
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
            {/* ── Page header ── */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 38, height: 38, borderRadius: '10px',
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(46,125,50,0.35)',
                }}>
                    <Save sx={{ color: '#fff', fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.55rem' }, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                        Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Manage your profile and account security</Typography>
                </Box>
            </Box>

            {/* ── Two panels side by side ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 2.5,
                alignItems: 'start',
            }}>

                {/* ══ LEFT: Profile ══ */}
                <SectionCard>
                    <SectionHeader
                        icon={<Save sx={{ color: '#fff', fontSize: 17 }} />}
                        title="Profile Information"
                        subtitle="Update your public profile details"
                    />

                    {/* Avatar */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 2, mb: 3,
                        p: 2, borderRadius: '12px',
                        bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${border}`,
                    }}>
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar
                                src={avatarPreview || user?.avatar}
                                sx={{
                                    width: 72, height: 72,
                                    border: `3px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.4)'}`,
                                    fontSize: '1.4rem', bgcolor: GREEN,
                                }}
                            >
                                {user?.firstName?.[0]}
                            </Avatar>
                            <IconButton
                                component="label"
                                size="small"
                                sx={{
                                    position: 'absolute', bottom: -4, right: -4,
                                    width: 26, height: 26,
                                    bgcolor: isLight ? '#fff' : '#1B2E1C',
                                    border: `1.5px solid ${border}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    '&:hover': { bgcolor: isLight ? '#F2F6F2' : '#243D25' },
                                }}
                            >
                                <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                                <PhotoCamera sx={{ fontSize: 13, color: GREEN_LIGHT }} />
                            </IconButton>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Profile Picture</Typography>
                            <Typography variant="caption" color="text.secondary">PNG, JPG or GIF · Max 5MB</Typography>
                        </Box>
                    </Box>

                    {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', py: 0.5, fontSize: '0.8rem' }}>Profile updated successfully!</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', py: 0.5, fontSize: '0.8rem' }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmitProfile} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} size="small" sx={fieldSx(isLight)} />
                            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} size="small" sx={fieldSx(isLight)} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                            <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} size="small" sx={fieldSx(isLight)} />
                            <TextField
                                fullWidth label="Bio" name="bio" value={formData.bio}
                                onChange={handleChange} multiline rows={3} size="small"
                                placeholder="Tell the community about your EV journey…"
                                sx={fieldSx(isLight)}
                            />
                            <TextField
                                fullWidth label="Email Address" name="email" value={formData.email}
                                disabled size="small"
                                helperText="Email cannot be changed currently."
                                sx={fieldSx(isLight)}
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save sx={{ fontSize: 16 }} />}
                                disabled={isLoading || !isProfileDirty}
                                sx={{
                                    borderRadius: '10px', px: 3, py: 1,
                                    fontSize: '0.82rem', fontWeight: 700,
                                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                                    boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
                                    textTransform: 'none',
                                    '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.4)', background: `linear-gradient(135deg, #1B5E20, ${GREEN})` },
                                    '&.Mui-disabled': { opacity: 0.45 },
                                }}
                            >
                                Save Profile
                            </Button>
                        </Box>
                    </Box>
                </SectionCard>

                {/* ══ RIGHT: Password ══ */}
                <SectionCard>
                    <SectionHeader
                        icon={<Lock sx={{ color: '#fff', fontSize: 17 }} />}
                        title="Change Password"
                        subtitle="Keep your account secure"
                    />

                    {passwordSuccess && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px', py: 0.5, fontSize: '0.8rem' }}>{passwordSuccess}</Alert>}
                    {passwordError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', py: 0.5, fontSize: '0.8rem' }}>{passwordError}</Alert>}

                    {/* Password strength hint box */}
                    <Box sx={{
                        mb: 3, p: 2, borderRadius: '12px',
                        bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${border}`,
                    }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mb: 1, color: GREEN_LIGHT }}>Password requirements</Typography>
                        {['At least 6 characters', 'Mix of letters and numbers', 'Avoid reusing old passwords'].map((r) => (
                            <Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.5)' }} />
                                <Typography variant="caption" color="text.secondary">{r}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box component="form" onSubmit={handleSubmitPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth type="password" label="Current Password"
                            name="currentPassword" value={passwordData.currentPassword}
                            onChange={handlePasswordChange} size="small" required
                            sx={fieldSx(isLight)}
                        />

                        {/* Divider */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 0.5 }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: border }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New password</Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: border }} />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                fullWidth type="password" label="New Password"
                                name="newPassword" value={passwordData.newPassword}
                                onChange={handlePasswordChange} size="small" required
                                sx={fieldSx(isLight)}
                            />
                            <TextField
                                fullWidth type="password" label="Confirm Password"
                                name="confirmPassword" value={passwordData.confirmPassword}
                                onChange={handlePasswordChange} size="small" required
                                sx={fieldSx(isLight)}
                            />
                        </Box>

                        {/* Password match indicator */}
                        {passwordData.newPassword && passwordData.confirmPassword && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    bgcolor: passwordData.newPassword === passwordData.confirmPassword ? GREEN_LIGHT : '#EF5350',
                                }} />
                                <Typography variant="caption" sx={{
                                    fontSize: '0.72rem', fontWeight: 600,
                                    color: passwordData.newPassword === passwordData.confirmPassword ? GREEN_LIGHT : '#EF5350',
                                }}>
                                    {passwordData.newPassword === passwordData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Lock sx={{ fontSize: 16 }} />}
                                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                                sx={{
                                    borderRadius: '10px', px: 3, py: 1,
                                    fontSize: '0.82rem', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
                                    boxShadow: '0 4px 14px rgba(21,101,192,0.3)',
                                    textTransform: 'none',
                                    '&:hover': { boxShadow: '0 6px 18px rgba(21,101,192,0.4)', background: 'linear-gradient(135deg, #0D47A1, #1565C0)' },
                                    '&.Mui-disabled': { opacity: 0.45 },
                                }}
                            >
                                Update Password
                            </Button>
                        </Box>
                    </Box>
                </SectionCard>
            </Box>
        </Box>
    );
};

export default Settings;
