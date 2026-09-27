import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const pad = (value) => String(value).padStart(2, '0');

const parseValue = (value) => {
  if (!value) return null;
  const localValue = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (localValue) {
    const [, year, month, day, hour, minute] = localValue.map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatValue = (date, hour, minute) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;

const sameDay = (left, right) =>
  left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate();

export default function DateTimePicker({ value, onChange, disabled = false, required = false, allowClear = false, ariaLabel = 'Choose date and time' }) {
  const selectedDate = parseValue(value);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [monthCursor, setMonthCursor] = useState(() => {
    const initialDate = parseValue(value) || new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const [activeDial, setActiveDial] = useState('hour');
  const [draftDate, setDraftDate] = useState(null);
  const [draftHour, setDraftHour] = useState(12);
  const [draftMinute, setDraftMinute] = useState(0);
  const [hourSelected, setHourSelected] = useState(false);
  const [minuteSelected, setMinuteSelected] = useState(false);
  const [minuteText, setMinuteText] = useState(pad(selectedDate?.getMinutes() || 0));

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const openPicker = () => {
    if (disabled) return;
    const initialDate = parseValue(value) || new Date();
    setDraftDate(selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null);
    setDraftHour(selectedDate?.getHours() ?? 12);
    setDraftMinute(selectedDate?.getMinutes() ?? 0);
    setHourSelected(Boolean(selectedDate));
    setMinuteSelected(Boolean(selectedDate));
    setMinuteText(pad(selectedDate?.getMinutes() ?? 0));
    setMonthCursor(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setActiveTab('date');
    setActiveDial('hour');
    setOpen(true);
  };

  const selectDate = (date) => {
    setDraftDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    setActiveTab('time');
  };

  const selectHour = (hour) => {
    const isPm = draftHour >= 12;
    setDraftHour((hour % 12) + (isPm ? 12 : 0));
    setHourSelected(true);
    setActiveDial('minute');
  };

  const selectMinute = (minute) => {
    setDraftMinute(minute);
    setMinuteText(pad(minute));
    setMinuteSelected(true);
  };

  const selectMeridiem = (pm) => {
    setDraftHour((draftHour % 12) + (pm ? 12 : 0));
    setHourSelected(true);
  };

  const applySelection = () => {
    if (!draftDate || !hourSelected || !minuteSelected) return;
    onChange(formatValue(draftDate, draftHour, draftMinute));
    setOpen(false);
  };

  const clearSelection = () => {
    onChange('');
    setOpen(false);
  };

  const firstOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const calendarStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1 - ((firstOfMonth.getDay() + 6) % 7));
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index));
  const nowParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value]),
  );
  const now = new Date(Number(nowParts.year), Number(nowParts.month) - 1, Number(nowParts.day));
  const dateComplete = Boolean(draftDate);
  const timeComplete = hourSelected && minuteSelected;
  const draftTime = new Date(2000, 0, 1, draftHour, draftMinute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const displayDate = selectedDate
    ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(selectedDate)
    : 'Choose date and time';
  const displayTime = selectedDate
    ? selectedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'Set a time';

  const monthLabel = monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const isPm = draftHour >= 12;
  const hourOnDial = draftHour % 12 || 12;
  const dialValue = activeDial === 'hour' ? hourOnDial : Math.floor(draftMinute / 5) * 5;
  const handAngle = activeDial === 'hour' ? (hourOnDial % 12) * 30 : draftMinute * 6;
  const dialOptions = activeDial === 'hour'
    ? Array.from({ length: 12 }, (_, index) => index + 1)
    : Array.from({ length: 12 }, (_, index) => index * 5);

  return (
    <>
      <button type="button" aria-label={ariaLabel} aria-expanded={open} aria-required={required} disabled={disabled} onClick={openPicker} style={{ width: '100%', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '9px', background: disabled ? '#f1f5f9' : '#fff', color: '#1f2937', textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer', font: 'inherit' }}>
        <span style={{ minWidth: 0, display: 'grid', gap: '2px' }}><strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.85rem' }}>{displayDate}</strong><span style={{ color: '#64748b', fontSize: '.76rem' }}>{displayTime}</span></span>
        <i className="fa-regular fa-calendar" aria-hidden="true" style={{ color: '#166534', flex: '0 0 auto' }} />
      </button>

      {open && createPortal(
        <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 50000, display: 'grid', placeItems: 'center', overflowY: 'auto', overscrollBehavior: 'contain', padding: '12px', boxSizing: 'border-box', background: 'rgba(10, 24, 20, .68)' }}>
          <section role="dialog" aria-modal="true" aria-label={ariaLabel} style={{ width: 'min(440px, 100%)', maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto', overscrollBehavior: 'contain', padding: '16px', border: '1px solid #bfd8cb', borderRadius: '14px', background: '#fff', color: '#17212b', boxShadow: '0 26px 80px rgba(0, 0, 0, .34)', boxSizing: 'border-box' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div><div style={{ color: '#166534', fontSize: '.68rem', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase' }}>{required ? 'Required schedule' : 'Optional close date'}</div><h2 style={{ margin: '4px 0 0', fontSize: '1.18rem', lineHeight: 1.25 }}>Set date and time</h2><div style={{ marginTop: '4px', color: '#64748b', fontSize: '.76rem' }}>West Africa Time (WAT) · saved when complete</div></div>
              <div aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: '38px', height: '38px', flex: '0 0 38px', borderRadius: '10px', background: '#e8f5ed', color: '#166534' }}><i className="fa-regular fa-calendar-check" /></div>
            </header>

            <div role="tablist" aria-label="Choose date or time" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '14px', padding: '4px', borderRadius: '9px', background: '#edf3ef' }}>
              {[{ id: 'date', label: 'Date', complete: dateComplete }, { id: 'time', label: 'Time', complete: timeComplete }].map((tab) => <button key={tab.id} id={`${ariaLabel.replace(/\W+/g, '-')}-${tab.id}-tab`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`${ariaLabel.replace(/\W+/g, '-')}-panel`} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '40px', border: 0, borderRadius: '7px', background: activeTab === tab.id ? '#fff' : 'transparent', color: activeTab === tab.id ? '#14532d' : '#64748b', font: 'inherit', fontSize: '.86rem', fontWeight: 850, cursor: 'pointer', boxShadow: activeTab === tab.id ? '0 1px 5px rgba(15,23,42,.12)' : 'none' }}>{tab.label}<span aria-label={tab.complete ? 'complete' : 'incomplete'} style={{ color: tab.complete ? '#15803d' : '#94a3b8', fontSize: '.75rem' }}>{tab.complete ? '✓' : '○'}</span></button>)}
            </div>

            <div id={`${ariaLabel.replace(/\W+/g, '-')}-panel`} role="tabpanel" aria-labelledby={`${ariaLabel.replace(/\W+/g, '-')}-${activeTab}-tab`}>
              {activeTab === 'date' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                    <button type="button" aria-label="Previous month" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', border: '1px solid #dbe7df', borderRadius: '8px', background: '#fff', color: '#166534', cursor: 'pointer' }}><i className="fa-solid fa-chevron-left" aria-hidden="true" /></button>
                    <strong style={{ fontSize: '.95rem' }}>{monthLabel}</strong>
                    <button type="button" aria-label="Next month" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', border: '1px solid #dbe7df', borderRadius: '8px', background: '#fff', color: '#166534', cursor: 'pointer' }}><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button>
                  </div>
                  <div role="grid" aria-label={monthLabel} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '3px', textAlign: 'center' }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`} role="columnheader" style={{ padding: '5px 0', color: '#64748b', fontSize: '.7rem', fontWeight: 800 }}>{day}</span>)}
                    {calendarDays.map((date) => {
                      const inMonth = date.getMonth() === monthCursor.getMonth();
                      const selected = draftDate && sameDay(date, draftDate);
                      const isToday = sameDay(date, now);
                      return <button key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`} type="button" role="gridcell" aria-label={date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} aria-selected={Boolean(selected)} onClick={() => selectDate(date)} style={{ width: '36px', height: '36px', justifySelf: 'center', border: selected ? '1px solid #166534' : isToday ? '1px solid #86efac' : '1px solid transparent', borderRadius: '50%', background: selected ? '#166534' : '#fff', color: selected ? '#fff' : inMonth ? '#1f2937' : '#94a3b8', fontWeight: selected || isToday ? 800 : 500, cursor: 'pointer' }}>{date.getDate()}</button>;
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}><span style={{ color: draftDate ? '#166534' : '#64748b', fontSize: '.8rem', fontWeight: 750 }}>{draftDate ? draftDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'Choose a day to continue'}</span><button type="button" onClick={() => selectDate(now)} style={{ border: '1px solid #b9d7c6', borderRadius: '7px', padding: '7px 10px', background: '#f3faf5', color: '#166534', fontSize: '.76rem', fontWeight: 800, cursor: 'pointer' }}>Today</button></div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '11px' }}><div><div style={{ color: '#64748b', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Selected time</div><strong style={{ fontSize: '1.16rem' }}>{draftTime}</strong></div><div role="group" aria-label="Choose AM or PM" style={{ display: 'flex', gap: '3px', padding: '3px', border: '1px solid #dbe7df', borderRadius: '8px', background: '#f8fafc' }}>{[false, true].map((pm) => <button key={String(pm)} type="button" aria-pressed={isPm === pm} onClick={() => selectMeridiem(pm)} style={{ padding: '6px 9px', border: 0, borderRadius: '6px', background: isPm === pm ? '#166534' : 'transparent', color: isPm === pm ? '#fff' : '#475569', fontWeight: 800, cursor: 'pointer' }}>{pm ? 'PM' : 'AM'}</button>)}</div></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px', padding: '3px', borderRadius: '8px', background: '#f1f5f9' }}>{['hour', 'minute'].map((mode) => <button key={mode} type="button" aria-pressed={activeDial === mode} onClick={() => setActiveDial(mode)} style={{ padding: '7px', border: 0, borderRadius: '6px', background: activeDial === mode ? '#fff' : 'transparent', color: activeDial === mode ? '#166534' : '#64748b', fontSize: '.76rem', fontWeight: 800, cursor: 'pointer', boxShadow: activeDial === mode ? '0 1px 4px rgba(15,23,42,.1)' : 'none' }}>{mode === 'hour' ? 'Hour' : 'Minute'}</button>)}</div>
                  <div aria-label={`Analog ${activeDial} selector`} style={{ position: 'relative', width: 'min(220px, 64vw)', aspectRatio: '1 / 1', margin: '0 auto', border: '1px solid #dbe7df', borderRadius: '50%', background: 'radial-gradient(circle, #fff 0 58%, #f0f7f3 59% 100%)' }}>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '32%', height: '2px', borderRadius: '2px', background: '#166534', transform: `rotate(${handAngle - 90}deg)`, transformOrigin: '0 50%' }} /><span aria-hidden="true" style={{ position: 'absolute', left: 'calc(50% - 4px)', top: 'calc(50% - 4px)', width: '8px', height: '8px', borderRadius: '50%', background: '#166534' }} />
                    {dialOptions.map((option, index) => { const angle = (index / 12) * Math.PI * 2 - Math.PI / 2; const left = 50 + Math.cos(angle) * 39; const top = 50 + Math.sin(angle) * 39; const active = option === dialValue; return <button key={option} type="button" aria-label={activeDial === 'hour' ? `${option} o'clock` : `${pad(option)} minutes`} aria-pressed={active} onClick={() => activeDial === 'hour' ? selectHour(option) : selectMinute(option)} style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)', width: 'min(34px, 10vw)', aspectRatio: '1 / 1', padding: 0, border: 0, borderRadius: '50%', background: active ? '#166534' : 'transparent', color: active ? '#fff' : '#334155', fontSize: activeDial === 'minute' ? '.68rem' : '.82rem', fontWeight: active ? 900 : 700, cursor: 'pointer' }}>{activeDial === 'hour' ? option : pad(option)}</button>; })}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px', color: '#475569', fontSize: '.78rem', fontWeight: 700 }}>Exact minute<input type="text" inputMode="numeric" aria-label="Exact minute" value={minuteText} onChange={(event) => { const nextText = event.target.value.replace(/\D/g, '').slice(0, 2); setMinuteText(nextText); setMinuteSelected(false); if (nextText.length === 2 && Number(nextText) < 60) selectMinute(Number(nextText)); }} style={{ width: '68px', padding: '7px 8px', border: '1px solid #cbd5e1', borderRadius: '7px', color: '#17212b', textAlign: 'center', font: 'inherit' }} /></label>
                  <div style={{ marginTop: '9px', color: '#64748b', textAlign: 'center', fontSize: '.74rem' }}>{draftDate ? `For ${draftDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Choose a date in the Date tab'}</div>
                </div>
              )}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              {allowClear ? <button type="button" onClick={clearSelection} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 11px', background: '#fff', color: '#475569', fontSize: '.78rem', fontWeight: 800, cursor: 'pointer' }}>No close date</button> : <span style={{ color: '#64748b', fontSize: '.74rem' }}>{dateComplete && timeComplete ? 'Ready to save' : 'Complete both tabs to continue'}</span>}
              <button type="button" onClick={applySelection} disabled={!dateComplete || !timeComplete} style={{ border: 0, borderRadius: '8px', padding: '10px 14px', background: dateComplete && timeComplete ? '#166534' : '#cbd5e1', color: dateComplete && timeComplete ? '#fff' : '#64748b', fontSize: '.82rem', fontWeight: 850, cursor: dateComplete && timeComplete ? 'pointer' : 'not-allowed' }}>Use date &amp; time</button>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}