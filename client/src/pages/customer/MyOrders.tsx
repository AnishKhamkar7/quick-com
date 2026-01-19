import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types based on Prisma schema
type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl?: string;
    category: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  onTheWayAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  orderItems: OrderItem[];
  deliveryPartner?: {
    user: {
      name: string;
      phone?: string;
    };
    vehicleType?: string;
  };
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch("/api/orders/my-orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />;
      case "PICKED_UP":
      case "ON_THE_WAY":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "ACCEPTED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PICKED_UP":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "ON_THE_WAY":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "DELIVERED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const filters: Array<{ label: string; value: "all" | OrderStatus }> = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "ON_THE_WAY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Package className="w-12 h-12 animate-pulse mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-2">
            <Package className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No orders found</h3>
            <p className="text-muted-foreground text-center">
              {activeFilter === "all"
                ? "You haven't placed any orders yet"
                : `No ${activeFilter.toLowerCase()} orders`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", getStatusColor(order.status))}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Delivery Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-muted-foreground">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Partner Info */}
                  {order.deliveryPartner && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2 text-sm">
                        <Truck className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">Delivery Partner</p>
                          <p className="text-muted-foreground">
                            {order.deliveryPartner.user.name}
                            {order.deliveryPartner.vehicleType &&
                              ` • ${order.deliveryPartner.vehicleType}`}
                          </p>
                          {order.deliveryPartner.user.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              <span className="text-muted-foreground">
                                {order.deliveryPartner.user.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Order Items - Expandable */}
                  <Separator />
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                      className="w-full justify-between"
                    >
                      <span className="font-medium">Order Items</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                          >
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-sm">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}

                        <Separator />
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span>
                              ₹
                              {(order.totalAmount - order.deliveryFee).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Delivery Fee
                            </span>
                            <span>₹{order.deliveryFee.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <>
                      <Separator />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Notes</p>
                        <p className="text-muted-foreground">{order.notes}</p>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {order.status === "DELIVERED" && (
                      <Button variant="outline" size="sm" className="flex-1">
                        Reorder
                      </Button>
                    )}
                    {order.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      Track Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
