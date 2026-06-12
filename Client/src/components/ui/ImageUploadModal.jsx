// src/components/ui/ImageUploadModal.jsx
import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * BiblioBazar ImageUploadModal — Earthy & Literary Design System
 *
 * Props:
 *   isOpen       - boolean
 *   onClose      - () => void
 *   onConfirm    - (file: File, previewUrl: string) => void
 *   accept       - string  (default: "image/*")
 *   maxSizeMB    - number  (default: 5)
 *   title        - string
 */
const ImageUploadModal = ({
  isOpen,
  onClose,
  onConfirm,
  accept = 'image/*',
  maxSizeMB = 5,
  title = 'Upload Image',
}) => {
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef(null);

  const reset = () => {
    setPreview(null);
    setFile(null);
    setError('');
    setDragging(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateAndSet = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith('image/');
    if (!isImage) { setError('Please select a valid image file.'); return; }

    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) { setError(`File must be under ${maxSizeMB}MB. Yours is ${sizeMB.toFixed(1)}MB.`); return; }

    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreview(url);
  };

  const handleFileChange = (e) => validateAndSet(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);

  const handleConfirm = () => {
    if (!file || !preview) return;
    onConfirm(file, preview);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={`Accepted formats: JPG, PNG, WebP · Max size: ${maxSizeMB}MB`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!file}>
            Use This Image
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !preview && inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            border-2 border-dashed rounded-sm transition-all duration-200 cursor-pointer
            min-h-[220px] overflow-hidden
            ${dragging
              ? 'border-[#5c7a5a] bg-[#5c7a5a]/10'
              : preview
              ? 'border-[#c9a97a] bg-transparent cursor-default'
              : 'border-[#c9a97a] hover:border-[#9e7c5a] hover:bg-[#f9f2e8] bg-[#fdf8f2]'
            }
          `}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="max-h-[280px] w-auto max-w-full object-contain"
              />
              {/* Change overlay */}
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="
                  absolute top-2 right-2
                  bg-[#3d2b1f]/80 text-[#f5efe6] text-xs
                  px-3 py-1.5 rounded-sm hover:bg-[#2d1f15]
                  transition-colors
                "
              >
                Remove
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center pointer-events-none">
              {/* Upload Icon */}
              <div className="h-14 w-14 rounded-full bg-[#ede0d0] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#9e7c5a]" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3d2b1f]">
                  {dragging ? 'Drop your image here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-[#9e7c5a] mt-1 font-['Lora',_serif] italic">
                  JPG, PNG, WebP up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Browse Button (when no preview) */}
        {!preview && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => inputRef.current?.click()}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-5.586l-2-2H4a1 1 0 00-1 1V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
            </svg>
            Browse Files
          </Button>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-[#8b3a3a] bg-[#8b3a3a]/10 border border-[#8b3a3a]/20 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        {/* File info */}
        {file && (
          <div className="flex items-center gap-3 bg-[#f0e8da] border border-[#d9c4a8] rounded-sm px-3 py-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#5c7a5a] shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#3d2b1f] truncate">{file.name}</p>
              <p className="text-xs text-[#9e7c5a]">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload image"
        />
      </div>
    </Modal>
  );
};

export default ImageUploadModal;
