// src/components/common/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import StarRating from './StarRating.jsx';
import useAuth from '../../hooks/useAuth.js';

/**
 * BookCard — Premium Editorial Design
 * @param {'grid'|'list'} layout
 */
const BookCard = ({ book, layout = 'grid', onAddToCart, showSeller = false }) => {
  const { isBuyer } = useAuth();
  
  if (!book) return null;

  const basePath = isBuyer ? '/buyer/books' : '/books';

  const {
    id,
    title,
    author,
    price,
    cover_image,
    image_url,
    condition,
    category,
    categories,
    seller_name,
    store_name,
    average_rating,
    total_reviews,
  } = book;

  const coverImage = cover_image || image_url;
  const sellerName = seller_name || store_name;
  const categoryName = category || categories?.[0]?.name;

  const conditionConfig = {
    new:        { label: 'New',       bg: 'bg-[#e8f4e8]', text: 'text-[#1a5c1a]', dot: 'bg-[#2d8a2d]' },
    like_new:   { label: 'Like New',  bg: 'bg-[#e8f0fb]', text: 'text-[#1a3a8a]', dot: 'bg-[#2d5adc]' },
    'like-new': { label: 'Like New',  bg: 'bg-[#e8f0fb]', text: 'text-[#1a3a8a]', dot: 'bg-[#2d5adc]' },
    good:       { label: 'Good',      bg: 'bg-[#fef5e4]', text: 'text-[#7a4a00]', dot: 'bg-[#c47c00]' },
    acceptable: { label: 'Acceptable',bg: 'bg-[#fdeee8]', text: 'text-[#7a2a10]', dot: 'bg-[#c44020]' },
  };
  const cond = conditionConfig[condition] || conditionConfig.good;

  if (layout === 'list') {
    return (
      <article
        className="
          flex gap-5 p-5 bg-white
          border border-[#e8e0d8]
          hover:border-[#2d5a27]/30
          hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          transition-all duration-300 ease-out
          group
        "
        style={{ animation: 'fadeSlideUp 0.4s ease both' }}
      >
        <Link to={`${basePath}/${id}`} className="shrink-0">
          <div className="w-[72px] h-[100px] overflow-hidden bg-[#f0ebe4] relative">
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
              />
            ) : (
              <PlaceholderCover title={title} small />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link to={`${basePath}/${id}`}>
                <h3 className="font-serif font-bold text-base text-[#1a1a1a] line-clamp-1 leading-snug group-hover:text-[#2d5a27] transition-colors duration-200">
                  {title}
                </h3>
              </Link>
              <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${cond.bg} ${cond.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cond.dot}`} />
                {cond.label}
              </span>
            </div>
            <p className="text-xs text-[#8a7060] mt-1 font-medium">{author}</p>
            {categoryName && (
              <p className="text-[10px] text-[#a89080] mt-1.5 tracking-wider uppercase font-semibold">{categoryName}</p>
            )}
            {showSeller && sellerName && (
              <p className="text-xs text-[#a89080] mt-1">Sold by <span className="font-semibold text-[#6b5c4e]">{sellerName}</span></p>
            )}
            {total_reviews > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <StarRating rating={Math.round(average_rating || 0)} size={12} />
                <span className="text-[11px] text-[#8a7060] font-semibold">{Number(average_rating).toFixed(1)}</span>
                <span className="text-[10px] text-[#a89080]">({total_reviews})</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-xl text-[#1a1a1a]">
              ₹{Number(price).toLocaleString('en-IN')}
            </span>
            {onAddToCart && (
              <Button size="sm" variant="primary" onClick={() => onAddToCart(book)}>
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid layout
  return (
    <article
      className="
        group flex flex-col bg-white
        border border-[#e8e0d8]
        hover:border-[#2d5a27]/20
        overflow-hidden
        hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]
        transition-all duration-400 ease-out
        hover:-translate-y-1
      "
      style={{ animation: 'fadeSlideUp 0.4s ease both' }}
    >
      {/* Cover */}
      <Link to={`${basePath}/${id}`} className="block relative overflow-hidden aspect-[3/4]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600 ease-out"
            loading="lazy"
          />
        ) : (
          <PlaceholderCover title={title} author={author} />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/10 transition-colors duration-400" />

        {/* Condition badge */}
        <span className={`absolute top-0 left-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold tracking-widest uppercase ${cond.bg} ${cond.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cond.dot}`} />
          {cond.label}
        </span>

        {/* Cart button appears on hover */}
        {onAddToCart && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(book); }}
            className="
              absolute bottom-3 right-3
              w-10 h-10 rounded-full
              bg-[#1a1a1a] text-white
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              translate-y-2 group-hover:translate-y-0
              transition-all duration-300 ease-out
              hover:bg-[#2d5a27]
              shadow-lg
            "
            aria-label={`Add ${title} to cart`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 border-t border-[#f0ebe4]">
        <Link to={`${basePath}/${id}`}>
          <h3 className="font-serif font-bold text-sm leading-snug text-[#1a1a1a] line-clamp-2 group-hover:text-[#2d5a27] transition-colors duration-200">
            {title}
          </h3>
        </Link>
        <p className="text-xs text-[#8a7060] truncate">{author}</p>

        {showSeller && sellerName && (
          <p className="text-[10px] text-[#a89080] truncate">
            by <span className="font-semibold">{sellerName}</span>
          </p>
        )}

        {total_reviews > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating rating={Math.round(average_rating || 0)} size={10} maxStars={1} />
            <span className="text-[10px] text-[#8a7060] font-semibold">{Number(average_rating).toFixed(1)}</span>
            <span className="text-[9px] text-[#a89080]">({total_reviews})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#f0ebe4]">
          <span className="font-serif font-bold text-base text-[#1a1a1a]">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
          {categoryName && (
            <span className="text-[9px] text-[#a89080] tracking-wider uppercase font-bold">{categoryName}</span>
          )}
        </div>
      </div>
    </article>
  );
};

const PlaceholderCover = ({ title = '', small = false }) => {
  const palettes = [
    { bg: '#1a1a2e', fg: '#f8f4ef', accent: '#c9a96e' },
    { bg: '#1a2e1a', fg: '#f4f8f0', accent: '#6aaa6a' },
    { bg: '#2e1a1a', fg: '#faf4f4', accent: '#aa6a6a' },
    { bg: '#1a2030', fg: '#f0f4f8', accent: '#6a90aa' },
    { bg: '#2a2010', fg: '#faf6f0', accent: '#c0a060' },
  ];
  const p = palettes[(title.charCodeAt(0) || 0) % palettes.length];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ backgroundColor: p.bg }}
    >
      <svg width={small ? 24 : 36} height={small ? 32 : 46} viewBox="0 0 36 46" fill="none">
        <rect x="1" y="1" width="34" height="44" rx="2" stroke={p.fg} strokeOpacity="0.3" strokeWidth="1.5" fill={p.fg} fillOpacity="0.06" />
        <rect x="6" y="1" width="2" height="44" fill={p.accent} fillOpacity="0.5" rx="1" />
        <path d="M11 15h16M11 21h16M11 27h12M11 33h8" stroke={p.fg} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {!small && (
        <p className="text-center text-[9px] leading-tight font-serif font-medium px-4 line-clamp-3"
          style={{ color: p.fg, opacity: 0.7 }}>
          {title}
        </p>
      )}
    </div>
  );
};

export default BookCard;