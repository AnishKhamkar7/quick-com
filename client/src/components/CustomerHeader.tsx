import { Search, MapPin, ShoppingCart, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface CustomerHeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function CustomerHeader({
  cartCount,
  searchQuery,
  onSearchChange,
}: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>

          <Link to="/customer/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
