import React, { useState, useEffect, useRef } from 'react';

const galleryItems = [
  {
    title: 'Safe Space Sessions',
    description: 'A gentle guided experience with coaching, meditation, and reflection for young people and parents who want calm, confidence, and clarity.',
    image: '/image/pic1.jpeg',
  },
  {
    title: 'Family Connection',
    description: 'Real-life moments of trust and teamwork, captured in a warm frame that shows how every family can grow stronger together.',
    image: '/image/pic2.png',
  },
  {
    title: 'Teen Growth Journey',
    description: 'A day in the life of growth, resilience, and self-discovery, designed to inspire teens to take the next courageous step.',
    image: '/image/pic3.png',
  },
  {
    title: 'Parent Empowerment',
    description: 'Support, tools, and encouragement for parents who are building healthier boundaries, deeper listening, and stronger family rhythms.',
    image: '/image/pic4.png',
  },
];

export default function GallerySection({ theme }) {
  const isDark = theme === 'dark';
  const [slidesPerView, setSlidesPerView] = useState(5);
  const [translateX, setTranslateX] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const trackRef = useRef(null);
  const animationSpeed = 12; // pixels per second

  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;
      if (width < 560) {
        setSlidesPerView(1);
      } else if (width < 840) {
        setSlidesPerView(2);
      } else if (width < 1120) {
        setSlidesPerView(3);
      } else if (width < 1440) {
        setSlidesPerView(4);
      } else {
        setSlidesPerView(5);
      }
    };

    updateSlides();
    window.addEventListener('resize', updateSlides);
    return () => window.removeEventListener('resize', updateSlides);
  }, []);

  useEffect(() => {
    const updateWidths = () => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      setTrackWidth(trackEl.scrollWidth);
      setContainerWidth(trackEl.parentElement?.offsetWidth || 0);
    };

    updateWidths();
    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, [slidesPerView]);

  useEffect(() => {
    if (!trackWidth) return;
    let rafId = 0;
    let lastTimestamp = performance.now();

    const step = (timestamp) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      setTranslateX((current) => {
        const next = current + (animationSpeed * delta) / 1000;
        return next >= trackWidth / 2 ? next - trackWidth / 2 : next;
      });

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [trackWidth]);

  const extendedItems = [...galleryItems, ...galleryItems];
  const cardWidth = 100 / slidesPerView;
  const trackStyle = {
    display: 'flex',
    gap: '0.75rem',
    transform: `translateX(-${translateX}px)`,
    transition: 'none',
  };

  const cardStyle = (index) => {
    const cardSize = trackWidth / extendedItems.length;
    const cardCenter = index * cardSize + cardSize / 2;
    const activeCenter = containerWidth / 2;
    const period = trackWidth / 2 || trackWidth;
    let position = cardCenter - translateX;
    while (position < -cardSize) position += period;
    while (position > period + cardSize) position -= period;
    const distance = Math.abs(position - activeCenter);
    const intensity = Math.max(0, 1 - Math.min(distance / activeCenter, 1));
    const scale = 1 + 0.08 * intensity;

    return {
      width: `${cardWidth}%`,
      flex: `0 0 ${cardWidth}%`,
      padding: '0.45rem',
      boxSizing: 'border-box',
      transform: `scale(${scale})`,
      transition: 'transform 0.3s ease',
      zIndex: Math.round(100 + intensity * 10),
      willChange: 'transform',
    };
  };

  const frameStyle = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    overflow: 'hidden',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'}`,
    boxShadow: isDark ? '0 16px 38px rgba(0,0,0,0.18)' : '0 10px 24px rgba(15,23,42,0.12)',
    background: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 8%, transparent 92%, rgba(255,255,255,0.04) 100%), var(--bg-card)`,
    minHeight: '260px',
  };

  const imageStyle = {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    display: 'block',
  };

  const captionStyle = {
    padding: '0.85rem 0.9rem 0.95rem',
    background: isDark ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.92)',
    color: isDark ? '#f8fafc' : '#16212a',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  };

  const overlayTitleStyle = {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.01em',
  };

  const overlayDescriptionStyle = {
    margin: 0,
    fontSize: '0.86rem',
    lineHeight: 1.2,
    opacity: 0.92,
    color: isDark ? '#d9e2ec' : '#57606a',
    maxHeight: '2.4rem',
    overflow: 'hidden',
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(15,23,42,0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    zIndex: 9999,
  };

  const modalContentStyle = {
    maxWidth: '760px',
    width: 'min(100%, 760px)',
    maxHeight: 'calc(100vh - 3rem)',
    borderRadius: '24px',
    overflow: 'hidden',
    background: isDark ? '#090a0f' : 'var(--bg-main)',
    boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.55)' : '0 20px 60px rgba(15,23,42,0.16)',
    display: 'flex',
    flexDirection: 'column',
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.14)'}`,
  };

  const modalTitleStyle = {
    margin: 0,
    color: isDark ? '#ffffff' : '#111827',
    fontSize: '1.4rem',
    lineHeight: 1.2,
  };

  const closeButtonStyle = {
    background: isDark ? 'rgba(255,255,255,0.12)' : 'var(--bg-card)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.24)' : 'rgba(15,23,42,0.18)'}`,
    color: isDark ? '#fff' : '#111827',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'grid',
    placeItems: 'center',
    boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.18)' : '0 10px 20px rgba(15,23,42,0.12)',
  };

  const modalBodyStyle = {
    padding: '1.25rem',
    color: isDark ? '#d5d7db' : '#292f36',
    lineHeight: 1.55,
    overflowY: 'auto',
  };

  const readMoreStyle = {
    marginTop: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.85rem',
    borderRadius: '999px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.16)'}`,
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
    color: isDark ? '#f8fafc' : '#111827',
    cursor: 'pointer',
    fontSize: '0.9rem',
  };

  const getTruncatedDescription = (text) => {
    const max = 90;
    if (text.length <= max) return text;
    return `${text.slice(0, max).trim()}...`;
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  return (
    <section id="image-gallery" className="gallery-section" data-aos="fade-up">
      <span className="section-label">Visual storytelling</span>
      <h2 className="section-title-heading">Gallery of impact</h2>
      <p className="section-subtext">Enjoy a visual journey through our work and the lives we touch.</p>

      <div style={{ position: 'relative', overflow: 'hidden', padding: '0 1rem', marginTop: '2rem' }}>
        <div ref={trackRef} style={trackStyle}>
          {extendedItems.map((item, index) => (
            <div key={`${item.title}-${index}`} style={cardStyle(index)} onClick={() => openModal(item)}>
              <div style={frameStyle}>
                <img src={item.image} alt={item.title} style={imageStyle} />
                <div style={captionStyle}>
                  <h3 style={overlayTitleStyle}>{item.title}</h3>
                  <p style={overlayDescriptionStyle}>{getTruncatedDescription(item.description)}</p>
                  {item.description.length > 90 && (
                    <button type="button" style={readMoreStyle} onClick={(event) => { event.stopPropagation(); openModal(item); }}>
                      Read more
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>{selectedItem.title}</h3>
              <button type="button" style={closeButtonStyle} onClick={closeModal} aria-label="Close modal">
                ×
              </button>
            </div>
            <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden' }}>
              <img src={selectedItem.image} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={modalBodyStyle}>
              <p style={{ margin: 0, lineHeight: 1.5 }}>{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
