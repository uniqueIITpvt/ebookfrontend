import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  PlayArrow,
  CheckCircle,
  Error,
  Schedule,
  Stop
} from '@mui/icons-material';

interface BulkTestTabProps {
  loading: string | null;
  runTest: (testName: string, endpoint: string, method: string, apiCall: () => Promise<any>) => Promise<void>;
  apiClient: any;
}

interface TestSuite {
  name: string;
  description: string;
  tests: Array<{
    name: string;
    endpoint: string;
    method: string;
    apiCall: () => Promise<any>;
    enabled: boolean;
  }>;
}

export default function BulkTestTab({ loading, runTest, apiClient }: BulkTestTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{name: string, status: 'success' | 'error' | 'pending'}>>([]);

  // Define test suites
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'System Health Suite',
      description: 'Test all system endpoints for connectivity and basic functionality',
      tests: [
        {
          name: 'Health Check',
          endpoint: '/health',
          method: 'GET',
          apiCall: () => apiClient.getHealth(),
          enabled: true
        },
        {
          name: 'API Info',
          endpoint: '/',
          method: 'GET',
          apiCall: () => apiClient.getApiInfo(),
          enabled: true
        },
        {
          name: 'V1 Info',
          endpoint: '/api/v1',
          method: 'GET',
          apiCall: () => apiClient.getV1Info(),
          enabled: true
        },
        {
          name: 'V1 Test',
          endpoint: '/api/v1/test',
          method: 'GET',
          apiCall: () => apiClient.testV1(),
          enabled: true
        }
      ]
    },
    {
      name: 'Books Read Suite',
      description: 'Test all book reading endpoints',
      tests: [
        {
          name: 'Get All Books',
          endpoint: '/api/v1/books',
          method: 'GET',
          apiCall: () => apiClient.getBooks(),
          enabled: true
        },
        {
          name: 'Featured Books',
          endpoint: '/api/v1/books/featured',
          method: 'GET',
          apiCall: () => apiClient.getFeaturedBooks(5),
          enabled: true
        },
        {
          name: 'Bestsellers',
          endpoint: '/api/v1/books/bestsellers',
          method: 'GET',
          apiCall: () => apiClient.getBestsellerBooks(10),
          enabled: true
        },
        {
          name: 'Categories',
          endpoint: '/api/v1/books/categories',
          method: 'GET',
          apiCall: () => apiClient.getBookCategories(),
          enabled: true
        },
        {
          name: 'Book Stats',
          endpoint: '/api/v1/books/stats',
          method: 'GET',
          apiCall: () => apiClient.getBookStats(),
          enabled: true
        }
      ]
    },
    {
      name: 'Search & Filter Suite',
      description: 'Test search and filtering functionality',
      tests: [
        {
          name: 'Search Books - "anxiety"',
          endpoint: '/api/v1/books/search?q=anxiety',
          method: 'GET',
          apiCall: () => apiClient.searchBooks('anxiety'),
          enabled: true
        },
        {
          name: 'Search Books - "mental health"',
          endpoint: '/api/v1/books/search?q=mental health',
          method: 'GET',
          apiCall: () => apiClient.searchBooks('mental health'),
          enabled: true
        },
        {
          name: 'Books by Category - Mental Health',
          endpoint: '/api/v1/books/category/Mental Health',
          method: 'GET',
          apiCall: () => apiClient.getBooksByCategory('Mental Health'),
          enabled: true
        },
        {
          name: 'Books by Category - Psychology',
          endpoint: '/api/v1/books/category/Psychology',
          method: 'GET',
          apiCall: () => apiClient.getBooksByCategory('Psychology'),
          enabled: true
        }
      ]
    },
    {
      name: 'CRUD Operations Suite',
      description: 'Test Create, Read, Update, Delete operations',
      tests: [
        {
          name: 'Test POST Endpoint',
          endpoint: '/api/v1/books/test',
          method: 'POST',
          apiCall: () => apiClient.testBooksPost({ test: true, timestamp: new Date().toISOString() }),
          enabled: true
        },
        {
          name: 'Create Book',
          endpoint: '/api/v1/books',
          method: 'POST',
          apiCall: () => apiClient.createBook({
            title: 'Bulk Test Book',
            author: 'Dr. Syed M Quadri',
            description: 'A test book created during bulk testing',
            category: 'Mental Health',
            price: 25.99,
            type: 'Books'
          }),
          enabled: false // Disabled by default to avoid creating too many test books
        }
      ]
    }
  ]);

  const toggleTest = (suiteIndex: number, testIndex: number) => {
    setTestSuites(prev => prev.map((suite, sIndex) => 
      sIndex === suiteIndex 
        ? {
            ...suite,
            tests: suite.tests.map((test, tIndex) => 
              tIndex === testIndex ? { ...test, enabled: !test.enabled } : test
            )
          }
        : suite
    ));
  };

  const toggleSuite = (suiteIndex: number, enabled: boolean) => {
    setTestSuites(prev => prev.map((suite, sIndex) => 
      sIndex === suiteIndex 
        ? {
            ...suite,
            tests: suite.tests.map(test => ({ ...test, enabled }))
          }
        : suite
    ));
  };

  const runBulkTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    // Collect all enabled tests
    const allTests = testSuites.flatMap(suite => 
      suite.tests.filter(test => test.enabled)
    );

    if (allTests.length === 0) {
      alert('No tests selected! Please enable at least one test.');
      setIsRunning(false);
      return;
    }

    const totalTests = allTests.length;
    let completedTests = 0;

    // Initialize results
    setResults(allTests.map(test => ({ name: test.name, status: 'pending' })));

    for (const test of allTests) {
      setCurrentTest(test.name);
      
      try {
        await runTest(`bulk-${test.name.toLowerCase().replace(/\s+/g, '-')}`, test.endpoint, test.method, test.apiCall);
        
        // Update result status
        setResults(prev => prev.map(result => 
          result.name === test.name 
            ? { ...result, status: 'success' }
            : result
        ));
      } catch (error) {
        console.error(`Test failed: ${test.name}`, error);
        
        // Update result status
        setResults(prev => prev.map(result => 
          result.name === test.name 
            ? { ...result, status: 'error' }
            : result
        ));
      }

      completedTests++;
      setProgress((completedTests / totalTests) * 100);

      // Small delay between tests to avoid overwhelming the server
      if (completedTests < totalTests) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  const stopBulkTests = () => {
    setIsRunning(false);
    setCurrentTest('');
  };

  const getEnabledTestsCount = () => {
    return testSuites.reduce((total, suite) => 
      total + suite.tests.filter(test => test.enabled).length, 0
    );
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: 'green', fontSize: 20 }} />;
      case 'error':
        return <Error sx={{ color: 'red', fontSize: 20 }} />;
      case 'pending':
        return <Schedule sx={{ color: 'grey', fontSize: 20 }} />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk API Testing Suite
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Run comprehensive tests across all API endpoints. Select which test suites to run and monitor progress in real-time.
      </Alert>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={runBulkTests}
                disabled={isRunning || getEnabledTestsCount() === 0}
                startIcon={isRunning ? <Schedule /> : <PlayArrow />}
              >
                {isRunning ? `Running Tests... (${Math.round(progress)}%)` : `Run ${getEnabledTestsCount()} Selected Tests`}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={stopBulkTests}
                disabled={!isRunning}
                startIcon={<Stop />}
              >
                Stop Testing
              </Button>
            </Grid>
          </Grid>

          {isRunning && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Current Test: {currentTest}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <List dense>
              {results.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getStatusIcon(result.status)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={result.name}
                    secondary={result.status === 'pending' ? 'Waiting...' : result.status}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Test Suites Configuration */}
      <Typography variant="h6" gutterBottom>
        Test Suites Configuration
      </Typography>

      {testSuites.map((suite, suiteIndex) => (
        <Card key={suiteIndex} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6">
                  {suite.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {suite.description}
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  onClick={() => toggleSuite(suiteIndex, true)}
                  sx={{ mr: 1 }}
                >
                  Enable All
                </Button>
                <Button
                  size="small"
                  onClick={() => toggleSuite(suiteIndex, false)}
                >
                  Disable All
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={1}>
              {suite.tests.map((test, testIndex) => (
                <Grid item xs={12} key={testIndex}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={test.enabled}
                        onChange={() => toggleTest(suiteIndex, testIndex)}
                        disabled={isRunning}
                      />
                    }
                    label={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {test.name}
                          </Typography>
                          <Chip 
                            label={test.method} 
                            size="small" 
                            color={test.method === 'GET' ? 'primary' : 'secondary'}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {test.endpoint}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
