import { Link } from 'react-router-dom';
import { ArrowRight, PackageCheck, Store, WalletCards } from 'lucide-react';

const SponsoredSection = () => {
  return (
    <section id="seller" className="bg-[var(--color-surface)] py-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-rust-500)]">For sellers</p>
          <h2 className="mt-2 text-3xl text-[var(--color-text-primary)] sm:text-4xl">Turn your shelf into a storefront.</h2>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
            List books, manage stock, track orders, and reach buyers who are already searching for their next read.
          </p>
          <div className="mt-7">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-rust-500)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-rust-600)]">
              Start selling <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { icon: Store, title: 'Seller profiles', text: 'Build trust with store details and verified contact information.' },
            { icon: PackageCheck, title: 'Order tracking', text: 'Move orders from pending to delivered with clear status steps.' },
            { icon: WalletCards, title: 'Revenue view', text: 'Keep an eye on product performance and monthly earnings.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <Icon className="text-[var(--color-sage-600)]" size={22} />
              <h3 className="mt-3 text-lg text-[var(--color-text-primary)]">{title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsoredSection;
