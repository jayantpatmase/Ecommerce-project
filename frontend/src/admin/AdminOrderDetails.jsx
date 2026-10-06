import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/format';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState(null);

  const [invoiceHtml, setInvoiceHtml] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminOrder(id);
      if (res.success) {
        setOrder(res.data);
        setNewOrderStatus(res.data.order_status);
        setNewPaymentStatus(res.data.payment_status);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setMsg(null);
      const res = await api.updateOrderStatus({
        order_id: order.id,
        order_status: newOrderStatus,
        payment_status: newPaymentStatus
      });
      if (res.success) {
        setMsg({ type: 'success', text: 'Order status updated successfully and customer notified!' });
        await fetchOrder();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Status update failed.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm('Process full refund for this order? This will cancel the order and log a refund transaction.')) return;
    try {
      setUpdating(true);
      const res = await api.refundPayment(order.id);
      if (res.success) {
        alert('Refund processed successfully!');
        await fetchOrder();
      }
    } catch (err) {
      alert(err.message || 'Refund failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewInvoice = async () => {
    try {
      const res = await api.getInvoice(order.id);
      if (res.success && res.data?.html) {
        setInvoiceHtml(res.data.html);
        setShowInvoiceModal(true);
      } else {
        const genRes = await api.generateInvoice(order.id);
        if (genRes.success && genRes.data?.html) {
          setInvoiceHtml(genRes.data.html);
          setShowInvoiceModal(true);
        }
      }
    } catch (err) {
      alert(err.message || 'Could not load invoice.');
    }
  };

  if (loading) return <Loading message="Loading order details..." />;
  if (error || !order) return <ErrorMessage message={error || 'Order not found'} />;

  const items = order.items || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Manage Order #{order.id}</h3>
          <p className="text-muted small mb-0">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/orders" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Back to Orders
          </Link>
          <button className="btn btn-outline-primary btn-sm fw-semibold" onClick={handleViewInvoice}>
            <i className="bi bi-printer me-1"></i> View Invoice
          </button>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} py-2 px-3 small rounded-3 mb-4`}>
          {msg.text}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Customer details & Items */}
        <div className="col-lg-8">
          {/* Customer & Address Details */}
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Order &amp; Customer Overview</h5>
            <div className="row g-3 small">
              <div className="col-md-4">
                <span className="text-muted d-block">Customer</span>
                <strong className="text-dark fs-6">{order.customer_name}</strong>
                <div className="text-muted">{order.customer_email}</div>
                <div className="text-muted">{order.customer_phone || 'No phone'}</div>
              </div>

              <div className="col-md-4">
                <span className="text-muted d-block">Delivery Address</span>
                <div className="text-dark">{order.shipping_address}</div>
              </div>

              <div className="col-md-4">
                <span className="text-muted d-block">Payment Method</span>
                <div className="fw-semibold text-dark">{order.payment_method}</div>
                <span className="text-muted d-block mt-2">Current Total</span>
                <div className="fs-5 fw-bold text-primary">{formatPrice(order.total_amount)}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-0 text-dark">Ordered Items ({items.length})</h6>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle small">
                <thead className="table-light text-uppercase">
                  <tr>
                    <th className="ps-3">Product</th>
                    <th className="text-center">Current Stock</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end pe-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-3">
                          <div style={{ width: '38px', height: '38px' }} className="rounded bg-light overflow-hidden border">
                            <img
                              src={it.product_image || '/uploads/products/placeholder.svg'}
                              alt=""
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                            />
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">{it.product_name}</span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>{it.category_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary-subtle text-secondary">{it.current_stock} available</span>
                      </td>
                      <td className="text-center fw-bold">{it.quantity}</td>
                      <td className="text-end">{formatPrice(it.purchase_price)}</td>
                      <td className="text-end pe-3 fw-bold text-dark">{formatPrice(it.item_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Update Status Controls */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-dark mb-3">Status Management</h5>

            <div className="mb-3">
              <span className="text-muted small d-block mb-1">Current Fulfillment Status:</span>
              <OrderStatusBadge status={order.order_status} />
            </div>

            <div className="mb-4">
              <span className="text-muted small d-block mb-1">Current Payment Status:</span>
              <OrderStatusBadge status={order.payment_status} />
            </div>

            <hr />

            <form onSubmit={handleUpdateStatus}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Update Order Status</label>
                <select
                  className="form-select form-select-sm"
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  disabled={order.order_status === 'cancelled' || order.order_status === 'delivered'}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Restores Stock)</option>
                </select>
                <span className="form-text small" style={{ fontSize: '0.75rem' }}>
                  Selecting "Cancelled" automatically returns purchased quantities back to inventory stock.
                </span>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Update Payment Status</label>
                <select
                  className="form-select form-select-sm"
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold shadow-sm mb-2"
                disabled={updating}
              >
                {updating ? 'Saving Changes...' : 'Save Status Changes'}
              </button>
            </form>

            {order.payment_status === 'paid' && order.order_status !== 'cancelled' && (
              <button
                type="button"
                className="btn btn-outline-danger w-100 fw-semibold btn-sm mt-2"
                onClick={handleRefund}
                disabled={updating}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Process Refund
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {showInvoiceModal && invoiceHtml && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Official Invoice #{order.invoice?.invoice_number || order.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <iframe
                  title="Invoice"
                  srcDoc={invoiceHtml}
                  style={{ width: '100%', height: '650px', border: 'none' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
