// src/components/ui/TextArea.jsx
import React, { forwardRef } from 'react';

/**
 * Bibliobazar TextArea — Premium Editorial Design
 */
const TextArea = forwardRef(({
  label,
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  textareaClassName = '',
  ...props
}, ref) => {
  const inputId = id || name;
  const currentLength = value?.length ?? 0;

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

      <div className="relative group">
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full rounded-none bg-[#faf7f4] text-[#1a1a1a]
            font-sans text-sm placeholder:text-[#b8a898] placeholder:font-light
            px-4 py-3 resize-y
            border border-[#d4c4b0]
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-0 focus:border-[#2d5a27] focus:bg-white
            hover:border-[#a89080]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-[#8b2222] bg-[#fff8f8] focus:border-[#8b2222]' : ''}
            ${textareaClassName}
          `}
          {...props}
        />
        {/* corner accent */}
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-focus-within:border-[#2d5a27] transition-colors duration-300" />
      </div>

      <div className="flex items-center justify-between">
        {(error || helperText) && (
          <p className={`text-xs ${error ? 'text-[#8b2222]' : 'text-[#a89080]'}`}>
            {error || helperText}
          </p>
        )}
        {showCharCount && maxLength && (
          <p className={`text-xs ml-auto tabular-nums ${currentLength >= maxLength ? 'text-[#8b2222]' : 'text-[#a89080]'}`}>
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;