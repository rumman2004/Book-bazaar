// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Bibliobazar Modal — Premium Editorial Design
 * Sizes: sm | md | lg | xl | full
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  className = '',
}) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <>
      <style>{`
        @keyframes bz-backdrop-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bz-panel-in {
          from { opacity: 0; transform: translateY(24px) scale(0.98) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[500] flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(15,12,8,0.65)',
          backdropFilter: 'blur(6px)',
          animation: 'bz-backdrop-in 0.2s ease forwards',
        }}
      >
        <div
          className={`
            relative w-full bg-[#faf7f4]
            border border-[#d4c4b0]
            flex flex-col max-h-[90vh] overflow-hidden
            shadow-[0_32px_80px_rgba(0,0,0,0.2)]
            ${sizes[size] ?? sizes.md}
            ${className}
          `}
          style={{ animation: 'bz-panel-in 0.25s cubic-bezier(0.34,1.2,0.64,1) forwards' }}
        >
          {/* Top accent stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#c9a96e] via-[#2d5a27] to-[#1a1a1a] flex-shrink-0" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-7 py-5 border-b border-[#e8e0d8] flex-shrink-0">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-serif font-bold text-[#1a1a1a] tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-[#8a7060] mt-1">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="
                    ml-4 flex-shrink-0 h-8 w-8 flex items-center justify-center
                    text-[#a89080] hover:text-[#1a1a1a] hover:bg-[#f0ebe4]
                    transition-all duration-150
                  "
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6 text-[#1a1a1a] font-sans text-sm leading-relaxed">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 px-7 py-4 border-t border-[#e8e0d8] bg-[#f5f0eb] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default Modal;