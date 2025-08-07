
"use client";

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orders as initialOrdersData } from '@/lib/data';
import { useSocket } from '@/hooks/use-socket';
import type { Order } from '@/lib/data';

const getSalesData = (orders: Order[]) => {
    const salesByDay: { [key: string]: number } = {};
    orders.filter(o => o.status === 'Delivered').forEach(order => {
        const day = new Date(order.date).toLocaleDateString('en-US', { weekday: 'short' });
        salesByDay[day] = (salesByDay[day] || 0) + order.total;
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({ name: day, total: salesByDay[day] || 0 }));
};

export function AdminClient({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const { onOrderUpdate, emitNewOrder } = useSocket();

    // Request notification permission when component mounts
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, []);

    // Listen for real-time order updates
    useEffect(() => {
        onOrderUpdate((orderData: any) => {
            console.log('Real-time order update received:', orderData);
            
            // Trigger notifications for new orders
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Order!', {
                    body: `Order #${orderData.id} from ${orderData.customerName}`,
                    icon: '/favicon.ico'
                });
            }
            
            // Sound notification
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(error => {
                console.log('Audio notification failed:', error);
            });
        });
    }, [onOrderUpdate]);

    const handleStatusChange = (orderId: string, newStatus: 'Pending' | 'Delivered' | 'Cancelled') => {
        setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            
            // Emit real-time update for status changes
            if (newStatus === 'Pending') {
                const order = prevOrders.find(o => o.id === orderId);
                if (order) {
                    // Emit to Socket.IO for real-time updates
                    emitNewOrder({
                        ...order,
                        status: newStatus
                    });
                }
            }
            
            return updatedOrders;
        });
    };

    const salesData = getSalesData(orders);

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Total sales from delivered orders over the last week.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Manage and track recent customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.slice(0, 5).map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-sm text-muted-foreground">{order.id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={order.status} onValueChange={(value: 'Pending' | 'Delivered' | 'Cancelled') => handleStatusChange(order.id, value)}>
                                            <SelectTrigger className="w-32 h-8">
                                                <SelectValue>
                                                    <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>{order.status}</Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
