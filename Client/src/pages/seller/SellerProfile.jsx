import { useEffect, useRef, useState } from 'react';
import {
  Camera, CheckCircle2, Clock, Eye, EyeOff, Lock, Mail, MapPin,
  Phone, Save, Shield, Store, Trash2, User, XCircle,
} from 'lucide-react';
import { ErrorState, LoadingState, StatusBadge } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import SellerService from '../../services/SellerService.js';
import useAuth from '../../hooks/useAuth.js';

const TABS = [
  { id: 'details', label: 'Store Details', icon: Store },
  { id: 'security', label: 'Security', icon: Shield },
];

const SellerProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // ─── Profile State ──────────────────────────────────────
  const [form, setForm] = useState({
    store_name: '', contact_person: '', phone: '',
    business_address: '', gstin: '', bank_account_details: '',
  });
  const [profile, setProfile] = useState(null); // raw profile data with avatar, email, etc.
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
      const response = await SellerService.getProfile();
      const data = response.data;
      setProfile(data);
      setForm({
        store_name: data.store_name || '',
        contact_person: data.contact_person || '',
        phone: data.phone || '',
        business_address: data.business_address || '',
        gstin: data.gstin || '',
        bank_account_details: data.bank_account_details || '',
      });
      setStatus('ready');
    } catch (err) {
      setMessage(err.message || 'Could not load seller profile.');
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
      const response = await SellerService.updateProfile(form);
      setProfile((prev) => ({ ...prev, ...response.data }));
      setForm({
        store_name: response.data.store_name || '',
        contact_person: response.data.contact_person || '',
        phone: response.data.phone || '',
        business_address: response.data.business_address || '',
        gstin: response.data.gstin || '',
        bank_account_details: response.data.bank_account_details || '',
      });
      updateUser({ profile: response.data });
      setMessage('Profile updated successfully.');
      setStatus('ready');
    } catch (err) {
      setMessage(err.message || 'Could not update seller profile.');
      setStatus('ready');
    }
  };

  // ─── Avatar Upload ──────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const response = await SellerService.uploadAvatar(file);
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
      await SellerService.deleteAvatar();
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
      const response = await SellerService.changePassword({
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
  if (status === 'loading') return <LoadingState label="Loading seller profile..." />;
  if (status === 'error') return <ErrorState message={message} onRetry={loadProfile} />;

  const initials = (profile?.contact_person || profile?.store_name || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : null;

  return (
    <section className="mx-auto max-w-4xl">
      {/* ── Hero Banner + Avatar ────────────────────────── */}
      <div className="relative">
        {/* Gradient banner — overflow-hidden only here for rounded corners */}
        <div className="rounded-t-xl overflow-hidden">
          <div
            className="h-44 sm:h-52"
            style={{
              background: 'linear-gradient(135deg, #2d5a27 0%, #4a8c3f 25%, #c9953c 55%, #e8b84b 75%, #f5d98a 100%)',
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
                <span className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-sage-600)]">{initials}</span>
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
          {/* Left — Name, email, location */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-ink-900)]">
                {profile?.store_name || 'Store Name'}
              </h1>
              {profile?.is_verified ? (
                <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={13} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Clock size={13} /> Pending
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} /> {profile?.contact_person}
              </span>
              {profile?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} /> {profile.email}
                </span>
              )}
              {profile?.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
            </div>
            {profile?.business_address && (
              <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span className="line-clamp-1">{profile.business_address}</span>
              </p>
            )}
          </div>

          {/* Right — Member since */}
          {memberSince && (
            <div className="text-right shrink-0">
              <p className="text-xs text-[var(--color-text-muted)]">Member since</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{memberSince}</p>
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
            <form onSubmit={handleProfileSubmit} id="seller-profile-form">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Store name"
                  name="store_name"
                  value={form.store_name}
                  onChange={handleChange}
                  required
                  leftIcon={<Store size={16} />}
                />
                <Input
                  label="Contact person"
                  name="contact_person"
                  value={form.contact_person}
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
                <Input
                  label="GSTIN"
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 07AAAPB1234C1Z5"
                />
                <TextArea
                  label="Business address"
                  name="business_address"
                  value={form.business_address}
                  onChange={handleChange}
                  required
                  className="sm:col-span-2"
                  rows={3}
                />
                <TextArea
                  label="Bank account details"
                  name="bank_account_details"
                  value={form.bank_account_details}
                  onChange={handleChange}
                  className="sm:col-span-2"
                  rows={3}
                  placeholder="Account number, IFSC, bank name..."
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
            <form onSubmit={handlePasswordSubmit} id="seller-password-form" className="max-w-lg">
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

export default SellerProfile;
