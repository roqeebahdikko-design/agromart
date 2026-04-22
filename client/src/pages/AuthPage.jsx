import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CircularProgress, Backdrop } from '@mui/material';
import { clearAuthError, loginAdmin, loginUser, registerUser } from '../features/auth/authSlice';

const LIVESTOCK_IMAGE = 'https://i.pinimg.com/1200x/28/6a/a9/286aa99925f3186fc15680800fa372e6.jpg';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const submit = async () => {
    if (userType === 'admin') {
      const result = await dispatch(loginAdmin({ email, password }));
      if (!result.error) {
        navigate('/admin/dashboard');
      }
    } else {
      const result = await dispatch(loginUser({ email, password }));
      if (!result.error) {
        const role = result.payload?.user?.role;
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        m: 0,
        p: 0,
        backgroundColor: theme.palette.background.default
      }}
    >
      {loading && (
  <Backdrop
    open={loading}
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.drawer + 1,
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress color="inherit" />
    <Typography variant="body1">
      Signing you in...
    </Typography>
  </Backdrop>
)}
      {!isMobile && (
        <Box
          sx={{
            flex: isTablet ? '0 0 48%' : '0 0 52%',
            height: '100dvh',
            backgroundImage: `url(${LIVESTOCK_IMAGE})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            filter: 'brightness(1.14) contrast(1.12) saturate(1.12)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(160deg, rgba(31, 95, 59, 0.28), rgba(17, 69, 46, 0.48))',
              zIndex: 1
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stack spacing={2} sx={{ zIndex: 2, textAlign: 'center', color: 'white', px: 3 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: 'white' }}>
              Agromart
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.secondary.main }}>
              Premium Agricultural Marketplace
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Connecting farmers with quality products and services
            </Typography>
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          overflow: 'hidden'
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: { xs: 420, sm: 450, md: 470, lg: 500 },
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5, lg: 4 } }}>
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {isMobile && (
                <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center', color: theme.palette.primary.main }}>
                  Agromart
                </Typography>
              )}

              {/* Toggle Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 1,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 2
                }}
              >
                <Button
                  onClick={() => {
                    setUserType('user');
                    dispatch(clearAuthError());
                  }}
                  sx={{
                    flex: 1,
                    py: { xs: 1.2, sm: 1.5, md: 2 },
                    fontSize: { xs: '0.82rem', sm: '0.92rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    backgroundColor: userType === 'user' ? theme.palette.primary.main : 'transparent',
                    color: userType === 'user' ? 'white' : theme.palette.text.primary,
                    border: userType === 'user' ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: userType === 'user' ? theme.palette.primary.main : theme.palette.action.hover
                    }
                  }}
                >
                  Customer Login
                </Button>
                <Button
                  onClick={() => {
                    setUserType('admin');
                    dispatch(clearAuthError());
                  }}
                  sx={{
                    flex: 1,
                    py: { xs: 1.2, sm: 1.5, md: 2 },
                    fontSize: { xs: '0.82rem', sm: '0.92rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    backgroundColor: userType === 'admin' ? theme.palette.primary.main : 'transparent',
                    color: userType === 'admin' ? 'white' : theme.palette.text.primary,
                    border: userType === 'admin' ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: userType === 'admin' ? theme.palette.primary.main : theme.palette.action.hover
                    }
                  }}
                >
                  Admin Login
                </Button>
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease'
                }}
              >
                {userType === 'admin' ? 'Admin Portal' : 'Welcome Back'}
              </Typography>

              {/* Error Alert */}
              {error && <Alert severity="error">{error}</Alert>}

              {/* Form Fields */}
              <TextField
                label={userType === 'admin' ? 'Admin Email' : 'Email'}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  dispatch(clearAuthError());
                }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  dispatch(clearAuthError());
                }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />

              {/* Sign In Button */}
              <Button
                variant="contained"
                onClick={submit}
                disabled={loading}
                sx={{
                  py: { xs: 1.4, sm: 1.7, md: 2 },
                  fontSize: { xs: '0.92rem', sm: '0.98rem', md: '1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  backgroundColor: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark || '#1a4d30',
                    boxShadow: `0 4px 16px rgba(31, 95, 59, 0.3)`
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabledBackground
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {userType === 'user' && (
                <>
                  {/* Divider */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: 1, backgroundColor: theme.palette.divider }} />
                    <Typography variant="caption" color="textSecondary">
                      OR
                    </Typography>
                    <Box sx={{ flex: 1, height: 1, backgroundColor: theme.palette.divider }} />
                  </Box>

                  {/* Google Sign In */}
                  <Button
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
                    variant="outlined"
                    sx={{
                      py: { xs: 1.4, sm: 1.7, md: 2 },
                      fontSize: { xs: '0.92rem', sm: '0.98rem', md: '1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    Sign in with Google
                  </Button>

                  {/* Sign Up Link */}
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    New to Agromart?{' '}
                    <Link
                      to="/register"
                      style={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      Create Account
                    </Link>
                  </Typography>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export function AdminLoginPage() {
  return <LoginPage />;
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const submit = async () => {
    const result = await dispatch(registerUser({ name, email, password }));
    if (!result.error) {
      toast.success('Account created successfully. Please login.');
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        m: 0,
        p: 0,
        backgroundColor: theme.palette.background.default
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            flex: isTablet ? '0 0 48%' : '0 0 52%',
            height: '100dvh',
            backgroundImage: `url(${LIVESTOCK_IMAGE})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            filter: 'brightness(1.14) contrast(1.12) saturate(1.12)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(160deg, rgba(31, 95, 59, 0.28), rgba(17, 69, 46, 0.48))',
              zIndex: 1
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stack spacing={2} sx={{ zIndex: 2, textAlign: 'center', color: 'white', px: 3 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: 'white' }}>
              Agromart
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.secondary.main }}>
              Premium Agricultural Marketplace
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Join thousands of farmers and buyers
            </Typography>
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          overflow: 'hidden'
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: { xs: 420, sm: 450, md: 470, lg: 500 },
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5, lg: 4 } }}>
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {isMobile && (
                <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center', color: theme.palette.primary.main }}>
                  Agromart
                </Typography>
              )}

              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', color: theme.palette.primary.main }}>
                Create Account
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  dispatch(clearAuthError());
                }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  dispatch(clearAuthError());
                }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  dispatch(clearAuthError());
                }}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={submit}
                disabled={loading}
                sx={{
                  py: { xs: 1.4, sm: 1.7, md: 2 },
                  fontSize: { xs: '0.92rem', sm: '0.98rem', md: '1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  backgroundColor: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark || '#1a4d30',
                    boxShadow: `0 4px 16px rgba(31, 95, 59, 0.3)`
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabledBackground
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                >
                  Sign In
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
