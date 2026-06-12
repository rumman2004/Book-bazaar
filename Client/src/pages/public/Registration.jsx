import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Building2, Lock, Mail, Phone, User } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import useAuth from '../../hooks/useAuth.js';

const Registration = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    store_name: '',
    contact_person: '',
    business_address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const payload = role === 'buyer'
      ? { role, email: form.email, password: form.password, full_name: form.full_name, phone: form.phone }
      : {
          role,
          email: form.email,
          password: form.password,
          store_name: form.store_name,
          contact_person: form.contact_person,
          phone: form.phone,
          business_address: form.business_address,
        };

    try {
      const response = await register(payload);
      const destination = response.user?.role === 'seller' ? '/seller' : '/buyer';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please review the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl flex-col md:flex-row min-h-[600px] border border-[var(--color-border)]">
      {/* Left: Image Side */}
      <div className="relative hidden w-full md:block md:w-[40%] bg-stone-900">
        <img
          src="https://res.cloudinary.com/dtbytfxzs/image/upload/v1781303307/download_1_b6xpds.jpg"
          alt="Library"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col p-10 lg:p-14">
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg border border-white/30">
            <BookOpen size={20} />
          </div>
          <h2 className="font-display text-3xl font-bold text-white drop-shadow-md mb-3">Join Bibliobazar</h2>
          <p className="text-base font-medium leading-relaxed text-white/90 drop-shadow-md max-w-sm">Create your account and start exploring thousands of books.</p>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="flex w-full flex-col justify-center p-8 md:w-[60%] lg:p-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h1 className="font-display text-3xl font-semibold text-[var(--color-ink-900)]">Create your account</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Join as a Buyer or Seller to get started.</p>
          </div>

          <div className="mb-8 grid grid-cols-2 rounded-md border border-[var(--color-border)] bg-[var(--color-parchment-50)] p-1">
            {['buyer', 'seller'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-sm px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  role === item 
                    ? 'bg-[var(--color-amber-600)] text-white shadow-sm' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Email address" name="email" type="email" value={form.email} onChange={handleChange} required leftIcon={<Mail size={16} />} placeholder="you@example.com" />
            </div>

            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required leftIcon={<Lock size={16} />} placeholder="Create a password" />
            <Input label="Confirm password" name="confirm_password" type="password" required leftIcon={<Lock size={16} />} placeholder="Confirm password" />

            {role === 'buyer' ? (
              <div className="sm:col-span-2">
                <Input label="Full name" name="full_name" value={form.full_name} onChange={handleChange} required leftIcon={<User size={16} />} placeholder="Your full name" />
              </div>
            ) : (
              <>
                <Input label="Store name" name="store_name" value={form.store_name} onChange={handleChange} required leftIcon={<Building2 size={16} />} placeholder="Store name" />
                <Input label="Contact person" name="contact_person" value={form.contact_person} onChange={handleChange} required leftIcon={<User size={16} />} placeholder="Contact person" />
                <div className="sm:col-span-2">
                  <TextArea label="Business address" name="business_address" value={form.business_address} onChange={handleChange} required placeholder="Business address" />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <Input label="Phone number (optional)" name="phone" value={form.phone} onChange={handleChange} leftIcon={<Phone size={16} />} placeholder="Enter your phone number" />
            </div>

            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2 pt-2">
              <Button type="submit" loading={loading} fullWidth className="bg-[#232323] hover:bg-black text-white h-11">
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account? <Link to="/login" className="font-bold text-[var(--color-amber-600)] hover:text-[var(--color-amber-700)] ml-1">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
