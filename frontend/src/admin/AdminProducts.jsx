import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/format';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts({ search, category, limit: 50 }),
        api.getAdminCategories()
      ]);

      if (prodRes.success) setProducts(prodRes.data.products);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      setError(err.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to disable (soft delete) this product?')) return;
    try {
      await api.deleteAdminProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Could not disable product');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Product Catalog Management</h3>
          <p className="text-muted small mb-0">Create, edit, and manage store product inventory</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary fw-semibold shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

      {loading ? (
        <Loading message="Loading catalog..." />
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover small">
              <thead className="table-light text-uppercase">
                <tr>
                  <th className="ps-3">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '42px', height: '42px' }} className="rounded bg-light overflow-hidden border">
                          <img
                            src={p.image || '/uploads/products/placeholder.svg'}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                          />
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: '200px' }}>
                            {p.name}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>ID: #{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category_name}</td>
                    <td className="text-muted">{formatPrice(p.price)}</td>
                    <td>
                      {p.discount > 0 ? (
                        <span className="badge bg-danger-subtle text-danger">-{Number(p.discount)}%</span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td className="fw-bold text-primary">{formatPrice(p.final_price)}</td>
                    <td>
                      <span className={`badge ${p.stock <= 0 ? 'bg-danger' : p.stock <= 5 ? 'bg-warning text-dark' : 'bg-success-subtle text-success'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {p.status === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/admin/products/edit/${p.id}`} className="btn btn-outline-primary" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        {p.status === 1 && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeactivate(p.id)}
                            title="Disable (Soft Delete)"
                          >
                            <i className="bi bi-slash-circle"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No products found matching query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
