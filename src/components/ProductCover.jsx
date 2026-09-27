import React, { useEffect, useState } from 'react';

export const resolveProductCover = (product = {}) => {
  const candidates = [
    product.cover,
    product.cover_url,
    product.cover_image,
    product.image,
    product.image_url,
    product.imageUrl
  ];

  const cover = candidates
    .map((candidate) => typeof candidate === 'string' ? candidate.trim() : '')
    .find((candidate) => candidate && !/(?:^|\/)logo[^/]*\.(?:png|jpe?g|webp|svg)(?:[?#].*)?$/i.test(candidate)) || '';

  if (!cover) return '';
  if (/^(https?:|data:|blob:)/i.test(cover)) return cover;

  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  if (cover.startsWith('/storage/v1/object/public/')) return `${supabaseUrl}${cover}`;
  const storagePath = cover.replace(/^\/+/, '');
  if (supabaseUrl && storagePath.startsWith('products/')) {
    return `${supabaseUrl}/storage/v1/object/public/prof-upload/${storagePath.split('/').map(encodeURIComponent).join('/')}`;
  }
  return `/${storagePath}`;
};

const placeholderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '0.65rem',
  boxSizing: 'border-box',
  overflow: 'hidden',
  padding: '1.25rem',
  background: 'linear-gradient(145deg, #174d3b, #287653)',
  color: '#fff',
  textAlign: 'left'
};

export default function ProductCover({ product = {}, className = '', style = {} }) {
  const cover = resolveProductCover(product);
  const [failedCover, setFailedCover] = useState('');
  const title = product.title || product.name || 'Product cover';
  const unavailable = !cover || failedCover === cover;

  useEffect(() => {
    setFailedCover('');
  }, [cover]);

  if (unavailable) {
    return (
      <div
        className={className}
        role="img"
        aria-label={`${title}, cover image not uploaded`}
        style={{ ...style, ...placeholderStyle }}
      >
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.82 }}>
          {product.category || 'Digital resource'}
        </span>
        <strong style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.95rem, 2vw, 1.5rem)', lineHeight: 1.15, overflowWrap: 'anywhere' }}>
          {title}
        </strong>
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.72rem', opacity: 0.82 }}>
          Cover image not uploaded
        </span>
      </div>
    );
  }

  return (
    <img
      src={cover}
      alt={`${title} cover`}
      className={className}
      style={style}
      onError={() => setFailedCover(cover)}
    />
  );
}
