import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/format';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrder(id);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Order could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This will restock the items.')) return;
    try {
      setCancelling(true);
      const res = await api.cancelOrder(order.id);
      if (res.success) {
        alert('Order has been cancelled.');
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setPaying(true);
      const intentRes = await api.createPayment(order.id);
      if (!intentRes.success) throw new Error(intentRes.message);

      const verifyRes = await api.verifyPayment({
        order_id: order.id,
        transaction_id: intentRes.data.transaction_id
      });

      if (verifyRes.success) {
        alert('Payment verified successfully!');
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Payment failed.');
    } finally {
      setPaying(false);
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
  if (error || !order) return <div className="container py-5"><ErrorMessage message={error || 'Order not found.'} /></div>;

  const items = order.items || [];
  const isPending = order.order_status === 'pending';
  const isUnpaidOnline = order.payment_method === 'Online Payment' && order.payment_status === 'pending';

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/orders" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Back to All Orders
          </Link>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm fw-semibold" onClick={handleViewInvoice}>
              <i className="bi bi-file-earmark-text me-1"></i> View / Print Invoice
            </button>
            {isPending && (
              <button
                className="btn btn-outline-danger btn-sm fw-semibold"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Order Header Summary */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom mb-3">
            <div>
              <h3 className="fw-bold text-dark mb-1">Order #{order.id}</h3>
              <span className="text-muted small">
                Placed on {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div>
                <span className="small text-muted d-block text-end mb-1">Status</span>
                <OrderStatusBadge status={order.order_status} />
              </div>
              <div className="ms-3">
                <span className="small text-muted d-block text-end mb-1">Payment</span>
                <OrderStatusBadge status={order.payment_status} />
              </div>
            </div>
          </div>

          <div className="row g-4 small">
            <div className="col-md-4">
              <strong className="d-block text-secondary mb-1">Customer Details</strong>
              <div className="fw-semibold text-dark">{order.customer_name}</div>
              <div className="text-muted">{order.customer_email}</div>
              <div className="text-muted">{order.customer_phone || 'No phone provided'}</div>
            </div>

            <div className="col-md-4">
              <strong className="d-block text-secondary mb-1">Shipping Address</strong>
              <div className="text-dark">{order.shipping_address}</div>
            </div>

            <div className="col-md-4">
              <strong className="d-block text-secondary mb-1">Payment Information</strong>
              <div className="fw-semibold text-dark">{order.payment_method}</div>
              <div className="text-muted">Total: {formatPrice(order.total_amount)}</div>
              {isUnpaidOnline && isPending && (
                <button
                  className="btn btn-primary btn-sm mt-2 fw-semibold"
                  onClick={handlePayNow}
                  disabled={paying}
                >
                  {paying ? 'Verifying...' : 'Pay Online Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <div className="p-4 border-bottom">
            <h5 className="fw-bold text-dark mb-0">Order Items</h5>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Product</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Purchase Price</th>
                  <th className="text-end pe-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '45px', height: '45px' }} className="rounded bg-light overflow-hidden border">
                          <img
                            src={it.product_image || '/uploads/products/placeholder.svg'}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                          />
                        </div>
                        <span className="fw-bold text-dark">{it.product_name}</span>
                      </div>
                    </td>
                    <td className="text-center small text-muted">{it.category_name}</td>
                    <td className="text-center fw-semibold">{it.quantity}</td>
                    <td className="text-end small">{formatPrice(it.purchase_price)}</td>
                    <td className="text-end pe-4 fw-bold text-dark">{formatPrice(it.item_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-light d-flex justify-content-end">
            <div style={{ minWidth: '240px' }}>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Items Subtotal</span>
                <span className="fw-semibold text-dark">
                  {formatPrice(items.reduce((s, x) => s + x.item_total, 0))}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Delivery Charges</span>
                <span className="fw-semibold text-dark">
                  {order.total_amount - items.reduce((s, x) => s + x.item_total, 0) > 0 ? '₹49.00' : 'FREE'}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-extrabold text-primary">
                <span>Grand Total (INR)</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Modal Preview */}
        {showInvoiceModal && invoiceHtml && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Official Invoice Preview</h5>
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
    </div>
  );
}
