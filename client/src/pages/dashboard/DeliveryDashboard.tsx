
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default function DeliveryPartnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const stats = [
    {
      title: "Earnings Today",
      value: "$120.50",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Deliveries Today",
      value: "12",
      icon: Package,
      color: "text-blue-600",
    },
    { title: "On the Way", value: "3", icon: MapPin, color: "text-orange-600" },
    {
      title: "Avg Time",
      value: "28 min",
      icon: Clock,
      color: "text-purple-600",
    },
  ];

  const availableOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      pickupLocation: "Main Store",
      deliveryLocation: "123 Oak St",
      amount: "$45.99",
      distance: "2.5 km",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      pickupLocation: "Downtown Branch",
      deliveryLocation: "456 Pine Ave",
      amount: "$32.50",
      distance: "3.2 km",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      pickupLocation: "Main Store",
      deliveryLocation: "789 Elm Rd",
      amount: "$78.20",
      distance: "1.8 km",
    },
  ];

  const myDeliveries = [
    {
      id: "DEL-001",
      order: "ORD-101",
      status: "Picked Up",
      destination: "Downtown",
    },
    {
      id: "DEL-002",
      order: "ORD-102",
      status: "On the Way",
      destination: "North Side",
    },
    {
      id: "DEL-003",
      order: "ORD-103",
      status: "Delivered",
      destination: "West End",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Delivery Partner Portal
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your deliveries and earnings
        </p>
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
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="available">Available Orders</TabsTrigger>
          <TabsTrigger value="deliveries">My Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Deliveries</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-bold text-green-600">10</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress</span>
                  <span className="font-bold text-orange-600">2</span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span>Total Earned</span>
                  <span className="font-bold text-green-600">$120.50</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating & Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Your Rating</span>
                  <span className="font-bold text-yellow-600">4.8/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Reviews</span>
                  <span className="font-bold">256</span>
                </div>
                <div className="flex justify-between">
                  <span>Positive Feedback</span>
                  <span className="font-bold text-green-600">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {order.amount}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> From:{" "}
                      {order.pickupLocation}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> To:{" "}
                      {order.deliveryLocation}
                    </p>
                    <p className="text-muted-foreground">
                      Distance: {order.distance}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedOrder(order.id)}
                    className="w-full"
                  >
                    Accept Delivery
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>My Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex justify-between items-center p-3 bg-muted rounded border"
                >
                  <div>
                    <p className="font-semibold">{delivery.order}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {delivery.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {delivery.status === "Delivered" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : null}
                    <span
                      className={`text-sm font-semibold ${
                        delivery.status === "Delivered"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
