import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  PlayArrow,
  ExpandMore 
} from '@mui/icons-material';

interface Book {
  _id?: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  type: 'Books' | 'Audiobook';
  featured?: boolean;
  bestseller?: boolean;
  status?: 'draft' | 'review' | 'published' | 'archived';
}

interface CRUDTestTabProps {
  loading: string | null;
  runTest: (testName: string, endpoint: string, method: string, apiCall: () => Promise<any>) => Promise<void>;
  apiClient: any;
}

export default function CRUDTestTab({ loading, runTest, apiClient }: CRUDTestTabProps) {
  // Create Book State
  const [createBook, setCreateBook] = useState<Book>({
    title: 'Test Book - Mental Health Guide',
    author: 'Dr. Syed M Quadri',
    description: 'A comprehensive guide to mental health and wellness practices.',
    category: 'Mental Health',
    price: 29.99,
    type: 'Books',
    featured: false,
    bestseller: false,
    status: 'published'
  });

  // Update Book State
  const [updateBookId, setUpdateBookId] = useState('');
  const [updateBook, setUpdateBook] = useState<Partial<Book>>({
    title: 'Updated Book Title',
    description: 'Updated description for the book.',
    price: 39.99,
    featured: true
  });

  // Delete Book State
  const [deleteBookId, setDeleteBookId] = useState('');

  // Read Book State
  const [readBookId, setReadBookId] = useState('');
  // Test Data
  const [createdBookId, setCreatedBookId] = useState<string>('');

  // CRUD Test Functions
  const testCreateBook = async () => {
    await runTest(
      'crud-create', 
      '/api/v1/books', 
      'POST', 
      () => apiClient.createBook(createBook)
    );
    // Note: runTest doesn't return data, so we can't auto-populate IDs
  };

  const testReadBook = () => {
    if (!readBookId.trim()) return;
    runTest('crud-read', `/api/v1/books/${readBookId}`, 'GET', () => apiClient.getBook(readBookId));
  };

  const testUpdateBook = () => {
    if (!updateBookId.trim()) return;
    runTest('crud-update', `/api/v1/books/${updateBookId}`, 'PUT', () => apiClient.updateBook(updateBookId, updateBook));
  };

  const testDeleteBook = () => {
    if (!deleteBookId.trim()) return;
    runTest('crud-delete', `/api/v1/books/${deleteBookId}`, 'DELETE', () => apiClient.deleteBook(deleteBookId));
  };

  // Complete CRUD Flow
  const runCompleteCRUDFlow = async () => {
    try {
      // 1. Create
      console.log('🔄 Starting Complete CRUD Flow...');
      await testCreateBook();
      
      // Wait a bit for the create to complete
      setTimeout(async () => {
        if (createdBookId) {
          // 2. Read
          await testReadBook();
          
          // 3. Update
          setTimeout(async () => {
            await testUpdateBook();
            
            // 4. Read again to verify update
            setTimeout(async () => {
              await testReadBook();
              
              // 5. Delete (optional - uncomment if you want to clean up)
              // setTimeout(() => {
              //   testDeleteBook();
              // }, 1000);
            }, 1000);
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error('CRUD Flow Error:', error);
    }
  };

  // Sample data presets
  const sampleBooks = [
    {
      title: 'Anxiety Management Handbook',
      author: 'Dr. Syed M Quadri',
      description: 'Practical strategies for managing anxiety in daily life.',
      category: 'Mental Health',
      price: 24.99,
      type: 'Books' as const
    },
    {
      title: 'Depression Recovery Guide',
      author: 'Dr. Syed M Quadri',
      description: 'A comprehensive guide to understanding and overcoming depression.',
      category: 'Psychology',
      price: 34.99,
      type: 'Audiobook' as const
    },
    {
      title: 'Stress-Free Living',
      author: 'Dr. Syed M Quadri',
      description: 'Learn effective techniques for stress management and relaxation.',
      category: 'Health & Wellness',
      price: 19.99,
      type: 'Books' as const
    }
  ];

  const loadSampleData = (index: number) => {
    setCreateBook({ ...sampleBooks[index], featured: false, bestseller: false, status: 'published' });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Complete CRUD Operations Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Test all Create, Read, Update, Delete operations for the Books API. Use the "Complete CRUD Flow" to test all operations in sequence.
      </Alert>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={runCompleteCRUDFlow}
            disabled={loading !== null}
            startIcon={loading ? <CircularProgress size={16} /> : <PlayArrow />}
          >
            Run Complete CRUD Flow
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => runTest('get-all-books', '/api/v1/books', 'GET', () => apiClient.getBooks())}
            disabled={loading === 'get-all-books'}
            startIcon={loading === 'get-all-books' ? <CircularProgress size={16} /> : <Visibility />}
          >
            View All Books
          </Button>
        </Grid>
      </Grid>

      {createdBookId && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <strong>Created Book ID:</strong> {createdBookId}
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      {/* CREATE Operation */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add color="primary" />
            <Typography variant="h6">CREATE - Add New Book</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Sample Data Buttons */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Sample Data:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {sampleBooks.map((book, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    onClick={() => loadSampleData(index)}
                  >
                    {book.title}
                  </Button>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title *"
                value={createBook.title}
                onChange={(e) => setCreateBook(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                value={createBook.author}
                onChange={(e) => setCreateBook(prev => ({ ...prev, author: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description *"
                value={createBook.description}
                onChange={(e) => setCreateBook(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={createBook.category}
                  label="Category"
                  onChange={(e) => setCreateBook(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="Mental Health">Mental Health</MenuItem>
                  <MenuItem value="Psychology">Psychology</MenuItem>
                  <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
                  <MenuItem value="Self-Help">Self-Help</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Therapy">Therapy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={createBook.type}
                  label="Type"
                  onChange={(e) => setCreateBook(prev => ({ ...prev, type: e.target.value as 'Books' | 'Audiobook' }))}
                >
                  <MenuItem value="Books">Book</MenuItem>
                  <MenuItem value="Audiobook">Audiobook</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={createBook.price}
                onChange={(e) => setCreateBook(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={testCreateBook}
                disabled={!createBook.title.trim() || !createBook.description.trim() || loading === 'crud-create'}
                startIcon={loading === 'crud-create' ? <CircularProgress size={16} /> : <Add />}
              >
                CREATE Book
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* READ Operation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility color="info" />
            <Typography variant="h6">READ - Get Book Details</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Book ID"
                value={readBookId}
                onChange={(e) => setReadBookId(e.target.value)}
                placeholder="Enter book ID or use created book ID"
                helperText={createdBookId ? `Created book ID: ${createdBookId}` : 'Enter a valid book ID'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={testReadBook}
                disabled={!readBookId.trim() || loading === 'crud-read'}
                startIcon={loading === 'crud-read' ? <CircularProgress size={16} /> : <Visibility />}
              >
                READ Book
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* UPDATE Operation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit color="warning" />
            <Typography variant="h6">UPDATE - Modify Book</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Book ID to Update"
                value={updateBookId}
                onChange={(e) => setUpdateBookId(e.target.value)}
                placeholder="Enter book ID to update"
                helperText={createdBookId ? `Created book ID: ${createdBookId}` : 'Enter a valid book ID'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Title"
                value={updateBook.title || ''}
                onChange={(e) => setUpdateBook(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="New Price"
                value={updateBook.price || ''}
                onChange={(e) => setUpdateBook(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="New Description"
                value={updateBook.description || ''}
                onChange={(e) => setUpdateBook(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={testUpdateBook}
                disabled={!updateBookId.trim() || loading === 'crud-update'}
                startIcon={loading === 'crud-update' ? <CircularProgress size={16} /> : <Edit />}
              >
                UPDATE Book
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* DELETE Operation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            <Typography variant="h6">DELETE - Remove Book</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This will permanently delete the book from the database!
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Book ID to Delete"
                value={deleteBookId}
                onChange={(e) => setDeleteBookId(e.target.value)}
                placeholder="Enter book ID to delete"
                helperText={createdBookId ? `Created book ID: ${createdBookId}` : 'Enter a valid book ID'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={testDeleteBook}
                disabled={!deleteBookId.trim() || loading === 'crud-delete'}
                startIcon={loading === 'crud-delete' ? <CircularProgress size={16} /> : <Delete />}
              >
                DELETE Book
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
