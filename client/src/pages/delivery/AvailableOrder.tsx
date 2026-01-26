import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/context/socket-context";
import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AvailableOrderCard } from "@/components/AvailableOrderCard";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

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

interface AvailableOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  city: string;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: OrderItem[];
}

interface PaginatedResponse {
  data: AvailableOrder[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const acceptOrder = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/accept`);
  return response.data;
};

const OrderCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AvailableOrdersPage() {
  const queryClient = useQueryClient();
  const { isConnected, joinOrderRoom } = useWebSocket();
  const { user } = useAuth();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const city = user?.deliveryPartner?.city;

  const fetchAvailableOrders = async (
    page: number,
  ): Promise<PaginatedResponse> => {
    const response = await api.get("/orders/delivery-partner/my-orders", {
      params: {
        page,
        pageSize: 20,
        status: "PENDING",
        city,
      },
    });
    return response.data;
  };
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["availableOrders", page],
    queryFn: () => fetchAvailableOrders(page),
    staleTime: 30 * 1000,
    refetchInterval: 20 * 1000,
    retry: 2,
    enabled: !!user?.deliveryPartner,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptOrder,
    onSuccess: (res) => {
      console.log("HEHEHEHHE", res);
      queryClient.invalidateQueries({ queryKey: ["availableOrders"] });
      queryClient.invalidateQueries({ queryKey: ["activeDelivery"] });

      joinOrderRoom(res.id);

      toast.success("Order Accepted! 🎉", {
        description: "The order has been assigned to you. Start delivering!",
      });

      setTimeout(() => {
        navigate("/delivery/dashboard");
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to accept order", {
        description:
          error instanceof Error
            ? error.message
            : "This order may have been already accepted by another partner",
      });
    },
  });

  const handleAcceptOrder = (orderId: string) => {
    acceptMutation.mutate(orderId);
  };

  const handleRefresh = () => {
    refetch();
    toast.info("Refreshing orders...");
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="text-2xl">Available Orders</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {city && `${city} • `}
            {data?.meta.total || 0} order{data?.meta.total !== 1 ? "s" : ""}{" "}
            available for delivery
          </p>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load available orders. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold">No Orders Available</h2>
                <p className="text-muted-foreground mt-2">
                  There are no pending orders in your area right now.
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Orders Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((order) => (
              <AvailableOrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                isAccepting={
                  acceptMutation.isPending &&
                  acceptMutation.variables === order.id
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from(
                      { length: Math.min(5, data.meta.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (data.meta.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= data.meta.totalPages - 2) {
                          pageNum = data.meta.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            disabled={isFetching}
                            className="w-9 h-9 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(data.meta.totalPages, p + 1))
                    }
                    disabled={page === data.meta.totalPages || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
