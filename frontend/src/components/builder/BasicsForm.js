import React, { useState, useEffect } from 'react';
import styles from './BuilderForms.module.css';

export default function BasicsForm({ resume, onSave }) {
  const [form, setForm] = useState({
    title: '', full_name: '', email: '', phone: '',
    location: '', linkedin: '', github: '', website: '', summary: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      title: resume.title || '',
      full_name: resume.full_name || '',
      email: resume.email || '',
      phone: resume.phone || '',
      location: resume.location || '',
      linkedin: resume.linkedin || '',
      github: resume.github || '',
      website: resume.website || '',
      summary: resume.summary || '',
    });
  }, [resume.id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div>
      <p className={styles.sectionLabel}>Basic Information</p>

      <div className="form-group">
        <label>Resume Title</label>
        <input value={form.title} onChange={set('title')} placeholder="e.g. Software Engineer Resume" />
      </div>

      <div className="form-group">
        <label>Full Name</label>
        <input value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
        </div>
      </div>

      <div className="form-group">
        <label>Location</label>
        <input value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
      </div>

      <div className="form-group">
        <label>LinkedIn URL</label>
        <input value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/..." />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>GitHub URL</label>
          <input value={form.github} onChange={set('github')} />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input value={form.website} onChange={set('website')} />
        </div>
      </div>

      <div className="form-group">
        <label>Professional Summary</label>
        <textarea
          value={form.summary}
          onChange={set('summary')}
          rows={4}
          placeholder="A brief summary of your experience and goals…"
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}
