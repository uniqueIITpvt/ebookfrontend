'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Box,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import {
  Settings,
  Storage,
  LibraryBooks,
  Search,
  Add,
  CheckCircle,
  Error,
  Send
} from '@mui/icons-material';
import { apiClient, type ApiResponse } from '@/lib/api/client';
import BooksWriteTab from './components/BooksWriteTab';
import SearchFilterTab from './components/SearchFilterTab';
import AdvancedTab from './components/AdvancedTab';
import CRUDTestTab from './components/CRUDTestTab';
import BulkTestTab from './components/BulkTestTab';
import PostmanTab from './components/PostmanTab';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'loading' | 'success' | 'error';
  response?: ApiResponse;
  timestamp: string;
}

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookId, setBookId] = useState('');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(10);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [bulkTesting, setBulkTesting] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: 'Dr. Syed M Quadri',
    description: '',
    category: 'Mental Health',
    price: 0,
    type: 'Books' as 'Books' | 'Audiobook',
  });

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      timestamp: new Date().toISOString(),
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]);
  };

  const runTest = async (
    testName: string,
    endpoint: string,
    method: string,
    testFn: () => Promise<ApiResponse>
  ) => {
    setLoading(testName);
    
    addTestResult({ endpoint, method, status: 'loading' });

    try {
      const response = await testFn();
      addTestResult({
        endpoint,
        method,
        status: response.success ? 'success' : 'error',
        response,
      });
    } catch (error: any) {
      addTestResult({
        endpoint,
        method,
        status: 'error',
        response: {
          success: false,
          error: {
            message: (error as any)?.message || String(error) || 'Unknown error', 
          },
        },
      });
    } finally {
      setLoading(null);
    }
  };

  // Test functions
  const testHealth = () => runTest('health', '/health', 'GET', () => apiClient.getHealth());
  const testApiInfo = () => runTest('api-info', '/', 'GET', () => apiClient.getApiInfo());
  const testV1Info = () => runTest('v1-info', '/api/v1', 'GET', () => apiClient.getV1Info());
  const testV1Test = () => runTest('v1-test', '/api/v1/test', 'GET', () => apiClient.testV1());
  const testGetBooks = () => runTest('get-books', '/api/v1/books', 'GET', () => apiClient.getBooks());
  const testGetFeatured = () => runTest('featured-books', '/api/v1/books/featured', 'GET', () => apiClient.getFeaturedBooks(5));
  const testSearchBooks = () => {
    if (!searchQuery.trim()) return;
    runTest('search-books', `/api/v1/books/search?q=${searchQuery}`, 'GET', () => apiClient.searchBooks(searchQuery));
  };
  const testGetBook = () => {
    if (!bookId.trim()) return;
    runTest('get-book', `/api/v1/books/${bookId}`, 'GET', () => apiClient.getBook(bookId));
  };

  // Additional Books Tests
  const testGetBestsellers = () => runTest('bestseller-books', '/api/v1/books/bestsellers', 'GET', () => apiClient.getBestsellerBooks(limit));
  const testGetCategories = () => runTest('book-categories', '/api/v1/books/categories', 'GET', () => apiClient.getBookCategories());
  const testGetStats = () => runTest('book-stats', '/api/v1/books/stats', 'GET', () => apiClient.getBookStats());
  
  const testGetBooksByCategory = () => {
    if (!category.trim()) return;
    runTest('books-by-category', `/api/v1/books/category/${category}`, 'GET', () => apiClient.getBooksByCategory(category));
  };

  const testCreateBook = () => {
    if (!newBook.title.trim() || !newBook.description.trim()) return;
    runTest('create-book', '/api/v1/books', 'POST', () => apiClient.createBook(newBook));
  };

  const testBooksPost = () => {
    const testData = { test: true, message: 'Testing POST endpoint', timestamp: new Date().toISOString() };
    runTest('test-books-post', '/api/v1/books/test', 'POST', () => apiClient.testBooksPost(testData));
  };

  // Bulk Testing
  const runBulkSystemTests = async () => {
    setBulkTesting(true);
    const systemTests = [
      () => testHealth(),
      () => testApiInfo(),
      () => testV1Info(),
      () => testV1Test(),
    ];

    for (const test of systemTests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      test();
    }
    setBulkTesting(false);
  };

  const runBulkBookTests = async () => {
    setBulkTesting(true);
    const bookTests = [
      () => testGetBooks(),
      () => testGetFeatured(),
      () => testGetBestsellers(),
      () => testGetCategories(),
      () => testGetStats(),
    ];

    for (const test of bookTests) {
      await new Promise(resolve => setTimeout(resolve, 500));
      test();
    }
    setBulkTesting(false);
  };

  // Clear all test results
  const clearResults = () => {
    setTestResults([]);
    setSelectedResult(null);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <CircularProgress size={16} />;
      case 'success':
        return <CheckCircle sx={{ color: 'green', fontSize: 16 }} />;
      case 'error':
        return <Error sx={{ color: 'red', fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'primary';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        API Testing Environment
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Test and debug backend API endpoints for Dr. Syed M Quadri's website
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Testing Panel */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab icon={<Send />} label="🚀 Postman" />
                <Tab icon={<Settings />} label="System" />
                <Tab icon={<LibraryBooks />} label="Books Read" />
                <Tab icon={<Add />} label="Books Write" />
                <Tab icon={<Search />} label="Search & Filter" />
                <Tab icon={<Storage />} label="CRUD Tests" />
                <Tab icon={<Settings />} label="Bulk Tests" />
                <Tab icon={<Storage />} label="Advanced" />
              </Tabs>
            </CardHeader>
            <CardContent>
              {/* Postman-like Interface */}
              <TabPanel value={tabValue} index={0}>
                <PostmanTab loading={loading} />
              </TabPanel>

              {/* System Tests */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  System Health & API Tests
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testHealth}
                      disabled={loading === 'health'}
                      startIcon={loading === 'health' ? <CircularProgress size={16} /> : <Settings />}
                    >
                      Health Check
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testApiInfo}
                      disabled={loading === 'api-info'}
                      startIcon={loading === 'api-info' ? <CircularProgress size={16} /> : <Settings />}
                    >
                      API Info
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testV1Info}
                      disabled={loading === 'v1-info'}
                      startIcon={loading === 'v1-info' ? <CircularProgress size={16} /> : <Settings />}
                    >
                      V1 Info
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testV1Test}
                      disabled={loading === 'v1-test'}
                      startIcon={loading === 'v1-test' ? <CircularProgress size={16} /> : <Settings />}
                    >
                      V1 Test
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Bulk System Testing
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={runBulkSystemTests}
                      disabled={bulkTesting}
                      startIcon={bulkTesting ? <CircularProgress size={16} /> : <Settings />}
                    >
                      Run All System Tests
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={clearResults}
                    >
                      Clear All Results
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Books Read Tests */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Books Read Operations
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testGetBooks}
                      disabled={loading === 'get-books'}
                      startIcon={loading === 'get-books' ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Get All Books
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testGetFeatured}
                      disabled={loading === 'featured-books'}
                      startIcon={loading === 'featured-books' ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Featured Books
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testGetBestsellers}
                      disabled={loading === 'bestseller-books'}
                      startIcon={loading === 'bestseller-books' ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Bestsellers
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={testGetCategories}
                      disabled={loading === 'book-categories'}
                      startIcon={loading === 'book-categories' ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Categories
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Individual Book Lookup
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Book ID/Slug"
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      placeholder="Enter book ID or slug..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={testGetBook}
                      disabled={!bookId.trim() || loading === 'get-book'}
                      startIcon={loading === 'get-book' ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Get Book
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Bulk Book Testing
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={runBulkBookTests}
                      disabled={bulkTesting}
                      startIcon={bulkTesting ? <CircularProgress size={16} /> : <LibraryBooks />}
                    >
                      Run All Book Tests
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Limit"
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Books Write Tests */}
              <TabPanel value={tabValue} index={3}>
                <BooksWriteTab
                  newBook={newBook}
                  setNewBook={setNewBook}
                  testCreateBook={testCreateBook}
                  testBooksPost={testBooksPost}
                  loading={loading}
                />
              </TabPanel>

              {/* Search & Filter Tests */}
              <TabPanel value={tabValue} index={4}>
                <SearchFilterTab
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  category={category}
                  setCategory={setCategory}
                  testSearchBooks={testSearchBooks}
                  testGetBooksByCategory={testGetBooksByCategory}
                  loading={loading}
                />
              </TabPanel>

              {/* CRUD Tests */}
              <TabPanel value={tabValue} index={5}>
                <CRUDTestTab
                  loading={loading}
                  runTest={runTest}
                  apiClient={apiClient}
                />
              </TabPanel>

              {/* Bulk Tests */}
              <TabPanel value={tabValue} index={6}>
                <BulkTestTab
                  loading={loading}
                  runTest={runTest}
                  apiClient={apiClient}
                />
              </TabPanel>

              {/* Advanced Tests */}
              <TabPanel value={tabValue} index={7}>
                <AdvancedTab
                  testGetStats={testGetStats}
                  testResults={testResults}
                  selectedResult={selectedResult}
                  setSelectedResult={setSelectedResult}
                  loading={loading}
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 16 }}>
            <CardHeader>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage />
                Test Results ({testResults.length}/10)
              </Typography>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No tests run yet
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {testResults.map((result, index) => (
                    <Card 
                      key={index} 
                      variant="outlined" 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        cursor: 'pointer',
                        border: selectedResult === result ? '2px solid' : '1px solid',
                        borderColor: selectedResult === result ? 'primary.main' : 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => setSelectedResult(result)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(result.status)}
                          <Chip label={result.method} color={getStatusColor(result.status)} size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mb: 1 }}>
                        {result.endpoint}
                      </Typography>
                      
                      {result.response && (
                        <Typography variant="caption">
                          {result.response.success ? (
                            <span style={{ color: 'green' }}>
                              ✅ Success
                              {result.response.data && Array.isArray(result.response.data) && (
                                <span> ({result.response.data.length} items)</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: 'red' }}>
                              ❌ {result.response.error?.message || 'Unknown error'}
                            </span>
                          )}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
