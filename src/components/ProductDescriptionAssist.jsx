import { useState } from 'react';

export default function ProductDescriptionAssist({
  productTitle,
  category,
  currentDescription,
  accessToken,
  onUseDraft,
}) {
  const [open, setOpen] = useState(false);
  const [perspective, setPerspective] = useState('');
  const [productFacts, setProductFacts] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateDescription = async () => {
    if (!perspective.trim()) {
      setError('Describe the perspective or tone you want first.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/generate-product-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: productTitle,
          category,
          perspective: perspective.trim(),
          facts: productFacts.trim(),
          currentDescription: currentDescription.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'The description could not be generated.');
      setGeneratedDraft(String(payload.description || '').trim());
    } catch (requestError) {
      setError(requestError.message || 'The description could not be generated. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => { setOpen((value) => !value); setError(''); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #b7d8c4', borderRadius: '8px', padding: '8px 11px', background: '#f2faf4', color: '#166534', font: 'inherit', fontSize: '.82rem', fontWeight: 800, cursor: 'pointer' }}
      >
        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
        {open ? 'Hide AI writing helper' : 'Help me write with AI'}
      </button>

      {open && (
        <section aria-label="AI product description helper" style={{ display: 'grid', gap: '10px', marginTop: '10px', padding: '13px', border: '1px solid #cfe3d5', borderLeft: '4px solid #16834b', borderRadius: '8px', background: '#f8fcf9' }}>
          <div>
            <strong style={{ color: '#173b2a', fontSize: '.88rem' }}>Choose the perspective</strong>
            <p style={{ margin: '3px 0 0', color: '#64756a', fontSize: '.77rem', lineHeight: 1.45 }}>Tell the assistant who it should speak to and what tone to use. Generated copy stays a draft until you apply it.</p>
          </div>
          <label style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '.78rem', fontWeight: 750 }}>
            Perspective or tone
            <textarea rows="2" maxLength="400" value={perspective} onChange={(event) => setPerspective(event.target.value)} placeholder="For example: speak warmly to parents; sound practical, encouraging, and clear." style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '7px', resize: 'vertical', font: 'inherit' }} />
          </label>
          <label style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '.78rem', fontWeight: 750 }}>
            What is inside or useful to know? (optional)
            <textarea rows="2" maxLength="700" value={productFacts} onChange={(event) => setProductFacts(event.target.value)} placeholder="Key topics, format, audience, or practical benefits" style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '7px', resize: 'vertical', font: 'inherit' }} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' }}>
            <button type="button" onClick={generateDescription} disabled={generating || !perspective.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', border: 0, borderRadius: '7px', padding: '9px 12px', background: generating || !perspective.trim() ? '#cbd5e1' : '#166534', color: generating || !perspective.trim() ? '#64748b' : '#fff', fontWeight: 800, cursor: generating || !perspective.trim() ? 'not-allowed' : 'pointer' }}>
              <i className={`fa-solid ${generating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} aria-hidden="true" />
              {generating ? 'Writing draft...' : generatedDraft ? 'Generate another' : 'Generate description'}
            </button>
            {error && <span role="alert" style={{ color: '#b91c1c', fontSize: '.78rem' }}>{error}</span>}
          </div>
          {generatedDraft && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ display: 'grid', gap: '5px', color: '#334155', fontSize: '.78rem', fontWeight: 750 }}>
                Generated draft (you can edit it)
                <textarea rows="4" maxLength="2400" value={generatedDraft} onChange={(event) => setGeneratedDraft(event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', border: '1px solid #b7d8c4', borderRadius: '7px', resize: 'vertical', font: 'inherit', lineHeight: 1.5 }} />
              </label>
              <button type="button" onClick={() => { onUseDraft(generatedDraft); setOpen(false); }} disabled={!generatedDraft.trim()} style={{ justifySelf: 'start', border: '1px solid #166534', borderRadius: '7px', padding: '8px 11px', background: '#fff', color: '#166534', fontWeight: 800, cursor: generatedDraft.trim() ? 'pointer' : 'not-allowed' }}>Use this description</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}