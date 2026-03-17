import React from 'react';
import {
  Typography,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { Storage, BarChart } from '@mui/icons-material';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'loading' | 'success' | 'error';
  response?: any;
  timestamp: string;
}

interface AdvancedTabProps {
  testGetStats: () => void;
  testResults: TestResult[];
  selectedResult: TestResult | null;
  setSelectedResult: React.Dispatch<React.SetStateAction<TestResult | null>>;
  loading: string | null;
}

export default function AdvancedTab({
  testGetStats,
  testResults,
  selectedResult,
  setSelectedResult,
  loading
}: AdvancedTabProps) {
  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Advanced Operations & Analytics
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            onClick={testGetStats}
            disabled={loading === 'book-stats'}
            startIcon={loading === 'book-stats' ? <CircularProgress size={16} /> : <BarChart />}
          >
            Get Book Statistics
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Storage />}
            disabled
          >
            Database Health (Coming Soon)
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Test Session Analytics
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {successCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {errorCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Response Inspector
      </Typography>
      
      {selectedResult ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip 
                label={selectedResult.method} 
                color={selectedResult.status === 'success' ? 'success' : 'error'} 
                size="small" 
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {selectedResult.endpoint}
              </Typography>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Response Data:
            </Typography>
            
            <Box
              component="pre"
              sx={{
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 300,
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(selectedResult.response, null, 2)}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Click on any test result to inspect the response data
            </Typography>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        API Performance Metrics
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Average Response Time"
            value="Calculating..."
            disabled
            helperText="Feature coming soon"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Success Rate"
            value={totalTests > 0 ? `${((successCount / totalTests) * 100).toFixed(1)}%` : '0%'}
            disabled
          />
        </Grid>
      </Grid>
    </>
  );
}
