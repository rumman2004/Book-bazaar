import { useEffect, useRef, useState } from 'react';
import {
  Camera, Eye, EyeOff, Home, Lock, Mail,
  MapPin, Phone, Save, Shield, Trash2, User,
} from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import BuyerService from '../../services/BuyerService.js';
import useAuth from '../../hooks/useAuth.js';

const TABS = [
  { id: 'details', label: 'My Details', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
];

const BuyerProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // ─── Profile State ──────────────────────────────────────
  const [form, setForm] = useState({ full_name: '', phone: '', default_shipping_address: '' });
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ─── Password State ─────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ─── Load Profile ───────────────────────────────────────
  const loadProfile = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const response = await BuyerService.getProfile();
      const data = response.data;
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        default_shipping_address: data.default_shipping_address || '',
      });
      setStatus('ready');
    } catch (err) {
      setMessage(err.message || 'Could not load profile.');
      setStatus('error');
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // ─── Profile Update ─────────────────────────────────────
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setMessage('');
    try {
      const response = await BuyerService.updateProfile(form);
      setProfile((prev) => ({ ...prev, ...response.data }));
      setForm({
        full_name: response.data.full_name || '',
        phone: response.data.phone || '',
        default_shipping_address: response.data.default_shipping_address || '',
      });
      updateUser({ profile: response.data });
      setMessage('Profile updated successfully.');
      setStatus('ready');
    } catch (err) {
      setMessage(err.message || 'Could not update profile.');
      setStatus('ready');
    }
  };

  // ─── Avatar Upload ──────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const response = await BuyerService.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar_url: response.data.avatar_url }));
      updateUser({ profile: { ...user?.profile, avatar_url: response.data.avatar_url } });
    } catch (err) {
      setMessage(err.message || 'Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarUploading(true);
    try {
      await BuyerService.deleteAvatar();
      setProfile((prev) => ({ ...prev, avatar_url: null }));
      updateUser({ profile: { ...user?.profile, avatar_url: null } });
    } catch (err) {
      setMessage(err.message || 'Could not remove avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ─── Password Change ───────────────────────────────────
  const handlePasswordChange = (e) => setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordMsg('Password must be at least 8 characters.');
      return;
    }

    setPasswordStatus('saving');
    try {
      const response = await BuyerService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg(response.message || 'Password changed successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordStatus('idle');
    } catch (err) {
      setPasswordMsg(err.message || 'Could not change password.');
      setPasswordStatus('idle');
    }
  };

  // ─── Render ─────────────────────────────────────────────
  if (status === 'loading') return <LoadingState label="Loading profile..." />;
  if (status === 'error') return <ErrorState message={message} onRetry={loadProfile} />;

  const initials = (profile?.full_name || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <section className="mx-auto max-w-4xl">
      {/* ── Hero Banner + Avatar ────────────────────────── */}
      <div className="relative">
        {/* Gradient banner — overflow-hidden only here for rounded corners */}
        <div className="rounded-t-xl overflow-hidden">
          <div
            className="h-44 sm:h-52"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 55%, #533483 80%, #e94560 100%)',
            }}
          />
        </div>

        {/* Avatar — outside overflow-hidden so it won't be clipped */}
        <div className="absolute left-6 sm:left-10 bottom-0 translate-y-1/2 z-10">
          <div className="relative group">
            <div
              className={`h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[var(--color-parchment-200)] flex items-center justify-center ${avatarUploading ? 'opacity-60' : ''}`}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-display font-bold text-[#533483]">{initials}</span>
              )}
            </div>

            {/* Camera overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <Camera size={24} className="text-white drop-shadow-md" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Delete avatar button */}
            {profile?.avatar_url && !avatarUploading && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center text-[#8b2222] hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove avatar"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile Info Strip ────────────────────────── */}
      <div className="rounded-b-xl border border-t-0 border-[var(--color-border)] bg-white pt-20 sm:pt-22 pb-6 px-6 sm:px-10 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left — Name, email */}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-ink-900)]">
              {profile?.full_name || 'Your Name'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
              {user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} /> {user.email}
                </span>
              )}
              {profile?.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
            </div>
            {profile?.default_shipping_address && (
              <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-[var(--color-text-muted)]">
                <Home size={14} className="mt-0.5 shrink-0" />
                <span className="line-clamp-1">{profile.default_shipping_address}</span>
              </p>
            )}
          </div>

          {/* Right — Member info */}
          {user?.created_at && (
            <div className="text-right shrink-0">
              <p className="text-xs text-[var(--color-text-muted)]">Member since</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────── */}
        <div className="mt-6 border-b border-[var(--color-border)] flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                  isActive
                    ? 'border-[var(--color-sage-600)] text-[var(--color-sage-600)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)] hover:border-[var(--color-parchment-300)]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ─────────────────────────────── */}
        <div className="mt-6">
          {activeTab === 'details' && (
            <form onSubmit={handleProfileSubmit} id="buyer-profile-form">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  leftIcon={<User size={16} />}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  leftIcon={<Phone size={16} />}
                />
                <TextArea
                  label="Default shipping address"
                  name="default_shipping_address"
                  value={form.default_shipping_address}
                  onChange={handleChange}
                  className="sm:col-span-2"
                  rows={4}
                  placeholder="Your delivery address for quick checkout..."
                />
              </div>

              {message && (
                <p className={`mt-4 rounded-md px-3 py-2.5 text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  type="submit"
                  loading={status === 'saving'}
                  leftIcon={<Save size={16} />}
                >
                  Save changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} id="buyer-password-form" className="max-w-lg">
              <h3 className="text-lg font-semibold text-[var(--color-ink-900)] flex items-center gap-2 mb-1">
                <Lock size={18} /> Change Password
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-5">
                Enter your current password and choose a new one (minimum 8 characters).
              </p>

              <div className="grid gap-5">
                <Input
                  label="Current password"
                  name="current_password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="cursor-pointer text-[#a89080] hover:text-[#1a1a1a] pointer-events-auto transition-colors">
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="New password"
                  name="new_password"
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowNewPw((v) => !v)} className="cursor-pointer text-[#a89080] hover:text-[#1a1a1a] pointer-events-auto transition-colors">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="Confirm new password"
                  name="confirm_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  leftIcon={<Lock size={16} />}
                  error={
                    passwordForm.confirm_password &&
                    passwordForm.new_password !== passwordForm.confirm_password
                      ? 'Passwords do not match'
                      : undefined
                  }
                />
              </div>

              {passwordMsg && (
                <p className={`mt-4 rounded-md px-3 py-2.5 text-sm font-medium ${passwordMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {passwordMsg}
                </p>
              )}

              <Button
                type="submit"
                loading={passwordStatus === 'saving'}
                className="mt-6"
                leftIcon={<Shield size={16} />}
              >
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default BuyerProfile;
