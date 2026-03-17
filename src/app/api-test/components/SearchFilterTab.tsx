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
import { Search } from '@mui/icons-material';

interface SearchFilterTabProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  testSearchBooks: () => void;
  testGetBooksByCategory: () => void;
  loading: string | null;
}

export default function SearchFilterTab({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  testSearchBooks,
  testGetBooksByCategory,
  loading
}: SearchFilterTabProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Search & Filter Operations
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Search Query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query (title, author, description)..."
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={testSearchBooks}
            disabled={!searchQuery.trim() || loading === 'search-books'}
            startIcon={loading === 'search-books' ? <CircularProgress size={16} /> : <Search />}
          >
            Search Books
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Filter by Category
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Mental Health">Mental Health</MenuItem>
              <MenuItem value="Psychology">Psychology</MenuItem>
              <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
              <MenuItem value="Self-Help">Self-Help</MenuItem>
              <MenuItem value="Medical">Medical</MenuItem>
              <MenuItem value="Therapy">Therapy</MenuItem>
              <MenuItem value="Anxiety">Anxiety</MenuItem>
              <MenuItem value="Depression">Depression</MenuItem>
              <MenuItem value="Stress Management">Stress Management</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={testGetBooksByCategory}
            disabled={!category || loading === 'books-by-category'}
            startIcon={loading === 'books-by-category' ? <CircularProgress size={16} /> : <Search />}
          >
            Filter Books
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Quick Search Examples
      </Typography>
      
      <Grid container spacing={1}>
        {['anxiety', 'depression', 'therapy', 'mental health', 'stress'].map((example) => (
          <Grid item key={example}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSearchQuery(example)}
            >
              {example}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
