import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

export default function CrudPage({
  resource,
  title,
  icon,
  columns,
  formFields,
  renderDetail,
  defaultValues = {},
  aiFeature,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadData();
    if (resource !== 'patients') {
      api.getAll('patients').then(setPatients).catch(() => {});
    }
  }, [resource]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAll(resource);
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const handleNew = () => {
    setEditItem(null);
    setFormData({ ...defaultValues });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const data = {};
    formFields.forEach(f => {
      let val = item[f.key];
      if (f.type === 'date' && val) val = val.split('T')[0];
      if (f.type === 'datetime-local' && val) val = val.slice(0, 16);
      data[f.key] = val || '';
    });
    setFormData(data);
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleDelete = async (item) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(resource, item.id);
      setItems(items.filter(i => i.id !== item.id));
      setSelectedItem(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const updated = await api.update(resource, editItem.id, formData);
        setItems(items.map(i => i.id === editItem.id ? updated : i));
      } else {
        const created = await api.create(resource, formData);
        setItems([created, ...items]);
      }
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getBadgeClass = (value) => {
    if (!value) return 'badge';
    const v = value.toLowerCase();
    if (['active', 'completed', 'paid'].includes(v)) return 'badge badge-active';
    if (['critical'].includes(v)) return 'badge badge-critical';
    if (['high'].includes(v)) return 'badge badge-high';
    if (['medium', 'monitoring', 'pending', 'scheduled'].includes(v)) return 'badge badge-medium';
    if (['low'].includes(v)) return 'badge badge-low';
    if (['overdue'].includes(v)) return 'badge badge-overdue';
    if (['inactive', 'cancelled'].includes(v)) return 'badge badge-inactive';
    return 'badge badge-medium';
  };

  const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  // Detail View
  if (selectedItem) {
    return (
      <div>
        <button className="back-link" onClick={() => setSelectedItem(null)}>
          ← Back to {title}
        </button>
        <div className="detail-card">
          <div className="detail-header">
            <h2>{icon} {title} Detail #{selectedItem.id}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedItem)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem)}>Delete</button>
            </div>
          </div>
          <div className="detail-body">
            {renderDetail ? renderDetail(selectedItem, { patients, api, loadData }) : (
              <div className="detail-grid">
                {Object.entries(selectedItem).map(([key, val]) => (
                  <div key={key} className="detail-item">
                    <div className="label">{key.replace(/_/g, ' ')}</div>
                    <div className="value">
                      {key.includes('status') || key.includes('severity') ? (
                        <span className={getBadgeClass(String(val))}>{String(val)}</span>
                      ) : key.includes('date') || key.includes('_at') ? (
                        formatDateTime(val)
                      ) : (
                        String(val ?? '-')
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {aiFeature && selectedItem && (
          <div style={{ marginTop: '20px' }}>
            {aiFeature(selectedItem)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="data-table-container">
        <div className="table-header">
          <h2>{icon} {title} ({items.length})</h2>
          <button className="btn btn-primary" onClick={handleNew}>+ New {title.replace(/s$/, '')}</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>No records found</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} onClick={() => handleRowClick(item)}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(item[col.key], item) :
                         col.badge ? <span className={getBadgeClass(String(item[col.key]))}>{item[col.key]}</span> :
                         col.date ? formatDate(item[col.key]) :
                         col.datetime ? formatDateTime(item[col.key]) :
                         String(item[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal
          title={editItem ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editItem ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            {formFields.map(field => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="form-control"
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
                    ))}
                  </select>
                ) : field.type === 'patient_select' ? (
                  <select
                    className="form-control"
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select Patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="form-control"
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="form-control"
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    step={field.step}
                  />
                )}
              </div>
            ))}
          </form>
        </Modal>
      )}
    </div>
  );
}
