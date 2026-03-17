import React from 'react';
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
  CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface BooksWriteTabProps {
  newBook: {
    title: string;
    author: string;
    description: string;
    category: string;
    price: number;
    type: 'Books' | 'Audiobook';
  };
  setNewBook: React.Dispatch<React.SetStateAction<any>>;
  testCreateBook: () => void;
  testBooksPost: () => void;
  loading: string | null;
}

export default function BooksWriteTab({ 
  newBook, 
  setNewBook, 
  testCreateBook, 
  testBooksPost, 
  loading 
}: BooksWriteTabProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Books Write Operations
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={testBooksPost}
            disabled={loading === 'test-books-post'}
            startIcon={loading === 'test-books-post' ? <CircularProgress size={16} /> : <Add />}
          >
            Test POST Endpoint
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Create New Book
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Title *"
            value={newBook.title}
            onChange={(e) => setNewBook((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="Book title..."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Author"
            value={newBook.author}
            onChange={(e) => setNewBook((prev: any) => ({ ...prev, author: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description *"
            value={newBook.description}
            onChange={(e) => setNewBook((prev: any) => ({ ...prev, description: e.target.value }))}
            placeholder="Book description..."
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={newBook.category}
              label="Category"
              onChange={(e) => setNewBook((prev: any) => ({ ...prev, category: e.target.value }))}
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
              value={newBook.type}
              label="Type"
              onChange={(e) => setNewBook((prev: any) => ({ ...prev, type: e.target.value as 'Books' | 'Audiobook' }))}
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
            value={newBook.price}
            onChange={(e) => setNewBook((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={testCreateBook}
            disabled={!newBook.title.trim() || !newBook.description.trim() || loading === 'create-book'}
            startIcon={loading === 'create-book' ? <CircularProgress size={16} /> : <Add />}
          >
            Create Book
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
