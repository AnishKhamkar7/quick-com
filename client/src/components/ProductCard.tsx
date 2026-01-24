import { useState } from "react";
import { Plus, Minus, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/global";

export const ProductCard = ({
  product,
  onQuantityChange,
  Icon,
}: {
  product: Product;
  onQuantityChange?: (productId: Product, quantity: number) => void;
  Icon: LucideIcon;
}) => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onQuantityChange?.(product, newQty);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange?.(product, newQty);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="aspect-square relative">
          <Icon className="h-7 w-7 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-sm line-clamp-2">{product.name}</CardTitle>
        {product.description && (
          <CardDescription className="text-xs mt-1">
            {product.description}
          </CardDescription>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold">₹{product.price}</span>
        </div>
      </CardContent>
      <CardFooter>
        {quantity === 0 ? (
          <Button onClick={handleIncrement} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Button size="icon" variant="outline" onClick={handleDecrement}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="flex-1 text-center font-medium">{quantity}</span>
            <Button size="icon" variant="outline" onClick={handleIncrement}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
