import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, Truck, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      icon: Users,
      trend: "+12% from last month",
    },
    {
      title: "Total Orders",
      value: "8,234",
      icon: Package,
      trend: "+23% from last month",
    },
    {
      title: "Active Delivery Partners",
      value: "345",
      icon: Truck,
      trend: "+5% from last month",
    },
    {
      title: "Revenue",
      value: "$45,231",
      icon: TrendingUp,
      trend: "+8% from last month",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      status: "Delivered",
      amount: "$45.99",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      status: "On the Way",
      amount: "$32.50",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      status: "Pending",
      amount: "$78.20",
    },
    {
      id: "ORD-004",
      customer: "Sarah Williams",
      status: "Picked Up",
      amount: "$56.99",
    },
  ];

  const deliveryPartners = [
    { id: "DP-001", name: "Alex Rodriguez", status: "Available", orders: 12 },
    { id: "DP-002", name: "Emma Davis", status: "Busy", orders: 5 },
    { id: "DP-003", name: "Chris Brown", status: "Available", orders: 8 },
    { id: "DP-004", name: "Lisa Chen", status: "Offline", orders: 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Monitor your quick commerce system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Response Time</span>
                  <span className="text-green-600 font-semibold">45ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <span className="text-green-600 font-semibold">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>WebSocket Connections</span>
                  <span className="text-green-600 font-semibold">
                    128 active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-muted rounded"
                  >
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliveryPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex justify-between items-center p-3 bg-muted rounded"
                  >
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {partner.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{partner.orders} orders</p>
                      <p
                        className={`text-sm ${partner.status === "Available" ? "text-green-600" : "text-orange-600"}`}
                      >
                        {partner.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
