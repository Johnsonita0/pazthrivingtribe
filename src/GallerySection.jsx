import React, { useState, useEffect, useRef } from 'react';

const galleryItems = [
  {
    title: 'Youth Leadership Programs',
    description: 'We offer comprehensive coaching and mentorship for schools, equipping young people with confidence, emotional intelligence, and leadership skills that transform classroom dynamics and student engagement.',
    image: '/image/pic1.jpeg',
    // service: 'Schools',
  },
  {
    title: 'Church Youth Outreach',
    description: 'Connect with young congregants through interactive sessions, spiritual guidance, and character-building workshops that strengthen faith and community bonds in churches.',
    image: '/image/pic2.png',
    // service: 'Churches',
  },
  {
    title: 'Teen Empowerment Workshops',
    description: 'Interactive workshops designed for schools and youth centers to help teens navigate peer pressure, build self-worth, and develop healthy communication skills.',
    image: '/image/pic3.png',
    // service: 'Youth Centers',
  },
  {
    title: 'School Assembly Programs',
    description: 'Engaging full-school assemblies and motivational talks for students and staff, creating lasting impact through inspiring messages and interactive experiences.',
    image: '/image/pic5.png',
    // service: 'Schools',
  },
  {
    title: 'Corporate Team Building',
    description: 'Organizations benefit from our tailored team coaching, fostering collaboration, emotional wellness, and a thriving workplace culture for employees at all levels.',
    image: '/image/pic6.png',
    // service: 'Corporations',
  },
  // {
  //   title: 'Children\'s Character Development',
  //   description: 'Sunday school and church education programs enriched with values-based coaching that helps children ages 6-12 develop confidence, kindness, and strong character foundations.',
  //   image: '/image/pic7.png',
  //   // service: 'Churches',
  // },
  {
    title: 'Mental Wellness Seminars',
    description: 'Professional seminars for schools, workplaces, and organizations on stress management, anxiety relief, and mental health awareness led by certified coaches.',
    image: '/image/pic8.png',
    // service: 'Organizations',
  },
  {
    title: 'Community Empowerment Series',
    description: 'Multi-week programs for community centers and NGOs fostering personal growth, resilience, and social impact through group coaching and peer mentorship.',
    image: '/image/pic9.jpeg',
    // service: 'Communities',
  },
  {
    title: 'Live Event Coaching',
    description: 'Dynamic coaching sessions at conferences and community gatherings, where attendees experience transformational conversations and actionable strategies for personal growth.',
    image: '/image/pic10',
    // service: 'Events',
  },
  {
    title: 'Church Youth Development Session',
    description: 'Interactive church sessions fostering spiritual growth, character development, and peer mentorship for young congregants in a supportive faith community.',
    image: '/image/pic11',
    // service: 'Churches',
  },
  {
    title: 'Group Empowerment Days',
    description: 'Large-scale community events where participants come together for interactive workshops, team activities, and transformative coaching experiences in a supportive environment.',
    image: '/image/pic12',
    // service: 'Communities',
  },
  {
    title: 'Lead Coach - Roseline Iraoya',
    description: 'Meet our Lead Coach, Roseline Iraoya, dedicated to transforming lives through personalized coaching, mentorship, and creating a thriving community of growth.',
    image: '/image/pic13',
    // service: 'Leadership',
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
  const dragState = useRef({ active: false, startX: 0, startTranslate: 0, startTime: 0 });
  const autoScrollPaused = useRef(false);
  const autoScrollResumeTimeout = useRef(null);
  const animationFrame = useRef(null);
  const isWrappingRef = useRef(false);
  const animationSpeed = 18; // pixels per second

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
    let lastTimestamp = performance.now();

    const step = (timestamp) => {
      if (autoScrollPaused.current) {
        animationFrame.current = window.requestAnimationFrame(step);
        return;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const increment = (animationSpeed * delta) / 1000;

      setTranslateX((current) => {
        const maxScroll = trackWidth / 2;
        let next = current + increment;
        
        // Seamless wrap at midpoint
        if (next >= maxScroll) {
          isWrappingRef.current = true;
          next -= maxScroll;
        } else {
          isWrappingRef.current = false;
        }
        
        return next;
      });
      animationFrame.current = window.requestAnimationFrame(step);
    };

    animationFrame.current = window.requestAnimationFrame(step);
    return () => {
      if (animationFrame.current) window.cancelAnimationFrame(animationFrame.current);
    };
  }, [trackWidth, animationSpeed]);

  const extendedItems = [...galleryItems, ...galleryItems];
  const isMobileView = slidesPerView <= 2;
  const cardWidth = slidesPerView === 1 ? 100 : 100 / slidesPerView;
  const trackStyle = {
    display: 'flex',
    gap: '0.75rem',
    transform: `translateX(-${translateX}px)`,
    transition: isWrappingRef.current ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const trackWrapperStyle = {
    position: 'relative',
    overflow: 'hidden',
    padding: '0 1rem',
    marginTop: '2rem',
    touchAction: 'pan-y',
  };

  const arrowButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: isDark ? 'rgba(14, 19, 28, 0.82)' : 'rgba(255,255,255,0.92)',
    color: isDark ? '#f8fafc' : '#111827',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.18)' : '0 8px 20px rgba(15,23,42,0.12)',
    opacity: 0.95,
    zIndex: 10,
  };

  const moveGalleryBy = (delta) => {
    pauseAutoScroll();
    setTranslateX((current) => {
      const maxScroll = trackWidth / 2;
      let next = current + delta;
      if (next >= maxScroll) next -= maxScroll;
      if (next < 0) next += maxScroll;
      return next;
    });
  };

  const pauseAutoScroll = () => {
    autoScrollPaused.current = true;
    if (autoScrollResumeTimeout.current) {
      clearTimeout(autoScrollResumeTimeout.current);
    }
    autoScrollResumeTimeout.current = window.setTimeout(() => {
      autoScrollPaused.current = false;
    }, 800);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'touch') return;
    pauseAutoScroll();
    dragState.current.active = true;
    dragState.current.startX = event.clientX;
    dragState.current.startTranslate = translateX;
    dragState.current.startTime = performance.now();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current.active || event.pointerType !== 'touch') return;
    const maxScroll = trackWidth / 2;
    const delta = dragState.current.startX - event.clientX;
    let next = dragState.current.startTranslate + delta;
    if (next >= maxScroll) next -= maxScroll;
    if (next < 0) next += maxScroll;
    setTranslateX(next);
  };

  const handlePointerEnd = (event) => {
    if (!dragState.current.active || event.pointerType !== 'touch') return;
    const delta = dragState.current.startX - event.clientX;
    const duration = Math.max(1, performance.now() - dragState.current.startTime);
    const velocity = delta / duration;
    const momentum = Math.sign(velocity) * Math.min(450, Math.abs(velocity) * 260);
    moveGalleryBy(momentum);
    dragState.current.active = false;
    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const arrowShift = Math.max(containerWidth * 0.5, (trackWidth / extendedItems.length) * 1.5 || 220);

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

  const serviceBadgeStyle = {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    background: isDark ? 'rgba(59, 130, 246, 0.85)' : 'rgba(59, 130, 246, 0.9)',
    color: '#ffffff',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.18)',
  };

  const frameStyleWithBadge = {
    ...frameStyle,
    position: 'relative',
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  return (
    <section id="image-gallery" className="gallery-section" data-aos="fade-up">
      {/* <span className="section-label">Visual storytelling</span> */}
      <h2 className="section-title-heading">Services We Offer</h2>
      <p className="section-subtext">Transforming lives through coaching and mentorship for Churches, Schools, Youth Centers, Organizations, and Communities. Discover the impact we create.</p>

      <div
        style={trackWrapperStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div ref={trackRef} style={trackStyle}>
          {extendedItems.map((item, index) => (
            <div key={`${item.title}-${index}`} style={cardStyle(index)} onClick={() => openModal(item)}>
              <div style={frameStyleWithBadge}>
                {item.service && <div style={serviceBadgeStyle}>{item.service}</div>}
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
        {!isMobileView && (
          <>
            <button
              type="button"
              style={{ ...arrowButtonStyle, left: '0.75rem' }}
              onClick={() => moveGalleryBy(-arrowShift)}
              aria-label="Scroll gallery left"
            >
              ‹
            </button>
            <button
              type="button"
              style={{ ...arrowButtonStyle, right: '0.75rem' }}
              onClick={() => moveGalleryBy(arrowShift)}
              aria-label="Scroll gallery right"
            >
              ›
            </button>
          </>
        )}
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
