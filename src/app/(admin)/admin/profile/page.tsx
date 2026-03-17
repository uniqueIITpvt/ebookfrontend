'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        bio: (user as any).bio || '',
      });
    }
  }, [user]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{ width: 100, height: 100, border: '4px solid white' }}
          >
            <AccountCircle sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {user.email}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Role: {user.role === 'admin' || user.role === 'superadmin' ? 'Administrator' : 'User'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Edit Profile
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                InputProps={{
                  startAdornment: <AccountCircle sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                disabled
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleChange('location')}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Tell us about yourself..."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ backgroundColor: '#F59E0B', '&:hover': { backgroundColor: '#D97706' } }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
