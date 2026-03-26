'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Refresh,
  Visibility,
  Delete,
  ShoppingCart,
  FlashOn
} from '@mui/icons-material';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.API_BASE_URL;

interface Order {
  _id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  totalAmount: number;
  type: 'cart' | 'buy_now';
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/all`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Book Purchases & Store Actions
        </Typography>
        <IconButton onClick={fetchOrders} color="primary" sx={{ bgcolor: 'white', shadow: 1 }}>
          <Refresh />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Qty</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">No orders found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{order.title}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={order.type === 'cart' ? <ShoppingCart sx={{ fontSize: '14px !important' }} /> : <FlashOn sx={{ fontSize: '14px !important' }} />}
                        label={order.type === 'cart' ? 'Saved to Cart' : 'Direct Purchase'} 
                        size="small"
                        color={order.type === 'cart' ? 'primary' : 'secondary'}
                        variant="outlined"
                        sx={{ fontWeight: 'bold', fontSize: '10px' }}
                      />
                    </TableCell>
                    <TableCell>
                      {order.customerName}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {order.customerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info">
                          <Visibility size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <Delete size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
