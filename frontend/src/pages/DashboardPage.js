import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

const TEMPLATE_COLORS = {
  modern: 'linear-gradient(135deg, #1e1b4b 40%, #6366f1 100%)',
  classic: 'linear-gradient(135deg, #374151 40%, #9ca3af 100%)',
  minimal: 'linear-gradient(135deg, #0c4a6e 40%, #06b6d4 100%)',
};

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    resumeAPI.list()
      .then((res) => setResumes(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function createResume() {
    setCreating(true);
    try {
      const res = await resumeAPI.create({ title: 'New Resume', template: 'modern' });
      navigate(`/builder/${res.data.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteResume(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this resume permanently?')) return;
    setDeleting(id);
    await resumeAPI.delete(id);
    setResumes((r) => r.filter((x) => x.id !== id));
    setDeleting(null);
  }

  const firstName = user?.first_name || user?.username || 'there';
  const now = new Date().getHours();
  const greeting = now < 12 ? 'Good morning' : now < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        {/* Hero greeting */}
        <div className={styles.hero}>
          <h1>{greeting}, {firstName} 👋</h1>
          <p>Manage your resumes and craft the perfect application.</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Resumes</span>
              <span className={styles.statValue} style={{ color: 'var(--primary)' }}>{resumes.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Last Updated</span>
              <span className={styles.statValue} style={{ fontSize: '1rem', marginTop: '8px', color: 'var(--text)' }}>
                {resumes[0] ? new Date(resumes[0].updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Templates Used</span>
              <span className={styles.statValue} style={{ color: 'var(--accent)' }}>
                {[...new Set(resumes.map((r) => r.template))].length || 0}
              </span>
            </div>
          </div>
        )}

        {/* Resumes section */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>My Resumes</h2>
            <p className={styles.sectionSub}>Click any resume to edit or preview it</p>
          </div>
          <button className="btn btn-primary" onClick={createResume} disabled={creating}>
            {creating ? 'Creating…' : '+ New Resume'}
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className="spinner"></div>
            <p>Loading your resumes…</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3>No resumes yet</h3>
            <p>Create your first resume and start applying with confidence.</p>
            <button className="btn btn-primary" onClick={createResume} disabled={creating}>
              {creating ? 'Creating…' : 'Create my first resume'}
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* New resume card */}
            <div className={styles.newCard} onClick={createResume}>
              <div className={styles.newIcon}>+</div>
              <p>New Resume</p>
            </div>
            {resumes.map((r) => (
              <div key={r.id} className={styles.resumeCard} onClick={() => navigate(`/builder/${r.id}`)}>
                <div
                  className={styles.cardThumb}
                  style={{ background: TEMPLATE_COLORS[r.template] || TEMPLATE_COLORS.modern }}
                >
                  <span className={styles.thumbLabel}>{r.template}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{r.title}</div>
                  <div className={styles.cardName}>{r.full_name || 'Name not set'}</div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>
                      Updated {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/builder/${r.id}`); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deleting === r.id}
                    onClick={(e) => deleteResume(e, r.id)}
                  >
                    {deleting === r.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
