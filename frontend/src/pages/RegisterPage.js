import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs.join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>ResumeForge</h1>
          <p>Build resumes that get you hired</p>
        </div>
        <h2 className={styles.title}>Create your account</h2>
        <p className={styles.sub}>Start building professional resumes in minutes</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First name</label>
              <input value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 8 characters)</span></label>
            <input type="password" value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <input type="password" value={form.password2} onChange={set('password2')} required />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
