import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Clock, IndianRupee, Navigation } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

interface AvailableOrderData {
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

interface AvailableOrderCardProps {
  order: AvailableOrderData;
  onAccept: (orderId: string) => void;
  isAccepting?: boolean;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateDistance = (address: string): string => {
  // TODO: Implement actual distance calculation
  // This is a placeholder - you'll need to use Google Maps API or similar
  return "2.5 km";
};

export function AvailableOrderCard({
  order,
  onAccept,
  isAccepting = false,
}: AvailableOrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const distance = calculateDistance(order.deliveryAddress);

  const openMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encodedAddress = encodeURIComponent(order.deliveryAddress);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">
              Order #{order.orderNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.customer.name}
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-200 flex-shrink-0"
          >
            New
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {order.deliveryAddress}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {order.city} • {distance} away
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={openMaps}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {formatTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Items Preview */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Items:</p>
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 3).map((item) => (
              <Badge
                key={item.id}
                variant="secondary"
                className="text-xs font-normal"
              >
                {item.quantity}x {item.productName}
              </Badge>
            ))}
            {order.items.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{order.items.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Notes if present */}
        {order.notes && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs font-medium text-yellow-900">Note:</p>
            <p className="text-xs text-yellow-800 line-clamp-2">
              {order.notes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-1">
          <IndianRupee className="h-4 w-4 text-green-600" />
          <span className="text-lg font-bold text-green-600">
            ₹{order.totalAmount}
          </span>
        </div>
        <Button
          onClick={() => onAccept(order.id)}
          disabled={isAccepting}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {isAccepting ? "Accepting..." : "Accept Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}
