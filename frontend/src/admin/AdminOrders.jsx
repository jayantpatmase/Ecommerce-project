import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminOrders({
        order_status: orderStatus,
        payment_status: paymentStatus,
        search,
        limit: 50
      });
      if (res.success) {
        setOrders(res.data.orders);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatus, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Order Management</h3>
          <p className="text-muted small mb-0">Track order fulfillment status, monitor payments, and process invoices</p>
        </div>
      </div>

      {/* Filters card */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by order ID, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-3 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-3 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {loading ? (
        <Loading message="Loading orders..." />
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover small">
              <thead className="table-light text-uppercase">
                <tr>
                  <th className="ps-3">Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th>Date</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="ps-3 fw-bold text-dark">#{ord.id}</td>
                    <td>
                      <div className="fw-semibold text-dark">{ord.customer_name}</div>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{ord.customer_email}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                        {ord.item_count} items
                      </span>
                    </td>
                    <td className="fw-bold text-primary">${Number(ord.total_amount).toFixed(2)}</td>
                    <td className="text-muted">{ord.payment_method}</td>
                    <td>
                      <OrderStatusBadge status={ord.payment_status} />
                    </td>
                    <td>
                      <OrderStatusBadge status={ord.order_status} />
                    </td>
                    <td className="text-muted small">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-end pe-3">
                      <Link to={`/admin/orders/${ord.id}`} className="btn btn-sm btn-primary py-1 px-3">
                        Manage <i className="bi bi-chevron-right ms-1"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">No orders match filter criteria.</td>
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
