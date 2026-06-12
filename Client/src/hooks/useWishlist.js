import { useState, useEffect, useCallback } from 'react';

const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const loadWishlist = () => {
      const stored = localStorage.getItem('bibliobazar_wishlist');
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse wishlist', e);
        }
      }
    };
    
    loadWishlist();
    
    // Listen for storage changes in other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'bibliobazar_wishlist') {
        loadWishlist();
      }
    });
    
    return () => window.removeEventListener('storage', loadWishlist);
  }, []);

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('bibliobazar_wishlist', JSON.stringify(newWishlist));
    // Trigger a custom event so other components in the same tab can sync
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  useEffect(() => {
    const handleLocalUpdate = () => {
      const stored = localStorage.getItem('bibliobazar_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    };
    window.addEventListener('wishlistUpdated', handleLocalUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleLocalUpdate);
  }, []);

  const addToWishlist = useCallback((book) => {
    setWishlist(prev => {
      if (prev.some(b => b.id === book.id)) return prev;
      const updated = [...prev, book];
      localStorage.setItem('bibliobazar_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlistUpdated'));
      return updated;
    });
  }, []);

  const removeFromWishlist = useCallback((bookId) => {
    setWishlist(prev => {
      const updated = prev.filter(b => b.id !== bookId);
      localStorage.setItem('bibliobazar_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlistUpdated'));
      return updated;
    });
  }, []);

  const isInWishlist = useCallback((bookId) => {
    return wishlist.some(b => b.id === bookId);
  }, [wishlist]);

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist };
};

export default useWishlist;
