import React from 'react';
import styles from './ResumePreview.module.css';

function skillWidth(level) {
  const map = { beginner: 25, intermediate: 55, advanced: 80, expert: 100 };
  return map[level] || 55;
}

function ContactRow({ items }) {
  const filtered = items.filter(Boolean);
  return (
    <div className={styles.contactRow}>
      {filtered.map((item, i) => (
        <span key={i} className={styles.contactItem}>{item}</span>
      ))}
    </div>
  );
}

// ── Modern Template ────────────────────────────────────────────────────
function ModernTemplate({ resume }) {
  const exps = resume.experiences || [];
  const edus = resume.education || [];
  const skills = resume.skills || [];
  const projs = resume.projects || [];
  const certs = resume.certifications || [];

  return (
    <div className={styles.modern}>
      <div className={styles.modernHeader}>
        <div className={styles.modernName}>{resume.full_name || 'Your Name'}</div>
        <ContactRow items={[resume.email, resume.phone, resume.location, resume.linkedin && 'LinkedIn', resume.github && 'GitHub', resume.website && 'Website']} />
      </div>
      <div className={styles.modernBody}>
        <aside className={styles.modernSide}>
          {skills.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Skills</h3>
              {skills.map((s) => (
                <div key={s.id} className={styles.skillRow}>
                  <span className={styles.skillName}>{s.name}</span>
                  <div className={styles.skillBar}>
                    <div className={styles.skillFill} style={{ width: `${skillWidth(s.level)}%` }} />
                  </div>
                </div>
              ))}
            </section>
          )}
          {edus.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Education</h3>
              {edus.map((e) => (
                <div key={e.id} className={styles.eduItem}>
                  <div className={styles.eduDegree}>{e.degree}{e.field && ` in ${e.field}`}</div>
                  <div className={styles.eduSchool}>{e.institution}</div>
                  <div className={styles.eduDate}>
                    {e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}
                    {e.gpa && ` · GPA ${e.gpa}`}
                  </div>
                </div>
              ))}
            </section>
          )}
          {certs.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Certifications</h3>
              {certs.map((c) => (
                <div key={c.id} className={styles.certItem}>
                  <div className={styles.certName}>{c.name}</div>
                  <div className={styles.certIssuer}>{c.issuer}{c.date && ` · ${c.date}`}</div>
                </div>
              ))}
            </section>
          )}
        </aside>
        <main className={styles.modernMain}>
          {resume.summary && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Summary</h3>
              <p className={styles.summary}>{resume.summary}</p>
            </section>
          )}
          {exps.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Experience</h3>
              {exps.map((e) => (
                <div key={e.id} className={styles.expItem}>
                  <div className={styles.expRole}>{e.position}</div>
                  <div className={styles.expCompany}>{e.company}</div>
                  <div className={styles.expMeta}>
                    <span>{e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}</span>
                    {e.location && <span>· {e.location}</span>}
                  </div>
                  {e.description && <p className={styles.expDesc}>{e.description}</p>}
                </div>
              ))}
            </section>
          )}
          {projs.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.modernSectionTitle}>Projects</h3>
              {projs.map((p) => (
                <div key={p.id} className={styles.projItem}>
                  <div className={styles.projName}>{p.name}</div>
                  {p.technologies && <div className={styles.projTech}>{p.technologies}</div>}
                  {p.description && <p className={styles.projDesc}>{p.description}</p>}
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Classic Template ───────────────────────────────────────────────────
function ClassicTemplate({ resume }) {
  const exps = resume.experiences || [];
  const edus = resume.education || [];
  const skills = resume.skills || [];
  const projs = resume.projects || [];
  const certs = resume.certifications || [];

  return (
    <div className={styles.classic}>
      <div className={styles.classicHeader}>
        <div className={styles.classicName}>{resume.full_name || 'Your Name'}</div>
        <div className={styles.classicContact}>
          {[resume.email, resume.phone, resume.location, resume.linkedin && 'LinkedIn'].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className={styles.classicBody}>
        {resume.summary && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Summary</h3>
            <p className={styles.classicText}>{resume.summary}</p>
          </section>
        )}
        {exps.length > 0 && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Experience</h3>
            {exps.map((e) => (
              <div key={e.id} className={styles.classicItem}>
                <div className={styles.classicItemRow}>
                  <span className={styles.classicRole}>{e.position}</span>
                  <span className={styles.classicDate}>{e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}</span>
                </div>
                <div className={styles.classicCompany}>{e.company}{e.location && `, ${e.location}`}</div>
                {e.description && <p className={styles.classicText} style={{ marginTop: '4px' }}>{e.description}</p>}
              </div>
            ))}
          </section>
        )}
        {edus.length > 0 && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Education</h3>
            {edus.map((e) => (
              <div key={e.id} className={styles.classicItem}>
                <div className={styles.classicItemRow}>
                  <span className={styles.classicRole}>{e.degree}{e.field && ` in ${e.field}`}</span>
                  <span className={styles.classicDate}>{e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}</span>
                </div>
                <div className={styles.classicCompany}>{e.institution}</div>
              </div>
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Skills</h3>
            <div className={styles.classicSkills}>
              {skills.map((s) => <span key={s.id} className={styles.classicSkillTag}>{s.name}</span>)}
            </div>
          </section>
        )}
        {projs.length > 0 && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Projects</h3>
            {projs.map((p) => (
              <div key={p.id} className={styles.classicItem}>
                <div className={styles.classicRole}>{p.name}</div>
                {p.technologies && <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: '2px' }}>{p.technologies}</div>}
                {p.description && <p className={styles.classicText}>{p.description}</p>}
              </div>
            ))}
          </section>
        )}
        {certs.length > 0 && (
          <section className={styles.classicSection}>
            <h3 className={styles.classicSectionTitle}>Certifications</h3>
            {certs.map((c) => (
              <div key={c.id} className={styles.classicItem} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span className={styles.classicRole}>{c.name}</span>
                  {c.issuer && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}> · {c.issuer}</span>}
                </div>
                {c.date && <span className={styles.classicDate}>{c.date}</span>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ── Minimal Template ───────────────────────────────────────────────────
function MinimalTemplate({ resume }) {
  const exps = resume.experiences || [];
  const edus = resume.education || [];
  const skills = resume.skills || [];
  const projs = resume.projects || [];
  const certs = resume.certifications || [];

  return (
    <div className={styles.minimal}>
      <div className={styles.minimalHeader}>
        <div className={styles.minimalName}>{resume.full_name || 'Your Name'}</div>
        <div className={styles.minimalContact}>
          {[resume.email, resume.phone, resume.location, resume.linkedin && 'LinkedIn', resume.github && 'GitHub'].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className={styles.minimalBody}>
        {resume.summary && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Summary</h3>
            <p className={styles.minimalText}>{resume.summary}</p>
          </section>
        )}
        {exps.length > 0 && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Experience</h3>
            {exps.map((e) => (
              <div key={e.id} className={styles.minimalItem}>
                <div className={styles.minimalRole}>{e.position}</div>
                <div className={styles.minimalCompany}>{e.company}</div>
                <div className={styles.minimalMeta}>{e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}{e.location && ` · ${e.location}`}</div>
                {e.description && <p className={styles.minimalText}>{e.description}</p>}
              </div>
            ))}
          </section>
        )}
        {edus.length > 0 && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Education</h3>
            {edus.map((e) => (
              <div key={e.id} className={styles.minimalItem}>
                <div className={styles.minimalRole}>{e.degree}{e.field && ` in ${e.field}`}</div>
                <div className={styles.minimalCompany}>{e.institution}</div>
                <div className={styles.minimalMeta}>{e.start_date}{e.current ? ' – Present' : e.end_date ? ` – ${e.end_date}` : ''}</div>
              </div>
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Skills</h3>
            <div>{skills.map((s) => <span key={s.id} className={styles.minimalSkill}>{s.name}</span>)}</div>
          </section>
        )}
        {projs.length > 0 && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Projects</h3>
            {projs.map((p) => (
              <div key={p.id} className={styles.minimalItem}>
                <div className={styles.minimalRole}>{p.name}</div>
                {p.technologies && <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 500, marginBottom: '3px' }}>{p.technologies}</div>}
                {p.description && <p className={styles.minimalText}>{p.description}</p>}
              </div>
            ))}
          </section>
        )}
        {certs.length > 0 && (
          <section className={styles.minimalSection}>
            <h3 className={styles.minimalSectionTitle}>Certifications</h3>
            {certs.map((c) => (
              <div key={c.id} className={styles.minimalItem}>
                <div className={styles.minimalRole}>{c.name}</div>
                {c.issuer && <div className={styles.minimalCompany}>{c.issuer}{c.date && ` · ${c.date}`}</div>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────
export default function ResumePreview({ resume }) {
  if (resume.template === 'classic') return <ClassicTemplate resume={resume} />;
  if (resume.template === 'minimal') return <MinimalTemplate resume={resume} />;
  return <ModernTemplate resume={resume} />;
}
