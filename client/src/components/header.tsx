import { Link } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Search,
  ShoppingCart,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useCart } from "@/context/cart-context";

interface HeaderProps {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null;
  onLogout: () => void;
  links: Array<{
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export function Header({ user, onLogout, links }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isCustomer = user?.role === "CUSTOMER";
  const { totalItems } = useCart();
  const getUserInitials = () =>
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex h-16 items-center gap-4">
        {!isCustomer && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <Sidebar links={links} userRole={user?.role || ""} />
            </SheetContent>
          </Sheet>
        )}

        {isCustomer && (
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for products..." className="pl-10" />
          </div>
        )}

        <div className="flex-1" />

        {isCustomer && (
          <>
            <Link to="/customer/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted hover:bg-muted/80"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to={`/${user?.role?.toLowerCase()}/profile`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
