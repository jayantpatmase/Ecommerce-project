import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminCustomers({ search });
      if (res.success) {
        setCustomers(res.data.customers);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load customer accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Customer Management</h3>
          <p className="text-muted small mb-0">Review registered accounts, purchase statistics, and order volumes</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2">
          <div className="col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCustomers} />}

      {loading ? (
        <Loading message="Loading customer accounts..." />
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover small">
              <thead className="table-light text-uppercase">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Default Address</th>
                  <th className="text-center">Orders</th>
                  <th className="text-end">Total Spent</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-3 fw-bold text-dark">#{c.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{c.name}</div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{c.email}</span>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td className="text-muted text-truncate" style={{ maxWidth: '220px' }}>
                      {c.address || '—'}
                    </td>
                    <td className="text-center fw-semibold">
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                        {c.total_orders} orders
                      </span>
                    </td>
                    <td className="text-end fw-bold text-primary">
                      ${Number(c.total_spent).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {c.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No customer records found.</td>
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
