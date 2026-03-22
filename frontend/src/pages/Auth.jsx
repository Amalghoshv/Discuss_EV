import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  ElectricCar,
  ArrowForward,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { login, register as registerUser, clearError } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import authBg from '../assets/auth_bg.png';

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync state with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm();

  const {
    register: registerField,
    handleSubmit: handleRegisterSubmit,
    watch: watchRegister,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm();

  const registerPassword = watchRegister('password');

  const onLoginSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      dispatch(showSnackbar({
        message: 'Login successful!',
        severity: 'success',
      }));
      navigate('/');
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Login failed';
      dispatch(showSnackbar({ message: errorMessage, severity: 'error' }));
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      dispatch(showSnackbar({
        message: 'Registration successful! Welcome to DiscussEV!',
        severity: 'success',
      }));
      navigate('/');
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Registration failed';
      dispatch(showSnackbar({ message: errorMessage, severity: 'error' }));
    }
  };

  const handleToggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    resetLogin();
    resetRegister();
    dispatch(clearError());
    navigate(newMode ? '/login' : '/register');
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner message={isLogin ? "Signing you in..." : "Creating your account..."} />;
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-main-card">
        {/* Left Side: Side Panel */}
        <div className="auth-side-panel">
          <img src={authBg} alt="EV Concept" />
          <div className="auth-side-panel-content">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ElectricCar sx={{ fontSize: 45, color: '#4CAF50', mr: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
                DiscussEV
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, opacity: 0.9 }}>
              {isLogin ? "Welcome back to the future." : "Join the EV revolution."}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '400px', opacity: 0.7, lineHeight: 1.6 }}>
              {isLogin 
                ? "Sign in to access your dashboard, connect with fellow EV owners, and stay updated on the latest trends."
                : "Create an account to share your journey, get expert advice, and be part of the most vibrant EV community."}
            </Typography>
          </div>
        </div>

        {/* Right Side: Animated Forms */}
        <div className="auth-form-side">
          <div className={`auth-flip-container ${!isLogin ? 'flipped' : ''}`}>
            
            {/* Front Face: Login Form */}
            <div className="auth-form-face auth-form-front">
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Sign In</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Enter your credentials to access your account.
              </Typography>

              {error && isLogin && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <TextField
                  fullWidth label="Email Address" margin="normal"
                  {...loginRegister('email', { required: 'Email is required' })}
                  error={!!loginErrors.email} helperText={loginErrors.email?.message}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>) }}
                />
                <TextField
                  fullWidth label="Password" margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  {...loginRegister('password', { required: 'Password is required' })}
                  error={!!loginErrors.password} helperText={loginErrors.password?.message}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button 
                  fullWidth variant="contained" type="submit" size="large"
                  sx={{ mt: 4, mb: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}
                  endIcon={<ArrowForward />}
                >
                  Sign In
                </Button>

                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <Link component={RouterLink} to="/forgot-password" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                      Forgot Password?
                    </Link>
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link component="button" type="button" onClick={handleToggleMode} sx={{ fontWeight: 600 }}>
                      Create one now
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </div>

            {/* Back Face: Register Form */}
            <div className="auth-form-face auth-form-back">
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Create Account</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fill in the details below to join DiscussEV.
              </Typography>

              {error && !isLogin && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                <TextField
                  fullWidth label="First Name" margin="normal"
                  {...registerField('firstName', { required: 'Required' })}
                  error={!!registerErrors.firstName}
                />
                <TextField
                  fullWidth label="Last Name" margin="normal"
                  {...registerField('lastName', { required: 'Required' })}
                  error={!!registerErrors.lastName}
                />
                <TextField
                  fullWidth label="Username" margin="normal"
                  {...registerField('username', { required: 'Username is required' })}
                  error={!!registerErrors.username} helperText={registerErrors.username?.message}
                />
                <TextField
                  fullWidth label="Email" margin="normal"
                  {...registerField('email', { required: 'Email is required' })}
                  error={!!registerErrors.email} helperText={registerErrors.email?.message}
                />
                <TextField
                  fullWidth label="Password" margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  {...registerField('password', { required: 'Password is required', minLength: 6 })}
                  error={!!registerErrors.password}
                />
                <TextField
                  fullWidth label="Confirm Password" margin="normal"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerField('confirmPassword', { 
                    required: 'Required',
                    validate: v => v === registerPassword || 'Passwords do not match'
                  })}
                  error={!!registerErrors.confirmPassword}
                />
                <Button 
                  fullWidth variant="contained" type="submit" size="large"
                  sx={{ mt: 4, mb: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}
                >
                  Join Community
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link component="button" type="button" onClick={handleToggleMode} sx={{ fontWeight: 600 }}>
                      Sign in here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
