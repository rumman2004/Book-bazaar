import { useLocation } from 'react-router-dom';
import Login from './Login.jsx';
import Registration from './Registration.jsx';

const AuthPage = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--color-surface)]">
      <div className="perspective-1200 w-full max-w-[1024px]">
        <div 
          className={`auth-flip-container relative w-full transition-transform duration-700 preserve-3d ${
            isRegister ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front: Login */}
          <div 
            className={`auth-flip-child backface-hidden w-full align-top ${
              isRegister ? 'pointer-events-none z-0' : 'pointer-events-auto z-10'
            }`}
          >
            <Login />
          </div>

          {/* Back: Registration */}
          <div 
            className={`auth-flip-child backface-hidden rotate-y-180 w-full align-top ${
              isRegister ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'
            }`}
          >
            <Registration />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
