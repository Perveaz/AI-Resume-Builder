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
  { id: 'ai', label: '✨ AI' },
];

const SECTION_MAP = {
  experience: 'experiences',
  education: 'education',
  projects: 'projects',
  certifications: 'certifications',
};

// ── AI Template metadata (mirrors backend TEMPLATES dict) ────────────
const AI_TEMPLATES = {
  student: {
    name: 'Student / Entry-Level',
    description: 'Fresh grads & interns — enthusiastic, achievement-focused',
    icon: '🎓',
  },
  professional: {
    name: 'Mid-Level Professional',
    description: '3–10 years — results-oriented, metrics-driven',
    icon: '💼',
  },
  executive: {
    name: 'Senior / Executive',
    description: '10+ years — strategic, board-level language',
    icon: '🏆',
  },
};

const CONTENT_TYPES = [
  { id: 'summary',    label: 'Professional Summary', placeholder: 'e.g. Software engineer with 5 years React + Node.js experience, focused on SaaS products…' },
  { id: 'experience', label: 'Experience Bullets',   placeholder: 'e.g. Senior Frontend Engineer at Acme Corp — built real-time dashboard, reduced load time by 40%…' },
  { id: 'project',    label: 'Project Description',  placeholder: 'e.g. ResumeForge — full-stack resume builder with Django API and React frontend, used by 300+ users…' },
  { id: 'skills',     label: 'Skills List',          placeholder: 'e.g. Full-stack developer, strong in Python and React, some DevOps exposure with Docker and CI/CD…' },
];

// ── Validation helper ─────────────────────────────────────────────────
function validateGenerated(type, text) {
  if (!text || text.length < 20) return 'Generated content is too short. Try a more detailed context.';
  if (type === 'experience' && !text.includes('•')) return null; // non-blocking
  if (type === 'summary' && text.split(' ').length < 15) return 'Summary seems too brief. Try adding more context.';
  return null; // OK
}

// ── AI Panel component ────────────────────────────────────────────────
function AIPanel() {
  const [contentType, setContentType] = useState('summary');
  const [aiTemplate, setAiTemplate] = useState('professional');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [copied, setCopied] = useState(false);

  const currentPlaceholder = CONTENT_TYPES.find(t => t.id === contentType)?.placeholder || '';

  async function generate() {
    if (!context.trim()) { setError('Please describe what to generate.'); return; }
    setError(''); setWarning(''); setResult(''); setLoading(true);
    try {
      const res = await aiAPI.generate(contentType, context, aiTemplate);
      const text = res.data.content;
      const warn = validateGenerated(contentType, text);
      setResult(text);
      if (warn) setWarning(warn);
    } catch (err) {
      const msg = err.response?.data?.error || 'AI generation failed. Check that MISTRAL_API_KEY is set in backend/.env and Django is restarted.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ paddingBottom: '1.5rem' }}>

      {/* ── AI template selector ── */}
      <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
        Resume Level
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '1.25rem' }}>
        {Object.entries(AI_TEMPLATES).map(([key, tmpl]) => (
          <button key={key}
            onClick={() => setAiTemplate(key)}
            style={{
              border: `2px solid ${aiTemplate === key ? 'var(--primary)' : 'var(--border)'}`,
              background: aiTemplate === key ? 'var(--primary-light)' : 'white',
              borderRadius: 'var(--radius)',
              padding: '10px 6px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{tmpl.icon}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)',
              lineHeight: 1.3, marginBottom: '3px' }}>{tmpl.name}</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
              {tmpl.description}
            </div>
          </button>
        ))}
      </div>

      {/* ── Content type ── */}
      <div className="form-group">
        <label>Generate</label>
        <select value={contentType} onChange={(e) => { setContentType(e.target.value); setResult(''); setError(''); }}>
          {CONTENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* ── Context input ── */}
      <div className="form-group">
        <label>Your context <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(describe yourself / the role / the project)</span></label>
        <textarea
          rows={5}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={currentPlaceholder}
          style={{ lineHeight: 1.6 }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn btn-primary btn-full" onClick={generate} disabled={loading}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Generating…
          </span>
        ) : '✨ Generate with Mistral AI'}
      </button>

      {/* ── Result ── */}
      {result && (
        <div style={{ marginTop: '1.25rem', border: '1.5px solid var(--primary)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary-light)', padding: '8px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ✨ Generated — {AI_TEMPLATES[aiTemplate].name}
            </span>
            <button onClick={copyToClipboard}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          {warning && (
            <div style={{ padding: '6px 14px', background: '#fffbeb',
              borderBottom: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e' }}>
              ⚠ {warning}
            </div>
          )}
          <div style={{ padding: '12px 14px', background: 'white' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, whiteSpace: 'pre-wrap',
              color: 'var(--text)', margin: 0 }}>{result}</p>
          </div>
          <div style={{ padding: '8px 14px', background: 'var(--bg)',
            borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Copy and paste into the relevant field in the form above ↑
          </div>
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
                className={`${styles.tab} ${tab === t.id ? styles.activeTab : ''}`}
                style={t.id === 'ai' && tab !== 'ai' ? { color: 'var(--primary)', fontWeight: 600 } : {}}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.sideContent}>
            {tab === 'basics' && <BasicsForm resume={resume} onSave={saveBasics} />}
            {tab === 'experience' && (
              <SectionEditor label="Experience" items={resume.experiences || []} fields={EXP_FIELDS}
                itemLabel={(i) => `${i.position} at ${i.company}`}
                itemSub={(i) => `${i.start_date}${i.current ? ' – Present' : i.end_date ? ' – ' + i.end_date : ''}`}
                onAdd={(d) => addItem('experiences', d)}
                onUpdate={(iId, d) => updateItem('experiences', iId, d)}
                onDelete={(iId) => deleteItem('experiences', iId)} />
            )}
            {tab === 'education' && (
              <SectionEditor label="Education" items={resume.education || []} fields={EDU_FIELDS}
                itemLabel={(i) => `${i.degree}${i.field ? ' in ' + i.field : ''}`}
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
            {tab === 'ai' && <AIPanel />}
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
