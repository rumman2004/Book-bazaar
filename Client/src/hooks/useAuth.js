import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * useAuth — convenience hook to access the AuthContext.
 *
 * @returns {{
 *   user: Object|null,
 *   token: string|null,
 *   role: string|null,
 *   isLoading: boolean,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   isSeller: boolean,
 *   isBuyer: boolean,
 *   login: Function,
 *   register: Function,
 *   logout: Function,
 *   updateUser: Function
 * }}
 *
 * @throws Error if used outside of <AuthProvider>
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>. Wrap your app in <AuthProvider>.');
  }

  return context;
};

export default useAuth;