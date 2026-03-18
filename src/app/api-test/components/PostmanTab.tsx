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
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Send,
  Add,
  Delete,
  ExpandMore,
  Save,
  FolderOpen,
  History,
  ContentCopy
} from '@mui/icons-material';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  timestamp: string;
}

interface PostmanTabProps {
  loading: string | null;
}

import { BACKEND_URL } from '@/config/backend-url.config';

export default function PostmanTab({ loading }: PostmanTabProps) {
  // Request Configuration
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState(`${BACKEND_URL}/api/v1/books`);
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
    { key: '', value: '', enabled: true }
  ]);
  const [body, setBody] = useState('{\n  "title": "Test Book",\n  "author": "Dr. Syed M Quadri",\n  "description": "A test book created via Postman-like interface",\n  "category": "Mental Health",\n  "price": 29.99,\n  "type": "Books"\n}');
  
  // Response Data
  const [response, setResponse] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [responseStatus, setResponseStatus] = useState<number>(0);
  const [responseHeaders, setResponseHeaders] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState(0);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [requestHistory, setRequestHistory] = useState<SavedRequest[]>([]);
  const [requestName, setRequestName] = useState('');

  // HTTP Methods
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Common API Endpoints for quick access
  const commonEndpoints = [
    { name: 'Health Check', method: 'GET', url: `${BACKEND_URL}/health` },
    { name: 'API Info', method: 'GET', url: `${BACKEND_URL}/` },
    { name: 'All Books', method: 'GET', url: `${BACKEND_URL}/api/v1/books` },
    { name: 'Featured Books', method: 'GET', url: `${BACKEND_URL}/api/v1/books/featured` },
    { name: 'Create Book', method: 'POST', url: `${BACKEND_URL}/api/v1/books` },
    { name: 'Search Books', method: 'GET', url: `${BACKEND_URL}/api/v1/books/search?q=anxiety` },
    { name: 'Book Categories', method: 'GET', url: `${BACKEND_URL}/api/v1/books/categories` },
    { name: 'Book Stats', method: 'GET', url: `${BACKEND_URL}/api/v1/books/stats` }
  ];

  // Header Management
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // Request Execution
  const sendRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setResponseTime(0);
    setResponseStatus(0);
    setResponseHeaders({});

    const startTime = Date.now();

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      headers.forEach(header => {
        if (header.enabled && header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        requestOptions.body = body;
      }

      // Make request
      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      
      setResponseTime(endTime - startTime);
      setResponseStatus(response.status);
      
      // Get response headers
      const responseHeadersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeadersObj[key] = value;
      });
      setResponseHeaders(responseHeadersObj);

      // Get response body
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setResponse(responseData);

      // Add to history
      const historyItem: SavedRequest = {
        id: Date.now().toString(),
        name: `${method} ${url}`,
        method,
        url,
        headers: [...headers],
        body,
        timestamp: new Date().toISOString()
      };
      setRequestHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20

    } catch (error) {
      console.error('Request failed:', error);
      setResponse({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      });
      setResponseStatus(0);
      setResponseTime(Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Request
  const saveRequest = () => {
    if (!requestName.trim()) {
      alert('Please enter a request name');
      return;
    }

    const savedRequest: SavedRequest = {
      id: Date.now().toString(),
      name: requestName,
      method,
      url,
      headers: [...headers],
      body,
      timestamp: new Date().toISOString()
    };

    setSavedRequests(prev => [...prev, savedRequest]);
    setRequestName('');
    alert('Request saved successfully!');
  };

  // Load Request
  const loadRequest = (request: SavedRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders([...request.headers]);
    setBody(request.body);
  };

  // Load Common Endpoint
  const loadCommonEndpoint = (endpoint: typeof commonEndpoints[0]) => {
    setMethod(endpoint.method);
    setUrl(endpoint.url);
    
    // Set appropriate body for POST requests
    if (endpoint.method === 'POST' && endpoint.url.includes('/books')) {
      setBody('{\n  "title": "Test Book",\n  "author": "Dr. Syed M Quadri",\n  "description": "A test book created via API testing",\n  "category": "Mental Health",\n  "price": 29.99,\n  "type": "Books"\n}');
    } else {
      setBody('');
    }
  };

  // Copy Response
  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    alert('Response copied to clipboard!');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Postman-like API Testing Interface
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Test any API endpoint with custom methods, headers, and body. Full Postman-like functionality in your browser!
      </Alert>

      {/* Quick Access Endpoints */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Access Endpoints
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonEndpoints.map((endpoint, index) => (
              <Chip
                key={index}
                label={`${endpoint.method} ${endpoint.name}`}
                onClick={() => loadCommonEndpoint(endpoint)}
                color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                variant="outlined"
                clickable
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Request Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Request Configuration
          </Typography>
          
          {/* Method and URL */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select
                  value={method}
                  label="Method"
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {httpMethods.map(m => (
                    <MenuItem key={m} value={m}>
                      <Chip 
                        label={m} 
                        size="small" 
                        color={m === 'GET' ? 'primary' : m === 'POST' ? 'success' : m === 'DELETE' ? 'error' : 'default'}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Request URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5000/api/v1/books"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={sendRequest}
                disabled={isLoading || !url.trim()}
                startIcon={isLoading ? undefined : <Send />}
                sx={{ height: '56px' }}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </Grid>
          </Grid>

          {/* Request Details Tabs */}
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Headers" />
            <Tab label="Body" />
            <Tab label="Save/Load" />
          </Tabs>

          {/* Headers Tab */}
          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Request Headers</Typography>
                <Button startIcon={<Add />} onClick={addHeader} size="small">
                  Add Header
                </Button>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="40px">✓</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell width="60px">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {headers.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            placeholder="Header name"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            placeholder="Header value"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeHeader(index)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Body Tab */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Request Body {method === 'GET' && '(Not applicable for GET requests)'}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter JSON body here..."
                disabled={method === 'GET' || method === 'HEAD'}
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          )}

          {/* Save/Load Tab */}
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Save Current Request
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Request Name"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="My API Test"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={saveRequest}
                        startIcon={<Save />}
                        sx={{ height: '56px' }}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Saved Requests ({savedRequests.length})
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {savedRequests.map((request) => (
                      <Card key={request.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {request.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.method} {request.url}
                            </Typography>
                          </Box>
                          <Button size="small" onClick={() => loadRequest(request)}>
                            Load
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Request History ({requestHistory.length})
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {requestHistory.map((request) => (
                      <Card key={request.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={request.method} size="small" />
                              <Typography variant="body2">
                                {request.url.length > 40 ? request.url.substring(0, 40) + '...' : request.url}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(request.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                          <Button size="small" onClick={() => loadRequest(request)}>
                            Load
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Response Section */}
      {(response !== null || responseStatus > 0) && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Response
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={`${responseStatus} ${responseStatus >= 200 && responseStatus < 300 ? 'OK' : 'ERROR'}`}
                  color={responseStatus >= 200 && responseStatus < 300 ? 'success' : 'error'}
                />
                <Chip label={`${responseTime}ms`} variant="outlined" />
                <Button size="small" startIcon={<ContentCopy />} onClick={copyResponse}>
                  Copy
                </Button>
              </Box>
            </Box>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Response Headers</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
                  {JSON.stringify(responseHeaders, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Response Body
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 400,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
