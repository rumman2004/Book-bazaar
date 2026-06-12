import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <SearchX size={48} className="text-[var(--color-rust-500)]" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-[var(--color-rust-500)]">404</p>
      <h1 className="mt-2 text-4xl text-[var(--color-text-primary)]">Page not found</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">The page you opened does not exist or has moved.</p>
      <Link to="/" className="mt-8">
        <Button leftIcon={<Home size={16} />}>Go home</Button>
      </Link>
    </main>
  );
};

export default NotFound;
