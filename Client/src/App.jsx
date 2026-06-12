import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { Toaster } from 'react-hot-toast';

/**
 * App — root component.
 *
 * Provider order matters:
 *  BrowserRouter → AuthProvider → CartProvider → AppRoutes
 *
 * CartProvider is nested inside AuthProvider because CartContext
 * needs to know whether the user is authenticated and is a buyer.
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;