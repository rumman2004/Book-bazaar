import React, { useState, useRef } from 'react';

/**
 * SearchBar — animated search input with category filter and submit.
 * @param {Function} onSearch - called with { query, category }
 * @param {Array}    categories - [{ id, name }] for dropdown
 * @param {string}   placeholder
 * @param {boolean}  showCategory
 */
const SearchBar = ({
  onSearch,
  categories = [],
  placeholder = 'Search by title, author, ISBN…',
  showCategory = true,
  defaultValue = '',
  className = '',
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [category, setCategory] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ query: query.trim(), category });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-stretch gap-0 w-full ${className}`}
      role="search"
    >
      <div
        className={`
          flex items-center flex-1 gap-2 px-4
          bg-white border border-[var(--color-border-strong)]
          rounded-l-[var(--radius-lg)] border-r-0
          focus-within:border-[var(--color-amber-400)]
          focus-within:ring-2 focus-within:ring-[var(--color-amber-400)]/20
          transition-all duration-150
        `}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            flex-1 py-3 text-sm bg-transparent outline-none
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            font-body
          "
          aria-label="Search books"
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {showCategory && categories.length > 0 && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            px-3 py-3 text-sm
            bg-[var(--color-parchment-100)]
            text-[var(--color-text-secondary)]
            border border-[var(--color-border-strong)] border-l-0
            outline-none font-body
            focus:border-[var(--color-amber-400)]
            transition-colors duration-150
            cursor-pointer hidden sm:block
          "
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      <button
        type="submit"
        className="
          px-5 py-3 text-sm font-medium font-body
          bg-[var(--color-ink-900)] text-[var(--color-parchment-50)]
          rounded-r-[var(--radius-lg)]
          hover:bg-[var(--color-ink-700)]
          active:scale-[0.98]
          transition-all duration-150
          shrink-0
        "
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;