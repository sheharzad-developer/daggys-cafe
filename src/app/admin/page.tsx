import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ShoppingBag, User, CheckCircle, CreditCard } from "lucide-react";
import { AdminClient } from './admin-client';
import { PaymentManagement } from '@/components/payment-management';
import { orders } from '@/lib/data';

const getDashboardStats = () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const todaysOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        orderDate.setHours(0,0,0,0);
        return orderDate.getTime() === today.getTime() && o.status === 'Delivered';
    });
    
    const dailySales = todaysOrders.reduce((sum, order) => sum + order.total, 0);
    const newOrders = orders.filter(o => o.status === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

    return { dailySales, newOrders, deliveredOrders, uniqueCustomers };
}

export default function AdminPage() {
    const { dailySales, newOrders, deliveredOrders, uniqueCustomers } = getDashboardStats();

    return (
        <div className="space-y-8">
            <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${dailySales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Sales from delivered orders today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newOrders}</div>
                        <p className="text-xs text-muted-foreground">Pending orders to be processed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveredOrders}</div>
                        <p className="text-xs text-muted-foreground">Total orders fulfilled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueCustomers}</div>
                        <p className="text-xs text-muted-foreground">Total customers served</p>
                    </CardContent>
                </Card>
            </div>
            
            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Order Management
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Management
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders">
                    <AdminClient initialOrders={orders} />
                </TabsContent>
                
                <TabsContent value="payments">
                    <PaymentManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
