import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
      <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</button>
      <span style={{ lineHeight: '32px', fontSize: '14px' }}>Page {page} of {totalPages}</span>
      <button className="btn btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}

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
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async (page = 1, searchVal = search) => {
    setLoading(true);
    try {
      const res = await api.getAll(resource, { page, limit: 20, ...(searchVal ? { search: searchVal } : {}) });
      // Handle both paginated and non-paginated responses
      if (res && res.data) {
        setItems(res.data);
        setPagination({ page: res.pagination?.page || 1, totalPages: res.pagination?.totalPages || 1, total: res.pagination?.total || res.data.length });
      } else if (Array.isArray(res)) {
        setItems(res);
        setPagination({ page: 1, totalPages: 1, total: res.length });
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    loadData(1);
    if (resource !== 'patients') {
      api.getAll('patients', { limit: 200 }).then(res => {
        setPatients(Array.isArray(res) ? res : (res?.data || []));
      }).catch(() => {});
    }
  }, [resource]);

  const handlePageChange = (page) => {
    setPagination(p => ({ ...p, page }));
    loadData(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData(1, search);
  };

  const handleRowClick = (item) => setSelectedItem(item);

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
      loadData(pagination.page);
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
        await api.create(resource, formData);
        loadData(1);
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
          <h2>{icon} {title} ({pagination.total})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '4px' }}>
              <input
                className="form-control"
                style={{ width: '200px', padding: '6px 10px', fontSize: '13px' }}
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>
            <button className="btn btn-primary" onClick={handleNew}>+ New {title.replace(/s$/, '')}</button>
          </div>
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
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
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
