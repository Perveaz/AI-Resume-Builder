import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI, sectionAPI, aiAPI } from '../utils/api';
import ResumePreview from '../components/ResumePreview';
import BasicsForm from '../components/builder/BasicsForm';
import SectionEditor from '../components/builder/SectionEditor';
import SkillsEditor from '../components/builder/SkillsEditor';
import TemplateSelector from '../components/builder/TemplateSelector';
import styles from './BuilderPage.module.css';

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certs' },
  { id: 'template', label: 'Template' },
];

const SECTION_MAP = {
  experience: 'experiences',
  education: 'education',
  projects: 'projects',
  certifications: 'certifications',
};

// ── AI Generate Panel ─────────────────────────────────────────────────
function AIPanel({ resumeTitle, onInsert }) {
  const [type, setType] = useState('summary');
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (!context.trim()) { setError('Please describe what to generate.'); return; }
    setError(''); setLoading(true); setResult('');
    try {
      const res = await aiAPI.generate(type, context, tone);
      setResult(res.data.content);
    } catch (err) {
      const msg = err.response?.data?.error || 'AI generation failed. Check MISTRAL_API_KEY.';
      setError(msg);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: '0 0 1rem 0' }}>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Generate AI content using Mistral AI. Set <code>MISTRAL_API_KEY</code> in your environment.
      </p>
      <div className="form-group">
        <label>Content Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <option value="summary">Professional Summary</option>
          <option value="experience">Experience Bullets</option>
          <option value="project">Project Description</option>
        </select>
      </div>
      <div className="form-group">
        <label>Tone</label>
        <select value={tone} onChange={(e) => setTone(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <option value="professional">Professional</option>
          <option value="creative">Creative</option>
          <option value="concise">Concise</option>
          <option value="enthusiastic">Enthusiastic</option>
        </select>
      </div>
      <div className="form-group">
        <label>Context / Description</label>
        <textarea
          rows={4}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={type === 'summary' ? 'e.g. Software engineer with 5 years React experience...' :
            type === 'experience' ? 'e.g. Senior Frontend Developer at Acme Corp, built dashboard...' :
            'e.g. ResumeForge – full-stack resume builder using Django and React...'}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)',
            fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }}
        />
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
      <button className="btn btn-primary btn-full" onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : '✨ Generate'}
      </button>
      {result && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface)',
          borderRadius: '8px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Content</p>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{result}</p>
          {onInsert && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}
              onClick={() => onInsert(result)}>
              Copy to clipboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main BuilderPage ──────────────────────────────────────────────────
