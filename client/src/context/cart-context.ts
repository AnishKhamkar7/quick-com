import type { Product } from "@/types/global";
import { createContext, useContext } from "react";
type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  product: Product;
};

type CartState = {
  items: Record<string, CartItem>;
};

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
};

type CartAction =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" };

export const CartContext = createContext<CartContextType | null>(null);

export const cartReducer = (
  state: CartState,
  action: CartAction,
): CartState => {
  switch (action.type) {
    case "ADD": {
      const item = state.items[action.product.id];
      return {
        items: {
          ...state.items,
          [action.product.id]: {
            productId: action.product.id,
            product: action.product,
            price: action.product.price,
            quantity: item ? item.quantity + 1 : 1,
          },
        },
      };
    }

    case "SET_QTY": {
      if (action.quantity <= 0) {
        const updated = { ...state.items };
        delete updated[action.productId];
        return { items: updated };
      }
      return {
        items: {
          ...state.items,
          [action.productId]: {
            ...state.items[action.productId],
            quantity: action.quantity,
          },
        },
      };
    }
    case "REMOVE": {
      const updated = { ...state.items };
      delete updated[action.productId];
      return { items: updated };
    }

    case "CLEAR":
      return { items: {} };

    default:
      return state;
  }
};
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
