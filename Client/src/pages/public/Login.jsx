import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import useAuth from '../../hooks/useAuth.js';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(form.email, form.password);
      const rolePath = response.user?.role === 'admin' ? '/admin' : response.user?.role === 'seller' ? '/seller' : '/buyer';
      navigate(location.state?.from?.pathname || rolePath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl flex-col md:flex-row min-h-[600px] border border-[var(--color-border)]">
      {/* Left: Image Side */}
      <div className="relative hidden w-full md:block md:w-[45%] bg-stone-900">
        <img
          src="https://res.cloudinary.com/dtbytfxzs/image/upload/v1781303307/download_zn2bud.jpg"
          alt="Books"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col p-10 lg:p-14">
          <div className="flex items-center gap-3 text-white">
            <img src="/favicon.png" alt="Bibliobazar" className="h-9 w-9 object-contain drop-shadow-md" />
            <span className="font-display text-3xl font-bold tracking-tight drop-shadow-md">Bibliobazar</span>
          </div>
          <p className="mt-3 text-base font-medium text-white/90 drop-shadow-md max-w-xs">Your next great read awaits.</p>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="flex w-full flex-col justify-center p-8 md:w-[55%] lg:p-14">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-[var(--color-parchment-100)] text-[var(--color-amber-600)] ring-1 ring-[var(--color-amber-600)]/20">
              <BookOpen size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-amber-600)]">Welcome back</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink-900)]">Login to your account</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Access your dashboard, orders, cart, or seller tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              leftIcon={<Mail size={16} />}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              leftIcon={<Lock size={16} />}
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[var(--color-border)] text-[var(--color-ink-900)] focus:ring-[var(--color-ink-900)]" />
                <span className="text-[var(--color-text-muted)]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)] hover:underline">Forgot password?</Link>
            </div>

            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <Button type="submit" fullWidth loading={loading} className="!mt-8 bg-[#232323] hover:bg-black text-white h-11">
              Log In
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            New here? <Link to="/register" className="font-bold text-[var(--color-amber-600)] hover:text-[var(--color-amber-700)] ml-1">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
