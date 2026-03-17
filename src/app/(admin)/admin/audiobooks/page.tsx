'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Search, CloudUpload, Close } from '@mui/icons-material';

import { type Book, type BookPayload } from '@/services/api/booksApi';
import { audiobooksApi } from '@/services/api/audiobooksApi';
import { categoriesApi, type Category } from '@/services/api/categoriesApi';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

type AudiobookForm = Omit<BookPayload, 'type' | 'price' | 'tags'> & {
  _id?: string;
  id?: string;
  price: number;
  tags: string[];
  type?: 'Audiobook';
};

const statuses: Array<Book['status']> = ['draft', 'review', 'published', 'archived'];

export default function AdminAudiobooksPage() {
  const [items, setItems] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Book['status'] | ''>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<AudiobookForm | null>(null);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [audiobookFile, setAudiobookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (severity: SnackbarState['severity'], message: string) => {
    setSnackbar({ open: true, severity, message });
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const loadData = async () => {
    try {
      setLoading(true);

      try {
        const catRes = await categoriesApi.getActive();
        if (catRes.success) setCategories(catRes.data);
      } catch {
        setCategories([]);
      }

      const res = await audiobooksApi.getAll({});
      if (res.success) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (e: any) {
      setItems([]);
      showSnackbar('error', e?.message || 'Failed to load audiobooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  }, [items, searchQuery, statusFilter]);

  const openAdd = () => {
    setDialogMode('add');
    setForm({
      title: '',
      subtitle: '',
      author: '',
      description: '',
      category: '',
      price: 0,
      format: ['Audiobook'],
      featured: false,
      bestseller: false,
      status: 'draft',
      tags: [],
      publishDate: new Date().toISOString().split('T')[0],
      isbn: '',
      pages: undefined,
      rating: 0,
      reviews: 0,
      originalPrice: undefined,
      duration: '',
      narrator: '',
    });
    setCoverImageFile(null);
    setAudiobookFile(null);
    setCoverPreview(null);
    setAudioPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (b: Book) => {
    setDialogMode('edit');
    setForm({
      _id: (b as any)._id || b.id,
      id: b.id,
      title: b.title || '',
      subtitle: b.subtitle || '',
      author: b.author || '',
      description: b.description || '',
      category: b.category || '',
      price: typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0 : (b.price as any) || 0,
      format: Array.isArray(b.format) && b.format.length ? Array.from(new Set([...b.format, 'Audiobook'])) : ['Audiobook'],
      featured: !!b.featured,
      bestseller: !!b.bestseller,
      status: b.status || 'draft',
      tags: Array.isArray(b.tags) ? b.tags : [],
      publishDate: b.publishDate ? String(b.publishDate).split('T')[0] : new Date().toISOString().split('T')[0],
      isbn: b.isbn || '',
      pages: b.pages,
      rating: b.rating,
      reviews: b.reviews,
      originalPrice: b.originalPrice ? (typeof b.originalPrice === 'string' ? parseFloat(b.originalPrice.replace(/[^0-9.]/g, '')) : (b.originalPrice as any)) : undefined,
      duration: b.duration || '',
      narrator: b.narrator || '',
      image: b.image,
    });
    setCoverImageFile(null);
    setAudiobookFile(null);
    setCoverPreview(null);
    setAudioPreview(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true);
      const res = await audiobooksApi.delete(id);
      if (res.success) {
        showSnackbar('success', 'Audiobook deleted');
        await loadData();
      } else {
        showSnackbar('error', 'Failed to delete audiobook');
      }
    } catch (e: any) {
      showSnackbar('error', e?.message || 'Failed to delete audiobook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showSnackbar('error', 'Please select an image file');
      return;
    }
    setCoverImageFile(file);
    setCoverPreview(file.name);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|m4a|wav|ogg)$/)) {
      showSnackbar('error', 'Please select an MP3, M4A, WAV, or OGG audio file');
      return;
    }
    setAudiobookFile(file);
    setAudioPreview(file.name);
  };

  const save = async () => {
    if (!form) return;

    if (!form.title.trim() || !form.author.trim() || !form.category.trim() || !form.description.trim()) {
      showSnackbar('error', 'Please fill required fields (title, author, category, description)');
      return;
    }

    const existingAudioUrl = (form as any)?.files?.audiobook?.url || (form as any)?.audiobookUrl || (form as any)?.fileUrls?.audiobook;
    if (!audiobookFile && !existingAudioUrl) {
      showSnackbar('error', 'Audiobook file is required');
      return;
    }

    try {
      setSubmitting(true);

      const payload: BookPayload = {
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || undefined,
        author: form.author.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        type: 'Audiobook',
        price: Number(form.price) || 0,
        originalPrice: form.originalPrice,
        rating: form.rating,
        reviews: form.reviews,
        pages: form.pages,
        duration: form.duration,
        narrator: form.narrator,
        publishDate: form.publishDate,
        isbn: form.isbn?.trim() || undefined,
        format: Array.from(new Set([...(form.format || []), 'Audiobook'])),
        image: coverImageFile ? undefined : (form as any).image,
        featured: !!form.featured,
        bestseller: !!form.bestseller,
        tags: Array.isArray(form.tags) ? form.tags : [],
        status: form.status,
      };

      const filesToUpload = {
        coverImage: coverImageFile || undefined,
        audiobookFile: audiobookFile || undefined,
      };

      const hasFiles = Object.values(filesToUpload).some(Boolean);

      if (dialogMode === 'add') {
        const res = hasFiles
          ? await audiobooksApi.createWithFiles(payload, filesToUpload as any)
          : await audiobooksApi.create(payload);

        if (!res.success) throw new Error('Failed to create audiobook');
        showSnackbar('success', 'Audiobook created');
      } else {
        const id = form._id || form.id;
        if (!id) throw new Error('Missing audiobook id');
        const res = hasFiles
          ? await audiobooksApi.updateWithFiles(id, payload, filesToUpload as any)
          : await audiobooksApi.update(id, payload);

        if (!res.success) throw new Error('Failed to update audiobook');
        showSnackbar('success', 'Audiobook updated');
      }

      setDialogOpen(false);
      await loadData();
    } catch (e: any) {
      showSnackbar('error', e?.message || 'Failed to save audiobook');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Audiobooks Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, edit, and manage audiobooks
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
            Add Audiobook
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                <Search sx={{ p: '10px' }} />
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search audiobooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <MenuItem value="">All</MenuItem>
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Backdrop open sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No audiobooks found.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((b) => {
                const id = (b as any)._id || b.id;
                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{b.title}</Typography>
                      {b.files?.audiobook?.url && (
                        <Chip size="small" label="Audio" sx={{ mt: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>{b.author}</TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>{b.category}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEdit(b)} disabled={submitting}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(id)} disabled={submitting} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Add Audiobook' : 'Edit Audiobook'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title *"
                value={form?.title || ''}
                onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Author *"
                value={form?.author || ''}
                onChange={(e) => setForm((f) => (f ? { ...f, author: e.target.value } : f))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={form?.category || ''}
                  label="Category *"
                  onChange={(e) => setForm((f) => (f ? { ...f, category: e.target.value } : f))}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={form?.price ?? 0}
                onChange={(e) => setForm((f) => (f ? { ...f, price: Number(e.target.value) } : f))}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form?.status || 'draft'}
                  label="Status"
                  onChange={(e) => setForm((f) => (f ? { ...f, status: e.target.value as any } : f))}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                multiline
                minRows={4}
                value={form?.description || ''}
                onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : f))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={form?.duration || ''}
                onChange={(e) => setForm((f) => (f ? { ...f, duration: e.target.value } : f))}
                placeholder="e.g., 5h 30m"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Narrator"
                value={form?.narrator || ''}
                onChange={(e) => setForm((f) => (f ? { ...f, narrator: e.target.value } : f))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cover Image
                </Typography>
                {coverPreview && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{coverPreview}</Typography>
                    <IconButton size="small" onClick={() => { setCoverImageFile(null); setCoverPreview(null); }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <input style={{ display: 'none' }} id="audiobook-cover-upload" type="file" onChange={handleCoverUpload} />
                <label htmlFor="audiobook-cover-upload">
                  <Button variant="outlined" startIcon={<CloudUpload />} component="span">
                    Upload Cover
                  </Button>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Audiobook File *
                </Typography>
                {audioPreview && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{audioPreview}</Typography>
                    <IconButton size="small" onClick={() => { setAudiobookFile(null); setAudioPreview(null); }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <input style={{ display: 'none' }} id="audiobook-audio-upload" type="file" onChange={handleAudioUpload} />
                <label htmlFor="audiobook-audio-upload">
                  <Button variant="outlined" startIcon={<CloudUpload />} component="span">
                    Upload Audio
                  </Button>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form?.featured}
                    onChange={(e) => setForm((f) => (f ? { ...f, featured: e.target.checked } : f))}
                  />
                }
                label="Featured"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form?.bestseller}
                    onChange={(e) => setForm((f) => (f ? { ...f, bestseller: e.target.checked } : f))}
                  />
                }
                label="Bestseller"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={save} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
