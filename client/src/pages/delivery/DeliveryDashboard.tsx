import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Truck,
  PackageCheck,
  Navigation,
  Phone,
  Clock,
  Package,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/context/socket-context";
import { useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

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

interface ActiveOrder {
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
  items: OrderItem[];
}
const ActiveOrderSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Separator />
      <Skeleton className="h-48 w-full rounded-md" />
      <Separator />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-gray-500/10 text-gray-700 border-gray-200";
    case "ACCEPTED":
      return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "PICKED_UP":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "ON_THE_WAY":
      return "bg-purple-500/10 text-purple-700 border-purple-200";
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
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "PICKED_UP":
      return "Picked Up";
    case "ON_THE_WAY":
      return "On The Way";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

const formatTime = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function DeliveryPartnerDashboard() {
  const queryClient = useQueryClient();
  const { joinOrderRoom, leaveOrderRoom, isConnected } = useWebSocket();
  const { user } = useAuth();

  const fetchActiveDelivery = async (): Promise<ActiveOrder> => {
    console.log("USERRRRRRR", user);
    const response = await api.get("/orders/delivery-partner/active", {
      params: {
        city: user?.deliveryPartner?.city,
      },
    });

    console.log(response.data);
    return response.data;
  };

  const {
    data: activeOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activeDelivery"],
    queryFn: fetchActiveDelivery,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 2,
  });

  const updateOrderStatus = async ({
    orderId,
    status,
    notes,
  }: {
    orderId: string;
    status: OrderStatus;
    notes?: string;
  }) => {
    const response = await api.patch(`/orders/${orderId}/status`, {
      status,
      notes,
    });
    return response.data;
  };

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: ["activeDelivery"] });

      const previousOrder = queryClient.getQueryData(["activeDelivery"]);

      queryClient.setQueryData(
        ["activeDelivery"],
        (old: ActiveOrder | null) => {
          if (!old) return null;
          return { ...old, status };
        },
      );

      return { previousOrder };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(["activeDelivery"], context?.previousOrder);
      toast.error("Failed to update status", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or contact support",
      });
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["activeDelivery"] });

      const messages: Record<string, string> = {
        PICKED_UP: "Order marked as picked up",
        ON_THE_WAY: "Delivery started successfully",
        DELIVERED: "Order delivered successfully! 🎉",
      };

      toast.success(messages[status] || "Status updated");
    },
  });

  useEffect(() => {
    if (activeOrder?.id) {
      joinOrderRoom(activeOrder.id);
      return () => leaveOrderRoom(activeOrder.id);
    }
  }, [activeOrder?.id, joinOrderRoom, leaveOrderRoom]);

  const handleStatusUpdate = (status: OrderStatus) => {
    if (!activeOrder) return;
    statusMutation.mutate({ orderId: activeOrder.id, status });
  };

  const openMaps = () => {
    if (!activeOrder?.deliveryAddress) return;
    const encodedAddress = encodeURIComponent(activeOrder.deliveryAddress);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    );
  };

  const callCustomer = () => {
    if (!activeOrder?.customer?.phone) return;
    window.location.href = `tel:${activeOrder.customer.phone}`;
  };

  const totalItems =
    activeOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Delivery Dashboard</h2>
        {isConnected && (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 border-green-200"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600"></span>
            Live
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load active delivery. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <ActiveOrderSkeleton />
      ) : !activeOrder ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Active Delivery</h2>
            <p className="text-muted-foreground">
              You don't have any active deliveries right now.
            </p>
            <Button
              size="lg"
              onClick={() => {
                /* Navigate to available orders */
              }}
            >
              View Available Deliveries
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>Active Delivery</span>
              <Badge
                variant="outline"
                className={getStatusColor(activeOrder.status)}
              >
                {getStatusText(activeOrder.status)}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Order Info */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-lg">
                  Order #{activeOrder.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "item" : "items"} • ₹
                  {activeOrder.totalAmount}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Customer</p>
                    <p className="text-sm">{activeOrder.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activeOrder.deliveryAddress}
                    </p>
                    {activeOrder.customer.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {activeOrder.customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                {activeOrder.notes && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <Package className="h-4 w-4 mt-0.5 text-yellow-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-yellow-900">
                        Delivery Notes
                      </p>
                      <p className="text-sm text-yellow-800">
                        {activeOrder.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Ordered at {formatTime(activeOrder.createdAt)}
                    {activeOrder.acceptedAt &&
                      ` • Accepted at ${formatTime(activeOrder.acceptedAt)}`}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Order Items</p>
              <div className="space-y-2">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">₹{item.subtotal}</p>
                  </div>
                ))}

                {activeOrder.deliveryFee > 0 && (
                  <div className="flex items-center justify-between p-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Delivery Fee
                    </p>
                    <p className="text-sm font-medium">
                      ₹{activeOrder.deliveryFee}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-sm font-semibold">Total Amount</p>
                  <p className="text-base font-bold text-primary">
                    ₹{activeOrder.totalAmount}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Map Placeholder */}
            <div className="relative h-48 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-16 h-16 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-6 right-8 w-20 h-20 bg-purple-500 rounded-full"></div>
              </div>
              <div className="relative text-center z-10">
                <Navigation className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Map View Coming Soon
                </p>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={openMaps} className="w-full">
                <Navigation className="mr-2 h-4 w-4" />
                Navigate
              </Button>

              <Button
                variant="outline"
                onClick={callCustomer}
                className="w-full"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </Button>
            </div>

            <Separator />

            {/* Status Update Actions */}
            <div className="space-y-3">
              {activeOrder.status === "ACCEPTED" && (
                <Button
                  onClick={() => handleStatusUpdate("PICKED_UP")}
                  disabled={statusMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <PackageCheck className="mr-2 h-5 w-5" />
                  Mark as Picked Up
                </Button>
              )}

              {activeOrder.status === "PICKED_UP" && (
                <Button
                  onClick={() => handleStatusUpdate("ON_THE_WAY")}
                  disabled={statusMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Truck className="mr-2 h-5 w-5" />
                  Start Delivery
                </Button>
              )}

              {activeOrder.status === "ON_THE_WAY" && (
                <Button
                  onClick={() => handleStatusUpdate("DELIVERED")}
                  disabled={statusMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <PackageCheck className="mr-2 h-5 w-5" />
                  Mark as Delivered
                </Button>
              )}

              {activeOrder.status === "DELIVERED" && (
                <div className="text-center py-4">
                  <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                    <PackageCheck className="h-5 w-5" />
                    Delivery Completed Successfully!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
