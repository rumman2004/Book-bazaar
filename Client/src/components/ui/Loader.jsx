// src/components/ui/Loader.jsx
import React from 'react';

/**
 * BiblioBazar Loader — Earthy & Literary Design System
 *
 * Variants: spinner | dots | skeleton | page | overlay
 */

// ─── Spinner ──────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-3 w-3 border',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full animate-spin
        border-[#c9a97a] border-t-[#3d2b1f]
        ${sizes[size] ?? sizes.md}
        ${className}
      `}
    />
  );
};

// ─── Dots ──────────────────────────────────────────────────
export const Dots = ({ className = '' }) => (
  <span role="status" aria-label="Loading" className={`inline-flex items-center gap-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-[#3d2b1f] animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
      />
    ))}
  </span>
);

// ─── Skeleton ──────────────────────────────────────────────
export const Skeleton = ({ className = '', lines = 1, height = 'h-4' }) => {
  if (lines === 1) {
    return (
      <div
        className={`rounded-sm bg-gradient-to-r from-[#ede0d0] via-[#f5ebe0] to-[#ede0d0] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] ${height} ${className}`}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`rounded-sm ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          style={{
            background: 'linear-gradient(90deg, #ede0d0 25%, #f5ebe0 50%, #ede0d0 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

// ─── BookCard Skeleton ─────────────────────────────────────
export const BookCardSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 bg-[#fdf8f2] border border-[#e8d5bc] rounded-sm">
    <Skeleton className="h-48 w-full" />
    <Skeleton lines={2} />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex justify-between mt-1">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// ─── Page Loader ───────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ee] gap-6">
    {/* Decorative book icon */}
    <div className="relative">
      <svg
        viewBox="0 0 48 48"
        className="h-14 w-14 text-[#3d2b1f] opacity-80 animate-pulse"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 8C6 6.895 6.895 6 8 6H24V42H8C6.895 42 6 41.105 6 40V8Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 6H40C41.105 6 42 6.895 42 8V40C42 41.105 41.105 42 40 42H24V6Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
        <line x1="24" y1="6" x2="24" y2="42" stroke="currentColor" strokeWidth="2"/>
        <path d="M11 14H19M11 20H19M11 26H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>

    <div className="flex flex-col items-center gap-2">
      <Dots />
      <p className="text-xs tracking-[0.2em] uppercase text-[#9e7c5a] font-['Lora',_serif]">
        Loading BiblioBazar
      </p>
    </div>
  </div>
);

// ─── Overlay Loader ────────────────────────────────────────
export const OverlayLoader = ({ message = 'Please wait…' }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#2c1f14]/60 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 bg-[#fdf8f2] border border-[#e8d5bc] rounded-sm px-10 py-8 shadow-2xl">
      <Spinner size="lg" />
      <p className="text-sm text-[#5a3e2b] font-['Lora',_serif] italic">{message}</p>
    </div>
  </div>
);

// ─── Default export: Spinner ───────────────────────────────
const Loader = Spinner;
export default Loader;

/* 
  Add to index.css for shimmer animation:
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
*/