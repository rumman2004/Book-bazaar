// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

/**
 * Bibliobazar Input — Premium Editorial Design
 */
const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputId = id || name;

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  };

  const iconPadLeft  = leftIcon  ? (size === 'lg' ? 'pl-11' : 'pl-10') : sizeStyles[size].split(' ')[0];
  const iconPadRight = rightIcon ? (size === 'lg' ? 'pr-11' : 'pr-10') : '';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b5c4e] select-none"
        >
          {label}
          {required && <span className="ml-1 text-[#8b2222]">*</span>}
        </label>
      )}

      <div className="relative flex items-center group">
        {leftIcon && (
          <span className="absolute left-3 text-[#a89080] group-focus-within:text-[#2d5a27] transition-colors duration-200 pointer-events-none z-10">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-none bg-white text-[#1a1a1a]
            font-sans placeholder:text-[#b8a898] placeholder:font-light
            border-0 border-b-2 transition-all duration-300
            focus:outline-none focus:ring-0
            disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#f5f0eb]
            ${error
              ? 'border-b-[#8b2222] focus:border-b-[#8b2222] bg-[#fff8f8]'
              : 'border-b-[#d4c4b0] focus:border-b-[#2d5a27] hover:border-b-[#a89080]'
            }
            ${sizeStyles[size] ?? sizeStyles.md}
            ${leftIcon  ? iconPadLeft  : ''}
            ${rightIcon ? iconPadRight : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-[#a89080] pointer-events-none">
            {rightIcon}
          </span>
        )}

        {/* animated focus line */}
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#2d5a27] group-focus-within:w-full transition-all duration-300 ease-out" />
      </div>

      {(error || helperText) && (
        <p className={`text-xs mt-0.5 ${error ? 'text-[#8b2222]' : 'text-[#a89080]'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;