export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [tab, setTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    resumeAPI.get(id).then((res) => setResume(res.data));
  }, [id]);

  async function saveBasics(data) {
    setSaving(true);
    const res = await resumeAPI.update(id, data);
    setResume((r) => ({ ...r, ...res.data }));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addItem(section, data) {
    const apiSection = SECTION_MAP[tab] || section;
    const res = await sectionAPI.add(id, apiSection, data);
    setResume((r) => ({ ...r, [apiSection]: [...(r[apiSection] || []), res.data] }));
  }

  async function updateItem(section, itemId, data) {
    const res = await sectionAPI.update(id, section, itemId, data);
    setResume((r) => ({ ...r, [section]: r[section].map((x) => (x.id === itemId ? res.data : x)) }));
  }

  async function deleteItem(section, itemId) {
    if (!window.confirm('Remove this item?')) return;
    await sectionAPI.delete(id, section, itemId);
    setResume((r) => ({ ...r, [section]: r[section].filter((x) => x.id !== itemId) }));
  }

  if (!resume) return (
    <div className="loading-page">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading resume…</p>
    </div>
  );

  return (
    <div className={styles.layout}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>← Back</button>
          <span className={styles.topLogo}>ResumeForge</span>
          <span className={styles.resumeTitle}>{resume.title}</span>
        </div>
        <div className={styles.topRight}>
          {saved && <span className="badge badge-green">✓ Saved</span>}
          {saving && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saving…</span>}
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button key={t.id}
                className={styles.tab + (tab === t.id ? ' ' + styles.activeTab : '')}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
            <button
              className={styles.tab + (tab === 'ai' ? ' ' + styles.activeTab : '')}
              onClick={() => setTab('ai')}
              style={{ color: tab === 'ai' ? undefined : 'var(--accent)' }}>
              ✨ AI
            </button>
          </div>

          <div className={styles.sideContent}>
            {tab === 'basics' && <BasicsForm resume={resume} onSave={saveBasics} />}
            {tab === 'experience' && (
              <SectionEditor label="Experience" items={resume.experiences || []} fields={EXP_FIELDS}
                itemLabel={(i) => i.position + ' at ' + i.company}
                itemSub={(i) => i.start_date + (i.current ? ' – Present' : i.end_date ? ' – ' + i.end_date : '')}
                onAdd={(d) => addItem('experiences', d)}
                onUpdate={(iId, d) => updateItem('experiences', iId, d)}
                onDelete={(iId) => deleteItem('experiences', iId)} />
            )}
            {tab === 'education' && (
              <SectionEditor label="Education" items={resume.education || []} fields={EDU_FIELDS}
                itemLabel={(i) => i.degree + (i.field ? ' in ' + i.field : '')}
                itemSub={(i) => i.institution}
                onAdd={(d) => addItem('education', d)}
                onUpdate={(iId, d) => updateItem('education', iId, d)}
                onDelete={(iId) => deleteItem('education', iId)} />
            )}
            {tab === 'skills' && (
              <SkillsEditor skills={resume.skills || []}
                onAdd={(d) => addItem('skills', d)}
                onDelete={(iId) => deleteItem('skills', iId)} />
            )}
            {tab === 'projects' && (
              <SectionEditor label="Projects" items={resume.projects || []} fields={PROJ_FIELDS}
                itemLabel={(i) => i.name} itemSub={(i) => i.technologies}
                onAdd={(d) => addItem('projects', d)}
                onUpdate={(iId, d) => updateItem('projects', iId, d)}
                onDelete={(iId) => deleteItem('projects', iId)} />
            )}
            {tab === 'certifications' && (
              <SectionEditor label="Certification" items={resume.certifications || []} fields={CERT_FIELDS}
                itemLabel={(i) => i.name} itemSub={(i) => i.issuer}
                onAdd={(d) => addItem('certifications', d)}
                onUpdate={(iId, d) => updateItem('certifications', iId, d)}
                onDelete={(iId) => deleteItem('certifications', iId)} />
            )}
            {tab === 'template' && (
              <TemplateSelector current={resume.template} onSave={(t) => saveBasics({ template: t })} />
            )}
            {tab === 'ai' && (
              <AIPanel resumeTitle={resume.title} onInsert={(text) => {
                navigator.clipboard.writeText(text).catch(() => {});
              }} />
            )}
          </div>
        </aside>

        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h3>Live Preview</h3>
            <span className="badge badge-purple">Template: {resume.template}</span>
          </div>
          <div className={styles.previewScroll}>
            <div className={styles.paper}>
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EXP_FIELDS = [
  { key: 'position', label: 'Job Title', required: true },
  { key: 'company', label: 'Company', required: true },
  { key: 'location', label: 'Location' },
  { key: 'start_date', label: 'Start Date', placeholder: 'e.g. Jan 2020' },
  { key: 'end_date', label: 'End Date', placeholder: 'e.g. Dec 2022' },
  { key: 'current', label: 'Currently working here', type: 'checkbox' },
  { key: 'description', label: 'Description', type: 'textarea' },
];
const EDU_FIELDS = [
  { key: 'institution', label: 'Institution', required: true },
  { key: 'degree', label: 'Degree', required: true },
  { key: 'field', label: 'Field of Study' },
  { key: 'location', label: 'Location' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'current', label: 'Currently enrolled', type: 'checkbox' },
  { key: 'gpa', label: 'GPA' },
  { key: 'description', label: 'Notes', type: 'textarea' },
];
const PROJ_FIELDS = [
  { key: 'name', label: 'Project Name', required: true },
  { key: 'technologies', label: 'Technologies', placeholder: 'e.g. React, Node.js, PostgreSQL' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'url', label: 'Live URL' },
  { key: 'github_url', label: 'GitHub URL' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
];
const CERT_FIELDS = [
  { key: 'name', label: 'Certification Name', required: true },
  { key: 'issuer', label: 'Issuing Organization' },
  { key: 'date', label: 'Issue Date' },
  { key: 'expiry', label: 'Expiry Date' },
  { key: 'credential_id', label: 'Credential ID' },
  { key: 'url', label: 'Credential URL' },
];
