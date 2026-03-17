'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Article,
  TrendingUp,
  Favorite,
  Star,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { blogsApi, type Blog } from '@/services/api/blogsApi';

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    featuredBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    blogId: string | null;
    blogTitle: string;
  }>({
    open: false,
    blogId: null,
    blogTitle: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter blogs when search or filters change
  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, filterCategory, filterStatus]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load stats and categories in parallel
      const [statsResponse, categoriesResponse] = await Promise.all([
        blogsApi.getStats(),
        blogsApi.getCategories(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load blogs with adminView to see all including drafts
      await fetchBlogs();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showErrorAlert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const params: any = {
        limit: 50,
        adminView: true, // Show all blogs including drafts
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterCategory) {
        params.category = filterCategory;
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await blogsApi.getAllBlogs(params);
      
      if (response.success) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showErrorAlert('Failed to fetch blogs');
    }
  };

  const handleAddBlog = () => {
    router.push('/admin/blogs/add');
  };

  const handleEditBlog = (blogId: string) => {
    router.push(`/admin/blogs/edit/${blogId}`);
  };

  const handleViewBlog = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  const handleDeleteClick = (blog: Blog) => {
    setConfirmDialog({
      open: true,
      blogId: blog._id,
      blogTitle: blog.title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.blogId) return;

    try {
      setDeleting(confirmDialog.blogId);
      const response = await blogsApi.deleteBlog(confirmDialog.blogId);
      
      if (response.success) {
        showSuccessAlert('Blog deleted successfully!');
        await loadInitialData(); // Refresh data
      } else {
        showErrorAlert(response.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showErrorAlert('Failed to delete blog');
    } finally {
      setDeleting(null);
      setConfirmDialog({ open: false, blogId: null, blogTitle: '' });
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const showSuccessAlert = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showErrorAlert = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Blog Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your blog posts, categories, and content
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddBlog}
            size="large"
          >
            Add New Blog
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Blogs
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {loading ? <Skeleton width={60} /> : stats.totalBlogs}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Article fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Featured
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {loading ? <Skeleton width={60} /> : stats.featuredBlogs}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Star fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Views
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {loading ? <Skeleton width={60} /> : stats.totalViews.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <TrendingUp fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Likes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {loading ? <Skeleton width={60} /> : stats.totalLikes.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Favorite fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Blog Cards Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : blogs.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Article sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No blogs found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchQuery || filterCategory || filterStatus
              ? 'Try adjusting your filters'
              : 'Get started by creating your first blog post'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddBlog}
            sx={{ mt: 2 }}
          >
            Add New Blog
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={blog._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {/* Featured Badge */}
                {blog.featured && (
                  <Chip
                    label="Featured"
                    color="warning"
                    size="small"
                    icon={<Star />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontWeight: 'bold',
                    }}
                  />
                )}

                {/* Cover Image */}
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    position: 'relative',
                    backgroundColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {blog.image && blog.image.startsWith('http') ? (
                    <Box
                      component="img"
                      src={blog.image}
                      alt={blog.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <span style="color: white; font-size: 48px;">📝</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <Article sx={{ fontSize: 64, color: 'white' }} />
                    </Box>
                  )}

                  {/* Status Badge */}
                  <Chip
                    label={blog.status}
                    color={getStatusColor(blog.status)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                    }}
                  />
                </CardMedia>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3.6em',
                    }}
                  >
                    {blog.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                      minHeight: '2.8em',
                    }}
                  >
                    {blog.excerpt}
                  </Typography>

                  {/* Author Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar
                      src={blog.authorAvatar}
                      alt={blog.author}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {blog.author}
                    </Typography>
                  </Box>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={blog.category} size="small" variant="outlined" />
                    <Chip label={blog.readTime} size="small" variant="outlined" />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      <Visibility sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {blog.views || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <Favorite sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {blog.likes || 0}
                    </Typography>
                  </Box>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {formatDate(blog.publishDate)}
                  </Typography>
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewBlog(blog.slug || blog._id)}
                    fullWidth
                    variant="outlined"
                  >
                    Preview
                  </Button>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditBlog(blog._id)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(blog)}
                      disabled={deleting === blog._id}
                    >
                      {deleting === blog._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, blogId: null, blogTitle: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{confirmDialog.blogTitle}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, blogId: null, blogTitle: '' })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting !== null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
