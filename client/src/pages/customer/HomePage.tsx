import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
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

  return (
    <>
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
