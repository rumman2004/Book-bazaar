import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Monitor, User, PenLine, Search } from 'lucide-react';

const collections = [
  {
    title: 'Academic Texts',
    description: 'Reference books and semester staples for serious study.',
    count: '2,400+',
    icon: GraduationCap,
    categoryId: 3, // Academic
  },
  {
    title: 'Literary Fiction',
    description: 'Novels, short stories, and comfort reads for every mood.',
    count: '1,800+',
    icon: BookOpen,
    categoryId: 1, // Fiction
  },
  {
    title: 'Engineering',
    description: 'Programming, systems, and career-building resources.',
    count: '960+',
    icon: Monitor,
    categoryId: 10, // Engineering
  },
  {
    title: 'Biographies',
    description: 'Life stories of real people, heroes, and innovators.',
    count: '720+',
    icon: User,
    categoryId: 8, // Biography
  },
  {
    title: 'Self-Help',
    description: 'Personal development books for mind, body, and soul.',
    count: '1,100+',
    icon: PenLine,
    categoryId: 9, // Self-Help
  },
  {
    title: 'Mystery & Thriller',
    description: 'Crime and suspense novels that keep you guessing.',
    count: '540+',
    icon: Search,
    categoryId: 6, // Mystery & Thriller
  },
];

const SuggestedSection = () => {
  return (
    <section id="collections" className="bg-[var(--color-parchment-100)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="block h-px w-7 bg-[var(--color-amber-500)]" />
            <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-[var(--color-amber-600)]">
              Browse by Shelf
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-ink-900)]">
            Curated{' '}
            <em className="font-display text-[var(--color-amber-500)]" style={{ fontStyle: 'italic' }}>
              collections
            </em>
          </h2>
        </div>

        {/* Grid — outer border, inner divided cells */}
        <div className="border border-[var(--color-parchment-300)] grid sm:grid-cols-2 lg:grid-cols-3 divide-y divide-[var(--color-parchment-300)]">
          {collections.map((col, i) => {
            const IconComponent = col.icon;
            return (
            <Link
              key={col.title}
              to={`/collections?category_id=${col.categoryId}`}
              className={`group flex flex-col gap-4 p-7 bg-[var(--color-parchment-50)] transition-colors hover:bg-[var(--color-parchment-200)] ${
                // right border for all but last in each row
                (i % 3 !== 2) ? 'lg:border-r border-[var(--color-parchment-300)]' : ''
              } ${
                (i % 2 !== 1) ? 'sm:border-r lg:border-r-0 border-[var(--color-parchment-300)]' : ''
              }`}
            >
              {/* Icon box */}
              <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-parchment-100)]">
                <IconComponent size={22} className="text-[var(--color-amber-600)]" />
              </span>

              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-[var(--color-ink-900)]">{col.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)] leading-relaxed">{col.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">{col.count} titles</span>
                <span className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-[var(--color-amber-600)] group-hover:underline">
                  Browse →
                </span>
              </div>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
};

export default SuggestedSection;