import { Outlet } from 'react-router-dom';
import SellerNav from './navbars/SellerNav.jsx';

const SellerLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <SellerNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
