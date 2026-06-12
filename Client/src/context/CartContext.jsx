import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import BuyerService from '../services/BuyerService.js';
import { AuthContext } from './AuthContext.jsx';

export const CartContext = createContext(null);

/**
 * CartProvider — manages cart state globally for authenticated buyers.
 *
 * Exposes:
 *  - items: array of cart items (with book details)
 *  - cartTotal: string — formatted total price
 *  - itemCount: total number of individual book units in cart
 *  - isLoading: true during initial fetch
 *  - fetchCart(): re-fetch cart from server
 *  - addToCart(book_id, quantity): add/increment item
 *  - updateCartItem(cartItemId, quantity): set quantity
 *  - removeFromCart(cartItemId): remove one item
 *  - clearCart(): remove all items
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, isBuyer } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── FETCH CART ───────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) {
      setItems([]);
      setCartTotal('0.00');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await BuyerService.getCart();
      setItems(data.data || []);
      setCartTotal(data.cart_total || '0.00');
    } catch (err) {
      setError(err.message || 'Failed to load cart.');
      console.error('CartContext fetchCart error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isBuyer]);

  // Auto-fetch when buyer logs in
  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      fetchCart();
    } else {
      setItems([]);
      setCartTotal('0.00');
    }
  }, [isAuthenticated, isBuyer, fetchCart]);

  // ─── ADD TO CART ──────────────────────────────────────────
  const addToCart = useCallback(
    async (book_id, quantity = 1) => {
      await BuyerService.addToCart(book_id, quantity);
      await fetchCart(); // Re-sync from server
    },
    [fetchCart]
  );

  // ─── UPDATE CART ITEM ─────────────────────────────────────
  const updateCartItem = useCallback(
    async (cartItemId, quantity) => {
      if (quantity < 1) return;
      // Optimistic UI update
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
      try {
        await BuyerService.updateCartItem(cartItemId, quantity);
        await fetchCart(); // Sync totals from server
      } catch (err) {
        // Rollback on failure
        await fetchCart();
        throw err;
      }
    },
    [fetchCart]
  );

  // ─── REMOVE FROM CART ─────────────────────────────────────
  const removeFromCart = useCallback(
    async (cartItemId) => {
      // Optimistic UI: remove immediately
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));
      try {
        await BuyerService.removeFromCart(cartItemId);
        await fetchCart(); // Re-sync totals
      } catch (err) {
        await fetchCart();
        throw err;
      }
    },
    [fetchCart]
  );

  // ─── CLEAR CART ───────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setItems([]);
    setCartTotal('0.00');
    try {
      await BuyerService.clearCart();
    } catch (err) {
      await fetchCart();
      throw err;
    }
  }, [fetchCart]);

  // ─── DERIVED STATE ────────────────────────────────────────
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const isInCart = useCallback(
    (bookId) => items.some((item) => item.book_id === bookId),
    [items]
  );

  const getCartItem = useCallback(
    (bookId) => items.find((item) => item.book_id === bookId) || null,
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartTotal,
        itemCount,
        isLoading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        isInCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
