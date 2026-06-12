import { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';

/**
 * useCart — convenience hook to access the CartContext.
 *
 * @returns {{
 *   items: Array,
 *   cartTotal: string,
 *   itemCount: number,
 *   isLoading: boolean,
 *   error: string|null,
 *   fetchCart: Function,
 *   addToCart: Function,
 *   updateCartItem: Function,
 *   removeFromCart: Function,
 *   clearCart: Function,
 *   isInCart: Function,
 *   getCartItem: Function
 * }}
 *
 * @throws Error if used outside of <CartProvider>
 */
const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>. Wrap your app in <CartProvider>.');
  }

  return context;
};

export default useCart;