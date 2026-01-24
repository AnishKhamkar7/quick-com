import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Truck,
  MapPin,
  User,
  BoxesIcon,
} from "lucide-react";

export const getRoleBasedLinks = (role: string | undefined) => {
  switch (role) {
    case "ADMIN":
      return [
        { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { to: "/admin/products", label: "Products", icon: Package },
        {
          to: "/admin/delivery-partners",
          label: "Delivery Partners",
          icon: Truck,
        },
      ];
    case "DELIVERY_PARTNER":
      return [
        {
          to: "/delivery/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          to: "/delivery/orders",
          label: "Available Orders",
          icon: ShoppingCart,
        },
        { to: "/delivery/my-deliveries", label: "My Deliveries", icon: MapPin },
        { to: "/delivery/profile", label: "Profile", icon: User },
      ];
    case "CUSTOMER":
      return [
        { to: "/customer/home", label: "Home", icon: LayoutDashboard },
        { to: "/customer/orders", label: "My Orders", icon: BoxesIcon },
        { to: "/customer/cart", label: "Cart", icon: ShoppingCart },
        { to: "/customer/profile", label: "Profile", icon: User },
      ];
    default:
      return [];
  }
};

export const getRoleTitle = (role: string | undefined) => {
  switch (role) {
    case "ADMIN":
      return "Admin Panel";
    case "DELIVERY_PARTNER":
      return "Delivery Portal";
    case "CUSTOMER":
      return "al";
    default:
      return "Dashboard";
  }
};
