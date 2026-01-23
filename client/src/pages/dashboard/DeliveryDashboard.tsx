import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, PackageCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

type OrderStatus = "ACCEPTED" | "PICKED_UP" | "ON_THE_WAY" | "DELIVERED";

interface ActiveOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  totalAmount: number;
  status: OrderStatus;
}

export default function DeliveryPartnerDashboard() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  const fetchActiveDelivery = async () => {
    try {
      const res = await fetch("/api/delivery/active-order");
      const data = await res.json();
      setActiveOrder(data ?? null);
    } catch {
      // Mock fallback
      setActiveOrder({
        id: "1",
        orderNumber: "ORD-24591",
        customerName: "Anish K",
        deliveryAddress: "BTM Layout, Bangalore",
        totalAmount: 458,
        status: "ACCEPTED",
      });
    }
  };

  const updateStatus = async (status: OrderStatus) => {
    if (!activeOrder) return;

    setActiveOrder({ ...activeOrder, status });

    // API later
    // await fetch(`/api/orders/${activeOrder.id}/status`, {...})
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Delivery Dashboard</h1>

      {!activeOrder ? (
        <Card className="text-center py-10">
          <CardContent className="space-y-4">
            <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Active Delivery</h2>
            <p className="text-muted-foreground">
              You don’t have any active deliveries right now.
            </p>
            <Link to="/delivery/available">
              <Button>View Available Deliveries</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Delivery</span>
              <Badge variant="outline">{activeOrder.status}</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Order Info */}
            <div className="space-y-1">
              <p className="font-medium">Order #{activeOrder.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                Customer: {activeOrder.customerName}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {activeOrder.deliveryAddress}
              </p>
            </div>

            <Separator />

            {/* Map Placeholder */}
            <div className="h-48 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              Map View (Coming Soon)
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {activeOrder.status === "ACCEPTED" && (
                <Button onClick={() => updateStatus("PICKED_UP")}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Mark Picked Up
                </Button>
              )}

              {activeOrder.status === "PICKED_UP" && (
                <Button onClick={() => updateStatus("ON_THE_WAY")}>
                  <Truck className="mr-2 h-4 w-4" />
                  Start Delivery
                </Button>
              )}

              {activeOrder.status === "ON_THE_WAY" && (
                <Button
                  variant="default"
                  onClick={() => updateStatus("DELIVERED")}
                >
                  Delivered
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
