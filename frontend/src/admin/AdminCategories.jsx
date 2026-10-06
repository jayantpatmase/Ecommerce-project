import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 1 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminCategories();
      if (res.success) {
        setCategories(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', status: 1 });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description || '', status: cat.status });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError(null);

      if (editingCategory) {
        await api.updateCategory({ id: editingCategory.id, ...form });
      } else {
        await api.createCategory(form);
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === 1 ? 0 : 1;
    try {
      await api.updateCategory({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        status: newStatus
      });
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Could not update status');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Category Management</h3>
          <p className="text-muted small mb-0">Organize and structure store products into distinct departments</p>
        </div>
        <button className="btn btn-primary fw-semibold shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {loading ? (
        <Loading message="Loading categories..." />
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover small">
              <thead className="table-light text-uppercase">
                <tr>
                  <th className="ps-3">Category Name</th>
                  <th>Description</th>
                  <th className="text-center">Products Count</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-3 fw-bold text-dark">{c.name}</td>
                    <td className="text-muted">{c.description || '—'}</td>
                    <td className="text-center">
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                        {c.product_count} items
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {c.status === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => handleOpenEdit(c)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn ${c.status === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(c)}
                          title={c.status === 1 ? 'Disable' : 'Enable'}
                        >
                          <i className={`bi ${c.status === 1 ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog for Category Form */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                      {formError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="catStatusSwitch"
                      checked={Number(form.status) === 1}
                      onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                    />
                    <label className="form-check-label" htmlFor="catStatusSwitch">
                      Category Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
