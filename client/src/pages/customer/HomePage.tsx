import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/CategoryCard";
import { Link } from "react-router-dom";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Mock data fallback
      setProducts([
        {
          id: "1",
          name: "Sunpure Refined Sunflower Oil",
          price: 158,
          originalPrice: 190,
          imageUrl: "/api/placeholder/200/200",
          description: "1 ltr",
          category: "Oil & Ghee",
          inStock: true,
        },
        {
          id: "2",
          name: "Fresh Eggs - Export Quality",
          price: 238,
          originalPrice: 300,
          imageUrl: "/api/placeholder/200/200",
          description: "30 Pieces",
          category: "Dairy & Eggs",
          inStock: true,
        },
        {
          id: "3",
          name: "Gold Winner Refined Sunflower Oil",
          price: 311,
          originalPrice: 374,
          imageUrl: "/api/placeholder/200/200",
          description: "1 ltr x 2",
          category: "Oil & Ghee",
          inStock: true,
        },
        {
          id: "4",
          name: "Green Chilli",
          price: 11,
          originalPrice: 14,
          imageUrl: "/api/placeholder/200/200",
          description: "100 g",
          category: "Vegetables",
          inStock: true,
        },
        {
          id: "5",
          name: "Onion - Value Pack",
          price: 111,
          originalPrice: 139,
          imageUrl: "/api/placeholder/200/200",
          description: "3 kg",
          category: "Vegetables",
          inStock: true,
        },
        {
          id: "6",
          name: "Hybrid Tomato",
          price: 22,
          originalPrice: 28,
          imageUrl: "/api/placeholder/200/200",
          description: "500 g",
          category: "Vegetables",
          inStock: true,
        },
        {
          id: "7",
          name: "LAL Mysore Pak Premium",
          price: 136,
          originalPrice: 145,
          imageUrl: "/api/placeholder/200/200",
          description: "200 g",
          category: "Sweets",
          inStock: true,
        },
        {
          id: "8",
          name: "Fresh Eggs",
          price: 48,
          originalPrice: 75,
          imageUrl: "/api/placeholder/200/200",
          description: "6 Pieces",
          category: "Dairy & Eggs",
          inStock: true,
        },
      ]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Mock data fallback
      setCategories([
        {
          id: "1",
          name: "Fruits & Vegetables",
          image: "/api/placeholder/100/100",
        },
        {
          id: "2",
          name: "Dairy, Bread & Eggs",
          image: "/api/placeholder/100/100",
        },
        {
          id: "3",
          name: "Atta, Rice, Oil & Dals",
          image: "/api/placeholder/100/100",
        },
        {
          id: "4",
          name: "Meat, Fish & Eggs",
          image: "/api/placeholder/100/100",
        },
        {
          id: "5",
          name: "Masala & Dry Fruits",
          image: "/api/placeholder/100/100",
        },
        {
          id: "6",
          name: "Breakfast & Sauces",
          image: "/api/placeholder/100/100",
        },
        { id: "7", name: "Packaged Food", image: "/api/placeholder/100/100" },
        {
          id: "8",
          name: "Tea, Coffee & More",
          image: "/api/placeholder/100/100",
        },
      ]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setCart((prev) => {
      if (quantity === 0) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: quantity };
    });
  };

  const handleCategoryClick = (categoryId) => {
    console.log("Category clicked:", categoryId);
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <>
      {/* Search Bar Section */}
      <div className=" bg-background sticky top-0 z-10">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
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
            {/* Location */}
            <Button variant="outline" size="icon">
              <MapPin className="w-4 h-4" />
            </Button>
            {/* User */}
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

      {/* Main Content */}
      <div className="container mx-auto p-4 lg:p-6 space-y-8">
        {/* Categories Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Hot Deals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;
