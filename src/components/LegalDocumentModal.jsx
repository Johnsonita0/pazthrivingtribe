import { useEffect, useRef } from 'react';

export default function LegalDocumentModal({ policy, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('button')?.focus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = [...panelRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <div
      className="legal-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(null);
      }}
    >
      <section
        ref={panelRef}
        className="legal-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${policy.id}-title`}
        aria-describedby={`${policy.id}-intro`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose(null);
          }
        }}
      >
        <header className="legal-modal-header">
          <div>
            <span className="legal-modal-eyebrow">PAZ THRIVING TRIBE</span>
            <h2 id={`${policy.id}-title`}>{policy.title}</h2>
            <p id={`${policy.id}-intro`}>{policy.introduction}</p>
          </div>
          <button type="button" className="legal-modal-dismiss" aria-label="Close policy" onClick={() => onClose(null)}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="legal-modal-body">
          {policy.sections.map((section) => (
            <section className="legal-modal-section" key={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <footer className="legal-modal-footer">
          <span>Questions? pazthrivingtribe@gmail.com</span>
          <button type="button" onClick={() => onClose(null)}>Close</button>
        </footer>
      </section>
    </div>
  );
}
