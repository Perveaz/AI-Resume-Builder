import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    profile_picture: null,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({ ...f, profile_picture: file }));
    }
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setForm(f => ({ ...f, profile_picture: null }));
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || user?.username?.[0] || '')).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>← Back</button>
            <div>
              <h1 className={styles.title}>My Profile</h1>
              <p className={styles.sub}>Manage your personal information</p>
            </div>
          </div>

          <div className={styles.profileCard}>
            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarLarge}>{initials || '?'}</div>
              <div>
                <div className={styles.avatarName}>{user?.first_name} {user?.last_name}</div>
                <div className={styles.avatarEmail}>{user?.email}</div>
              </div>
            </div>

            <hr className={styles.divider} />

            {success && <div className="alert alert-success">Profile updated successfully!</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSave}>
              <p className={styles.sectionLabel}>Personal Information</p>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={form.first_name} onChange={set('first_name')} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={form.last_name} onChange={set('last_name')} />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={set('location')} placeholder="City, Country" />
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="A short bio about yourself…" />
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  placeholder="Upload profile picture"
                />
                {form.profile_picture && <p className={styles.fileName}>Selected: {form.profile_picture.name}</p>}
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
