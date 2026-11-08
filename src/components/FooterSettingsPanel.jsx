import { DEFAULT_FOOTER_SETTINGS, normalizeFooterSettings } from '../utils/footerSettings';

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #cbd5e1',
  borderRadius: '9px',
  padding: '11px 12px',
  color: '#0f172a',
  font: 'inherit'
};

export default function FooterSettingsPanel({ settings, setSettings, onSave, saving }) {
  const value = normalizeFooterSettings(settings);
  const update = (key, nextValue) => setSettings((current) => ({ ...normalizeFooterSettings(current), [key]: nextValue }));
  const fields = [
    { key: 'brandName', label: 'Brand name', maxLength: 100 },
    { key: 'contactEmail', label: 'Contact email', type: 'email', maxLength: 254 },
    { key: 'contactPhone', label: 'Contact phone', maxLength: 50 },
    { key: 'location', label: 'Location', maxLength: 180 },
    { key: 'copyright', label: 'Copyright text', maxLength: 180 }
  ];

  return (
    <section className="footer-settings-panel" aria-labelledby="footer-settings-title">
      <div>
        <span className="footer-settings-eyebrow">Site appearance</span>
        <h2 id="footer-settings-title">Website and email footer</h2>
        <p>Update the shared footer shown on public pages and in branded email notifications.</p>
      </div>
      <form className="footer-settings-form" onSubmit={onSave}>
        <label className="footer-settings-toggle">
          <input type="checkbox" checked={value.enabled} onChange={(event) => update('enabled', event.target.checked)} />
          <span>Show the footer on public screens (the admin dashboard is never affected)</span>
        </label>
        {fields.map((field) => (
          <label className="footer-settings-field" key={field.key}>
            <span>{field.label}</span>
            <input
              type={field.type || 'text'}
              value={value[field.key]}
              maxLength={field.maxLength}
              onChange={(event) => update(field.key, event.target.value)}
              required
              style={fieldStyle}
            />
          </label>
        ))}
        <label className="footer-settings-field footer-settings-wide">
          <span>Footer description</span>
          <textarea value={value.description} maxLength={1200} rows={4} onChange={(event) => update('description', event.target.value)} required style={fieldStyle} />
        </label>
        <label className="footer-settings-field footer-settings-wide">
          <span>Email footer note</span>
          <textarea value={value.emailFooterNote} maxLength={500} rows={3} onChange={(event) => update('emailFooterNote', event.target.value)} required style={fieldStyle} />
          <small>This text appears in the footer of branded emails sent by PAZ.</small>
        </label>
        <div className="footer-settings-actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save footer settings'}</button>
          <button type="button" disabled={saving} onClick={() => setSettings({ ...DEFAULT_FOOTER_SETTINGS })}>Restore defaults</button>
        </div>
      </form>
    </section>
  );
}
