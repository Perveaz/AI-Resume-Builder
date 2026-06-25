import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>ResumeForge</Link>
      <div className={styles.right}>
        {user && (
          <div className={styles.userMenu}>
            <button
              className={styles.userBtn}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              <span className={styles.avatar}>
                {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
              </span>
              <span className={styles.userName}>{user.first_name || user.username}</span>
              <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <Link to="/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button className={styles.dropItem + ' ' + styles.dropLogout} onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
