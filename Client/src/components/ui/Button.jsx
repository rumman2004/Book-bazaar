// src/components/ui/Button.jsx
import React from 'react';

/**
 * Bibliobazar Button — Premium Editorial Design
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const base = `
    inline-flex items-center justify-center gap-2
    font-sans font-semibold tracking-[0.04em]
    rounded-none transition-all duration-300 ease-out
    cursor-pointer select-none relative overflow-hidden
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a472a]/40 focus-visible:ring-offset-2
    disabled:opacity-40 disabled:cursor-not-allowed
    active:scale-[0.97]
    group
  `;

  const variants = {
    primary: `
      bg-[#1a1a1a] text-[#f8f4ef]
      border border-[#1a1a1a]
      hover:bg-[#2d5a27] hover:border-[#2d5a27]
      shadow-[0_2px_12px_rgba(26,26,26,0.15)]
      hover:shadow-[0_8px_24px_rgba(45,90,39,0.3)]
    `,
    secondary: `
      bg-[#2d5a27] text-[#f8f4ef]
      border border-[#2d5a27]
      hover:bg-[#1f3f1c] hover:border-[#1f3f1c]
      shadow-[0_2px_12px_rgba(45,90,39,0.2)]
      hover:shadow-[0_8px_24px_rgba(45,90,39,0.35)]
    `,
    ghost: `
      bg-transparent text-[#1a1a1a]
      border border-transparent
      hover:bg-[#f0ebe4]
      hover:border-[#d4c4b0]
    `,
    outline: `
      bg-transparent text-[#1a1a1a]
      border border-[#1a1a1a]
      hover:bg-[#1a1a1a] hover:text-[#f8f4ef]
    `,
    danger: `
      bg-[#8b2222] text-[#fef9f7]
      border border-[#8b2222]
      hover:bg-[#6b1919] hover:border-[#6b1919]
      shadow-[0_2px_12px_rgba(139,34,34,0.2)]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${base}
        ${variants[variant] ?? variants.primary}
        ${sizes[size] ?? sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Animated shine on hover */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {leftIcon && <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{rightIcon}</span>}
      </span>
    </button>
  );
};

export default Button;