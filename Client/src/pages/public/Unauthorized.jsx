import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

const Unauthorized = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <ShieldAlert size={48} className="text-[var(--color-rust-500)]" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-[var(--color-rust-500)]">Access restricted</p>
      <h1 className="mt-2 text-4xl text-[var(--color-text-primary)]">You cannot open this area</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">Login with the correct account role to continue.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/login"><Button>Login</Button></Link>
        <Link to="/"><Button variant="outline">Home</Button></Link>
      </div>
    </main>
  );
};

export default Unauthorized;
