import { createContext, useContext } from "react";
type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  product: any;
};

type CartState = {
  items: Record<string, CartItem>;
};

type CartAction =
  | { type: "ADD"; product: any }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" };

export const CartContext = createContext<any>(null);

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

    case "CLEAR":
      return { items: {} };

    default:
      return state;
  }
};

export const useCart = () => useContext(CartContext);
