import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Search, MapPin } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/CategoryCard";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/axios";
import {
  ShoppingBasket,
  Apple,
  Milk,
  Coffee,
  Cookie,
  Croissant,
  Drumstick,
  Home,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, any> = {
  GROCERIES: ShoppingBasket,
  FRUITS_VEGETABLES: Apple,
  DAIRY: Milk,
  BEVERAGES: Coffee,
  SNACKS: Cookie,
  BAKERY: Croissant,
  MEAT_SEAFOOD: Drumstick,
  HOUSEHOLD: Home,
};

const PRODUCT_CATEGORIES = [
  { id: "GROCERIES", name: "Groceries", image: "/api/placeholder/100/100" },
  {
    id: "FRUITS_VEGETABLES",
    name: "Fruits & Vegetables",
    image: "/api/placeholder/100/100",
  },
  {
    id: "DAIRY",
    name: "Dairy, Bread & Eggs",
    image: "/api/placeholder/100/100",
  },
  { id: "BEVERAGES", name: "Beverages", image: "/api/placeholder/100/100" },
  { id: "SNACKS", name: "Snacks", image: "/api/placeholder/100/100" },
  { id: "BAKERY", name: "Bakery", image: "/api/placeholder/100/100" },
  {
    id: "MEAT_SEAFOOD",
    name: "Meat & Seafood",
    image: "/api/placeholder/100/100",
  },
  { id: "HOUSEHOLD", name: "Household", image: "/api/placeholder/100/100" },
];

const fetchProducts = async (category: string) => {
  const response = await api.get(`/products/category/${category}`, {
    params: { page: 1, pageSize: 20 },
  });
  return response.data;
};

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-full" />
  </div>
);

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "GROCERIES"],
    queryFn: () => fetchProducts("GROCERIES"),
    staleTime: 5 * 60 * 1000,
  });

  console.log("Products data:", products);
  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity === 0) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: quantity };
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log("Category clicked:", categoryId);
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <>
      <div className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="icon">
              <MapPin className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <User className="w-4 h-4" />
            </Button>
            <Link to="/customer/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 lg:p-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {PRODUCT_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                Icon={CATEGORY_ICON_MAP[category.id]}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Hot Deals</h2>

          {productsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Failed to load products. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products?.data && products.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.data.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No products available at the moment.
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Homepage;
