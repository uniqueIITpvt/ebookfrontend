'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  MenuBook,
} from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              padding: 5,
              textAlign: 'center',
              bgcolor: 'white',
            }}
          >
            <Avatar
              sx={{
                width: 70,
                height: 70,
                margin: '0 auto 20px',
                bgcolor: '#1976d2',
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)',
              }}
            >
              <MenuBook sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography 
              variant="h4" 
              fontWeight="600" 
              gutterBottom
              sx={{ color: '#1a1a1a', mb: 1 }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#6b7280', fontSize: '0.95rem' }}
            >
              Sign in to access your admin dashboard
            </Typography>
          </Box>

          {/* Form Section */}
          <CardContent sx={{ padding: 5, pt: 3, bgcolor: 'white' }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#d32f2f',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                autoComplete="current-password"
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: '#9ca3af' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.8,
                  bgcolor: '#1976d2',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)',
                  '&:hover': {
                    bgcolor: '#1565c0',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.35)',
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/')}
                  sx={{ 
                    textTransform: 'none',
                    color: '#6b7280',
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                      color: '#1976d2',
                    },
                  }}
                >
                  ← Back to Website
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            © 2025 UniqueIIT Research Center. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
