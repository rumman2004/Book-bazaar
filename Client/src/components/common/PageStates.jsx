import { AlertCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button.jsx';

export const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-amber-600)]">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl text-[var(--color-text-primary)]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">{description}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, tone = 'amber' }) => {
  const tones = {
    amber: 'bg-[var(--color-accent-light)] text-[var(--color-amber-600)]',
    sage: 'bg-[#eaf3de] text-[var(--color-sage-600)]',
    rust: 'bg-[#faece7] text-[var(--color-rust-500)]',
    slate: 'bg-[var(--color-slate-100)] text-[var(--color-slate-700)]',
  };

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-[var(--color-text-primary)]">{value}</p>
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone] || tones.amber}`}>
            <Icon size={22} />
          </span>
        )}
      </div>
    </div>
  );
};

export const LoadingState = ({ label = 'Loading data...' }) => (
  <div className="flex min-h-48 items-center justify-center rounded-md border border-[var(--color-border)] bg-white">
    <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)]">
      <Loader2 className="animate-spin" size={18} /> {label}
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-700">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-1 text-sm">{message || 'Please try again.'}</p>
        {onRetry && <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ title = 'No data found', description, action }) => (
  <div className="rounded-md border border-[var(--color-border)] bg-white px-6 py-12 text-center shadow-[var(--shadow-card)]">
    <h2 className="text-2xl text-[var(--color-text-primary)]">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const StatusBadge = ({ value }) => {
  const normalized = String(value || '').toLowerCase();
  const colors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    true: 'bg-green-50 text-green-700 border-green-200',
    false: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${colors[normalized] || 'border-[var(--color-border)] bg-[var(--color-parchment-100)] text-[var(--color-text-muted)]'}`}>
      {String(value ?? 'unknown').replace(/[-_]/g, ' ')}
    </span>
  );
};
