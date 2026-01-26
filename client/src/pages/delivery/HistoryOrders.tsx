import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Package,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Phone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/axios";
import { useState } from "react";

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
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  category: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
}

interface HistoryOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  city: string;
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
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  deliveryPartner?: DeliveryPartner;
  items: OrderItem[];
}

const HistoryOrderSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-40" />
    </CardContent>
  </Card>
);

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-500/10 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-500/10 text-red-700 border-red-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const OrderCard = ({ order }: { order: HistoryOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const completedAt = order.deliveredAt || order.cancelledAt;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <span>Order #{order.orderNumber}</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(order.status)}
                >
                  {getStatusText(order.status)}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedAt
                  ? formatDate(completedAt)
                  : formatDate(order.createdAt)}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-sm font-semibold">₹{order.totalAmount}</p>
            </div>

            {order.status === "DELIVERED" && order.deliveryFee > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Delivery Fee
                </p>
                <p className="text-base font-bold text-green-700">
                  ₹{order.deliveryFee}
                </p>
              </div>
            )}
          </div>

          <CollapsibleContent className="space-y-4">
            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Order Details</p>
              <ScrollArea className="h-auto max-h-48">
                <div className="space-y-2 pr-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md border border-primary/20">
                <p className="text-sm font-semibold">Total Amount</p>
                <p className="text-base font-bold text-primary">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>

            {order.customer.phone && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {order.customer.phone}
                  </span>
                </div>
              </>
            )}

            {order.notes && (
              <>
                <Separator />
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <p className="text-xs font-medium text-yellow-900 mb-1">
                    Delivery Notes
                  </p>
                  <p className="text-sm text-yellow-800">{order.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {completedAt
                  ? `Completed: ${formatDateTime(completedAt)}`
                  : `Ordered: ${formatDateTime(order.createdAt)}`}
              </span>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default function DeliveryHistory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const fetchDeliveryHistory = async (): Promise<HistoryOrder[]> => {
    const response = await api.get("/orders/delivery-partner/history", {
      params: {
        city: user?.deliveryPartner?.city,
      },
    });
    // Ensure we always return an array
    return response.data.data;
  };

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["deliveryHistory", user?.deliveryPartner?.city],
    queryFn: fetchDeliveryHistory,
    staleTime: 60 * 1000,
  });

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders?.filter((o) => o.status === activeTab.toUpperCase());

  const stats = {
    total: orders?.length || 0,
    delivered: orders?.filter((o) => o.status === "DELIVERED").length || 0,
    cancelled: orders?.filter((o) => o.status === "CANCELLED").length || 0,
    totalEarnings:
      orders
        ?.filter((o) => o.status === "DELIVERED")
        .reduce((sum, o) => sum + o.deliveryFee, 0) || 0,
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Delivery History</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.delivered}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load delivery history. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({stats.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({stats.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <>
              <HistoryOrderSkeleton />
              <HistoryOrderSkeleton />
              <HistoryOrderSkeleton />
            </>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "Your completed deliveries will appear here."
                    : `No ${activeTab} orders found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
