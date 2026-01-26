import { Package, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import UpdateAddressCard from "@/components/UpdateAdress";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

type Payload = {
  deliveryAddress: string | null | undefined;
  notes: string;
  items: { productId: string; quantity: number }[];
};

const CartPage = () => {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  console.log("User in cart page:", user);
  const [deliveryAddress, setDeliveryAddress] = useState<
    string | null | undefined
  >(user?.customer?.address === null ? null : user?.customer?.address);

  const items = Object.values(state.items);
  const navigate = useNavigate();

  const updateQty = (productId: string, delta: number) => {
    const item = state.items[productId];
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      dispatch({ type: "REMOVE", productId });
    } else {
      dispatch({ type: "SET_QTY", product: item.product, quantity: newQty });
    }
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE", productId });
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (payload: Payload) => {
      const res = await api.post("/orders", payload);
      return res.data;
    },
  });

  const handlePayNow = () => {
    if (!deliveryAddress) {
      toast.error("Please add a delivery address");
      return;
    }

    if (items.length === 0) return;

    const payload = {
      deliveryAddress,
      notes: "",
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (res) => {
        console.log("Order created:", res);
        toast.success("Order placed successfully 🎉");

        dispatch({ type: "CLEAR" });

        navigate(`/customer/orders`);
      },
      onError: (error) => {
        toast.error("Failed to place order", {
          description:
            error instanceof Error ? error.message : "Something went wrong",
        });
      },
    });
  };

  return (
    <>
      {!deliveryAddress && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md p-4">
            <UpdateAddressCard
              onSuccess={(address) => setDeliveryAddress(address)}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">My Cart</h2>
          <p className="text-muted-foreground">
            Review your items and proceed to payment
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-2">
              <Package className="w-16 h-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Add items to proceed with checkout
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/40"
                  >
                    <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.product.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ₹{item.product.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQty(item.product.id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <span className="w-6 text-center">{item.quantity}</span>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQty(item.product.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card className="h-fit sticky top-4">
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handlePayNow}
                  disabled={createOrderMutation.isPending}
                >
                  <CreditCard className="w-5 h-5" />
                  {createOrderMutation.isPending
                    ? "Placing Order..."
                    : "Pay Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
