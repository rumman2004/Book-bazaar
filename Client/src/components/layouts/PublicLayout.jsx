import { Outlet } from 'react-router-dom';
import PublicNav from './navbars/PublicNav.jsx';
import Footer from './navbars/Footer.jsx';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <PublicNav />
      <Outlet />
      <Footer />
    </div>
  );
};

export default PublicLayout;
