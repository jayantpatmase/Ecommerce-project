import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminDashboard();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading message="Loading dashboard statistics..." />;
  if (error || !data) return <ErrorMessage message={error || 'Dashboard unavailable'} onRetry={fetchDashboard} />;

  const stats = data.stats || {};
  const recentOrders = data.recent_orders || [];
  const lowStock = data.low_stock_products || [];
  const recentCustomers = data.recent_customers || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Store Dashboard</h3>
          <p className="text-muted small mb-0">Real-time overview of store operations and sales</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Total Sales */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Total Revenue</span>
                <h3 className="fw-extrabold text-success mt-1 mb-0">${stats.total_sales?.toFixed(2)}</h3>
              </div>
              <div className="stat-icon bg-success-subtle text-success">
                <i className="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Total Orders</span>
                <h3 className="fw-extrabold text-dark mt-1 mb-0">{stats.total_orders}</h3>
              </div>
              <div className="stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-cart3"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Pending Orders</span>
                <h3 className="fw-extrabold text-warning mt-1 mb-0">{stats.pending_orders}</h3>
              </div>
              <div className="stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Delivered Orders</span>
                <h3 className="fw-extrabold text-info mt-1 mb-0">{stats.delivered_orders}</h3>
              </div>
              <div className="stat-icon bg-info-subtle text-info">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Catalog Products</span>
                <h3 className="fw-extrabold text-dark mt-1 mb-0">{stats.total_products}</h3>
              </div>
              <div className="stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Active Customers</span>
                <h3 className="fw-extrabold text-dark mt-1 mb-0">{stats.total_customers}</h3>
              </div>
              <div className="stat-icon bg-secondary-subtle text-secondary">
                <i className="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold">Low Stock Items</span>
                <h3 className="fw-extrabold text-danger mt-1 mb-0">{stats.low_stock_count}</h3>
              </div>
              <div className="stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders + Low Stock Alerts */}
      <div className="row g-4 mb-4">
        {/* Recent Orders Table */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-receipt me-2 text-primary"></i>Recent Customer Orders
              </h6>
              <Link to="/admin/orders" className="small text-primary text-decoration-none fw-semibold">
                View All Orders &rarr;
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="fw-bold text-dark">#{ord.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{ord.customer_name}</div>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{ord.customer_email}</span>
                      </td>
                      <td className="fw-bold text-primary">${Number(ord.total_amount).toFixed(2)}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">{ord.payment_status}</span>
                      </td>
                      <td>
                        <OrderStatusBadge status={ord.order_status} />
                      </td>
                      <td>
                        <Link to={`/admin/orders/${ord.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">No orders placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white h-100">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-exclamation-diamond text-danger me-2"></i>Low Stock Alert
              </h6>
              <Link to="/admin/inventory" className="small text-primary text-decoration-none fw-semibold">
                Manage Stock &rarr;
              </Link>
            </div>
            <div className="p-3">
              {lowStock.map((prod) => (
                <div key={prod.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: '180px' }}>
                      {prod.name}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>{prod.category_name}</span>
                  </div>
                  <div>
                    <span className={`badge ${prod.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill`}>
                      {prod.stock} in stock
                    </span>
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="text-center text-muted small py-4">All inventory stock levels are healthy!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
