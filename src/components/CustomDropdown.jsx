import { useEffect, useRef, useState } from 'react';

export default function CustomDropdown({ value, options, onChange, placeholder = 'Choose an option', ariaLabel }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const close = (event) => { if (!containerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const selected = options.find((option) => String(option.value) === String(value));
  return <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
    <button type="button" aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen((current) => !current)} style={{ width: '100%', minHeight: '46px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', color: '#334155', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
      {selected?.label || placeholder}<span style={{ float: 'right' }} aria-hidden="true">⌄</span>
    </button>
    {open && <div role="listbox" aria-label={ariaLabel || placeholder} style={{ position: 'absolute', zIndex: 1000, top: 'calc(100% + 5px)', left: 0, right: 0, maxHeight: '240px', overflowY: 'auto', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', boxShadow: '0 14px 30px rgba(15,23,42,.18)' }}>
      {options.map((option) => <button key={String(option.value)} type="button" role="option" aria-selected={String(option.value) === String(value)} onClick={() => { onChange(option.value); setOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px', border: 0, borderRadius: '7px', background: String(option.value) === String(value) ? '#fff7ed' : '#fff', color: '#334155', textAlign: 'left', font: 'inherit', cursor: 'pointer' }}>{option.label}</button>)}
    </div>}
  </div>;
}
