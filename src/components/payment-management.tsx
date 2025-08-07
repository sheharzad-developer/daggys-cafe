"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

interface PaymentIntent {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string;
  customer_name: string;
  order_items: any[];
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  payment_intent_id: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  todayRevenue: number;
}

export function PaymentManagement() {
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch payment intents
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_intents')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentError) throw paymentError;

      // Fetch orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;

      setPaymentIntents(paymentData || []);
      setOrders(orderData || []);
      
      // Calculate stats
      calculateStats(paymentData || [], orderData || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (payments: PaymentIntent[], orders: Order[]) => {
    const successfulPayments = payments.filter(p => p.status === 'succeeded');
    const failedPayments = payments.filter(p => p.status === 'failed');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = successfulPayments.filter(p => 
      new Date(p.created_at) >= today
    );
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalRevenue,
      totalTransactions: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      averageOrderValue: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
      todayRevenue,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
      canceled: { variant: 'outline' as const, icon: AlertCircle, color: 'text-gray-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPayments = paymentIntents.filter(payment => {
    const matchesSearch = 
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.stripe_payment_intent_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportData = () => {
    const csvContent = [
      ['Payment ID', 'Customer', 'Email', 'Amount', 'Status', 'Date'].join(','),
      ...filteredPayments.map(payment => [
        payment.stripe_payment_intent_id,
        payment.customer_name || 'N/A',
        payment.customer_email || 'N/A',
        payment.amount,
        payment.status,
        new Date(payment.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.successfulPayments} successful payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average order value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTransactions > 0 
                ? ((stats.successfulPayments / stats.totalTransactions) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.failedPayments} failed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Monitor and manage all payment transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchPaymentData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer, email, or payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No payments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.stripe_payment_intent_id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customer_name || 'Guest'}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}