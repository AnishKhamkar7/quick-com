import { useReducer } from "react";
import { cartReducer, CartContext } from "../context/cart-context";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} });

  const totalItems = Object.values(state.items).reduce(
    (sum, i) => sum + i.quantity,
    0,
  );

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}
