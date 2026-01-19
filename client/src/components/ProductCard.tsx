import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ProductCard = ({ product, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onQuantityChange?.(product.id, newQty);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange?.(product.id, newQty);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="aspect-square relative">
          <img
            src={product.imageUrl || "/api/placeholder/200/200"}
            alt={product.name}
            className="w-full h-full object-contain"
          />
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
          {product.originalPrice && (
            <span className="text-sm line-through text-muted-foreground">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
        {product.originalPrice && (
          <Badge variant="secondary" className="mt-2">
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100,
            )}
            % OFF
          </Badge>
        )}
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
