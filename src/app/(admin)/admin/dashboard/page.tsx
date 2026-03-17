'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  MenuBook,
  Article,
  Visibility,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/admin/StatsCard';

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

interface DashboardStats {
  books: {
    total: number;
    published: number;
    draft: number;
    change: number;
    trending: 'up' | 'down' | 'neutral';
  };
  blogs: {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
    change: number;
    trending: 'up' | 'down' | 'neutral';
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<DashboardStats>({
    books: { total: 0, published: 0, draft: 0, change: 0, trending: 'neutral' },
    blogs: { total: 0, published: 0, draft: 0, totalViews: 0, change: 0, trending: 'neutral' },
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch all stats in parallel
      const [booksRes, blogsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/books/stats`).catch(() => null),
        fetch(`${API_BASE_URL}/blogs/stats`).catch(() => null),
      ]);

      const newStats: DashboardStats = {
        books: { total: 0, published: 0, draft: 0, change: 0, trending: 'neutral' },
        blogs: { total: 0, published: 0, draft: 0, totalViews: 0, change: 0, trending: 'neutral' },
      };

      // Process books stats
      if (booksRes?.ok) {
        const booksData = await booksRes.json();
        if (booksData.success) {
          const change = Math.random() * 10 - 5;
          newStats.books = {
            total: booksData.data.total || 0,
            published: booksData.data.published || 0,
            draft: booksData.data.draft || 0,
            change: Math.round(change * 10) / 10,
            trending: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
          };
        }
      }

      // Process blogs stats
      if (blogsRes?.ok) {
        const blogsData = await blogsRes.json();
        if (blogsData.success) {
          const change = Math.random() * 10 - 5;
          newStats.blogs = {
            total: blogsData.data.total || 0,
            published: blogsData.data.published || 0,
            draft: blogsData.data.draft || 0,
            totalViews: blogsData.data.engagement?.totalViews || 0,
            change: Math.round(change * 10) / 10,
            trending: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
          };
        }
      }

      setStats(newStats);

      // Fetch recent content
      await fetchRecentContent();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentContent = async () => {
    try {
      const [blogsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/blogs?limit=3&sortBy=createdAt`).catch(() => null),
      ]);

      const recent: any[] = [];

      if (blogsRes?.ok) {
        const blogsData = await blogsRes.json();
        if (blogsData.success && blogsData.data) {
          blogsData.data.forEach((blog: any) => {
            recent.push({
              type: 'Blog',
              title: blog.title,
              status: blog.status,
              views: blog.views || 0,
              date: new Date(blog.createdAt),
            });
          });
        }
      }

      // Sort by date and take top 5
      recent.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentContent(recent.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent content:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalViews = stats.blogs.totalViews;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, UniqueIIT Research Center
          </Typography>
        </Box>
        
        {/* Time Range Selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="24h">Last 24 hours</MenuItem>
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Content Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Books"
            value={stats.books.total}
            change={stats.books.change}
            trending={stats.books.trending}
            icon={MenuBook}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Blogs"
            value={stats.blogs.total}
            change={stats.blogs.change}
            trending={stats.blogs.trending}
            icon={Article}
            color="yellow"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            change={5.3}
            trending="up"
            icon={Visibility}
            color="indigo"
          />
        </Grid>
      </Grid>

      {/* Content Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                Content Status Breakdown
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Books</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {stats.books.published} Published / {stats.books.draft} Draft
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.books.published / (stats.books.total || 1)) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Blogs</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {stats.blogs.published} Published / {stats.blogs.draft} Draft
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.blogs.published / (stats.blogs.total || 1)) * 100} 
                    sx={{ height: 8, borderRadius: 1 }}
                    color="warning"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Content */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
            Recent Content
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentContent.length > 0 ? (
                  recentContent.map((content, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip 
                          label={content.type} 
                          size="small" 
                          color={content.type === 'Blog' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{content.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={content.status} 
                          size="small" 
                          variant="outlined"
                          color={content.status === 'published' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{content.views.toLocaleString()}</TableCell>
                      <TableCell>{content.date.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No recent content available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Add New Blog" 
              color="primary" 
              clickable 
              onClick={() => router.push('/admin/blogs/add')}
            />
            <Chip 
              label="Add Book" 
              color="default" 
              clickable 
              onClick={() => router.push('/admin/books')}
            />
            <Chip 
              label="View Blogs" 
              color="default" 
              clickable 
              onClick={() => router.push('/admin/blogs')}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
