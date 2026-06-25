import React, { useState } from 'react';
import styles from './BuilderForms.module.css';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function SkillsEditor({ skills, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', level: 'intermediate' });

  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  async function handleAdd() {
    if (!form.name.trim()) return;
    await onAdd(form);
    setAdding(false);
    setForm({ name: '', category: '', level: 'intermediate' });
  }

  return (
    <div>
      <p className={styles.sectionLabel}>Skills</p>

      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} style={{ marginBottom: '1rem' }}>
          <div className={styles.catLabel}>{cat}</div>
          <div className={styles.tagRow}>
            {catSkills.map((s) => (
              <span key={s.id} className={styles.skillTag}>
                {s.name}
                <span className={styles.skillLevel}>{s.level}</span>
                <button className={styles.tagRemove} onClick={() => onDelete(s.id)}>✕</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {adding ? (
        <div className={styles.inlineForm}>
          <div className="form-group">
            <label>Skill Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. React, Python, Figma" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Programming, Design, Tools" />
          </div>
          <div className="form-group">
            <label>Proficiency Level</label>
            <div className={styles.levelSelector}>
              {LEVELS.map((l) => (
                <button
                  key={l}
                  className={`${styles.levelOpt} ${form.level === l ? styles.levelActive : ''}`}
                  onClick={() => setForm((f) => ({ ...f, level: l }))}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add Skill</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setAdding(false); setForm({ name: '', category: '', level: 'intermediate' }); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setAdding(true)}>+ Add Skill</button>
      )}
    </div>
  );
}
