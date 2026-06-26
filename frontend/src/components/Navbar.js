import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  }

  // Derive initials: first letter of first + last name, or first letter of username
  function getInitials() {
    if (!user) return '?';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    if (first || last) return (first + last).toUpperCase();
    return (user.username?.[0] || '?').toUpperCase();
  }

  const displayName = user?.first_name
    ? user.first_name + (user.last_name ? ' ' + user.last_name : '')
    : user?.username || '';

  return (
    <nav className={styles.nav}>
      {/* ── Brand / Logo ── */}
      <Link to="/" className={styles.brand}>
        ResumeForge
      </Link>

      {/* ── Right side ── */}
      <div className={styles.right}>
        {user && (
          <div className={styles.userMenu} ref={menuRef}>
            <button
              className={styles.userBtn}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              {/* Avatar circle with initials */}
              <span className={styles.avatar} aria-hidden="true">
                {getInitials()}
              </span>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <div style={{
                  padding: '10px 16px 8px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '4px',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {user.email}
                  </div>
                </div>

                <Link
                  to="/profile"
                  className={styles.dropItem}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  ⚙ Profile settings
                </Link>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                <button
                  className={`${styles.dropItem} ${styles.dropLogout}`}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  ↩ Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
