import { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService.js';

export const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides global authentication state.
 *
 * Exposes:
 *  - user: current user object (id, email, role, profile) | null
 *  - token: JWT string | null
 *  - isLoading: true while verifying session on first load
 *  - isAuthenticated: boolean
 *  - login(email, password): logs in and sets state
 *  - register(data): registers and sets state
 *  - logout(): clears state and storage
 *  - updateUser(partial): update user fields in context (e.g. after profile edit)
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── INITIALIZE FROM STORAGE ──────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = AuthService.getToken();
      const storedUser = AuthService.getStoredUser();

      if (storedToken && storedUser) {
        // Optimistically set user from local storage
        setToken(storedToken);
        setUser(storedUser);

        try {
          // Validate with server and refresh user data
          const { user: freshUser } = await AuthService.getMe();
          setUser(freshUser);
          localStorage.setItem('bibliobazar_user', JSON.stringify(freshUser));
        } catch {
          // Token is invalid/expired — clear everything
          AuthService.logout();
          setUser(null);
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ─── LISTEN FOR FORCED LOGOUT (401 interceptor) ───────────
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // ─── LOGIN ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await AuthService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // ─── REGISTER ─────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await AuthService.register(formData);
    // After registration, store token and user
    if (data.token) {
      localStorage.setItem('bibliobazar_token', data.token);
      localStorage.setItem('bibliobazar_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────
  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  }, []);

  // ─── UPDATE USER (e.g. after profile edit) ────────────────
  const updateUser = useCallback((partialUser) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('bibliobazar_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── DERIVED STATE ────────────────────────────────────────
  const isAuthenticated = !!user && !!token;
  const role = user?.role || null;

  const isAdmin = role === 'admin';
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isAuthenticated,
        isAdmin,
        isSeller,
        isBuyer,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};