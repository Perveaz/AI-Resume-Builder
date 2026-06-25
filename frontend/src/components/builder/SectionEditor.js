import React, { useState } from 'react';
import styles from './BuilderForms.module.css';

function ItemForm({ fields, data, onChange, onSave, onCancel, saveLabel = 'Add' }) {
  return (
    <div className={styles.inlineForm}>
      {fields.map((f) => (
        <div key={f.key} className="form-group">
          {f.type === 'checkbox' ? (
            <div className="checkbox-row">
              <input
                type="checkbox"
                id={`f-${f.key}`}
                checked={!!data[f.key]}
                onChange={(e) => onChange({ ...data, [f.key]: e.target.checked })}
              />
              <label htmlFor={`f-${f.key}`}>{f.label}</label>
            </div>
          ) : f.type === 'textarea' ? (
            <>
              <label>{f.label}</label>
              <textarea
                value={data[f.key] || ''}
                onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                rows={3}
                placeholder={f.placeholder || ''}
              />
            </>
          ) : (
            <>
              <label>{f.label}{f.required && ' *'}</label>
              <input
                value={data[f.key] || ''}
                onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                placeholder={f.placeholder || ''}
              />
            </>
          )}
        </div>
      ))}
      <div className={styles.formActions}>
        <button className="btn btn-primary btn-sm" onClick={onSave}>{saveLabel}</button>
        <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function SectionEditor({ label, items, fields, itemLabel, itemSub, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  function startEdit(item) {
    setEditingId(item.id);
    setEditData({ ...item });
    setAdding(false);
  }

  async function handleAdd() {
    await onAdd(newData);
    setAdding(false);
    setNewData({});
  }

  async function handleUpdate() {
    await onUpdate(editingId, editData);
    setEditingId(null);
    setEditData({});
  }

  return (
    <div>
      <p className={styles.sectionLabel}>{label}</p>

      {items.map((item) =>
        editingId === item.id ? (
          <ItemForm
            key={item.id}
            fields={fields}
            data={editData}
            onChange={setEditData}
            onSave={handleUpdate}
            onCancel={() => setEditingId(null)}
            saveLabel="Update"
          />
        ) : (
          <div key={item.id} className={styles.itemCard}>
            <div className={styles.itemCardMain}>
              <div className={styles.itemTitle}>{itemLabel(item)}</div>
              {itemSub(item) && <div className={styles.itemSub}>{itemSub(item)}</div>}
            </div>
            <div className={styles.itemBtns}>
              <button className={styles.iconBtn} onClick={() => startEdit(item)} title="Edit">✏️</button>
              <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(item.id)} title="Delete">🗑️</button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <ItemForm
          fields={fields}
          data={newData}
          onChange={setNewData}
          onSave={handleAdd}
          onCancel={() => { setAdding(false); setNewData({}); }}
        />
      ) : (
        <button className={styles.addBtn} onClick={() => { setAdding(true); setNewData({}); setEditingId(null); }}>
          + Add {label}
        </button>
      )}
    </div>
  );
}
