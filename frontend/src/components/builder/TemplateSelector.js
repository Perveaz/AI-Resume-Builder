import React, { useState } from 'react';
import styles from './BuilderForms.module.css';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with indigo header',
    colors: ['#1e1b4b', '#6366f1', '#f8f7ff'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional centered header, clean lines',
    colors: ['#ffffff', '#111827', '#f3f4f6'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Teal accent strip, open whitespace',
    colors: ['#f0fdfe', '#06b6d4', '#0c4a6e'],
  },
];

export default function TemplateSelector({ current, onSave }) {
  const [selected, setSelected] = useState(current || 'modern');
  const [saving, setSaving] = useState(false);

  async function handleApply() {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
  }

  return (
    <div>
      <p className={styles.sectionLabel}>Choose a Template</p>
      <div className={styles.templateGrid}>
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`${styles.templateOpt} ${selected === t.id ? styles.templateSelected : ''}`}
            onClick={() => setSelected(t.id)}
          >
            <div
              className={styles.templateThumb}
              style={{ background: `linear-gradient(135deg, ${t.colors[0]} 40%, ${t.colors[1]} 100%)` }}
            >
              {selected === t.id && <span className={styles.templateCheck}>✓</span>}
            </div>
            <div className={styles.templateName}>{t.name}</div>
            <div className={styles.templateDesc}>{t.description}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-full" style={{ marginTop: '1.25rem' }} onClick={handleApply} disabled={saving}>
        {saving ? 'Applying…' : 'Apply Template'}
      </button>
    </div>
  );
}
