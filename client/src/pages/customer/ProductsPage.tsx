import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/axios";
import type { Product } from "@/types/global";
import { useCart } from "@/context/cart-context";
import { CATEGORY_ICON_MAP } from "@/utils/category-icon";

const fetchProductsByCategory = async (category: string, page: number) => {
  const res = await api.get(`/products/category/${category}`, {
    params: { page, pageSize: 20 },
  });
  return res.data;
};

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-full" />
  </div>
);

const ProductsPage = () => {
  const { category } = useParams<{ category: string }>();
  const { dispatch } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProductsByCategory(category!, 1),
    enabled: !!category,
  });

  const handleQuantityChange = (product: Product, quantity: number) => {
    if (quantity === 0) {
      dispatch({ type: "REMOVE", productId: product.id });
    } else {
      dispatch({ type: "SET_QTY", product, quantity });
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <h2 className="text-2xl font-bold capitalize">
        {category?.replace(/_/g, " ").toLowerCase()}
      </h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load products. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.data.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuantityChange={handleQuantityChange}
              Icon={CATEGORY_ICON_MAP[product.category]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
