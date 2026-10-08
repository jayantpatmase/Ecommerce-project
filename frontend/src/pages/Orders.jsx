import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/format';

export default function Orders() {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found a better price elsewhere');
  const [customRemarks, setCustomRemarks] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Invoice Modal State
  const [invoiceHtml, setInvoiceHtml] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleOpenCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setCancelReason('Found a better price elsewhere');
    setCustomRemarks('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedOrderForCancel) return;
    try {
      setCancelling(true);
      const finalReason = customRemarks ? `${cancelReason} - ${customRemarks}` : cancelReason;
      const res = await api.cancelOrder(selectedOrderForCancel.id, finalReason);
      if (res.success) {
        showToast(`Order #${selectedOrderForCancel.id} has been cancelled. Stock has been restored.`, 'info');
        setCancelModalOpen(false);
        setSelectedOrderForCancel(null);
        await fetchOrders();
      } else {
        showToast(res.message || 'Could not cancel order.', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Could not cancel order.', 'danger');
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = async (items) => {
    if (!items || items.length === 0) return;
    try {
      for (const it of items) {
        await api.addToCart(it.product_id, 1);
      }
      await refreshCounts();
      showToast('Items re-added to your shopping bag!', 'success');
      navigate('/cart');
    } catch (err) {
      showToast(err.message || 'Could not re-add items to cart', 'danger');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await api.getInvoice(orderId);
      if (res.success && res.data?.html) {
        setInvoiceHtml(res.data.html);
        setShowInvoiceModal(true);
      } else {
        const genRes = await api.generateInvoice(orderId);
        if (genRes.success && genRes.data?.html) {
          setInvoiceHtml(genRes.data.html);
          setShowInvoiceModal(true);
        }
      }
    } catch (err) {
      showToast('Could not load invoice.', 'danger');
    }
  };

  if (!user) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-box2"
          title="Sign in to view your orders"
          description="Log in to check past purchases, shipping progress, and download invoices."
          actionText="Log In"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading) return <Loading message="Loading your order history..." />;

  // Filter and Search logic
  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'active' && ['delivered', 'cancelled'].includes(ord.order_status)) return false;
    if (activeTab === 'delivered' && ord.order_status !== 'delivered') return false;
    if (activeTab === 'cancelled' && ord.order_status !== 'cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(ord.id).includes(q);
      const matchAddress = ord.shipping_address?.toLowerCase().includes(q);
      const matchItems = ord.items?.some((it) => it.product_name?.toLowerCase().includes(q));
      if (!matchId && !matchAddress && !matchItems) return false;
    }
    return true;
  });

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-extrabold text-dark mb-1">My Orders &amp; Purchases</h2>
            <p className="text-muted small mb-0">Track shipments, manage active orders, cancel items, and download GST invoices</p>
          </div>
          <Link to="/products" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
            <i className="bi bi-cart-plus me-1"></i> Continue Shopping
          </Link>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

        {/* Filter Pills and Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <div className="row g-3 align-items-center">
            {/* Status Tabs */}
            <div className="col-12 col-md-7">
              <div className="d-flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Orders', count: orders.length },
                  { id: 'active', label: 'In Transit / Active', count: orders.filter((o) => !['delivered', 'cancelled'].includes(o.order_status)).length },
                  { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.order_status === 'delivered').length },
                  { id: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.order_status === 'cancelled').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                      activeTab === tab.id
                        ? 'btn-primary shadow-sm'
                        : 'btn-light text-secondary'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label} <span className="badge bg-white text-dark ms-1 rounded-pill">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Order # or Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="bi-box2"
            title="No orders found"
            description={
              searchQuery
                ? `No orders matching "${searchQuery}"`
                : 'No orders recorded in this filter view.'
            }
            actionText="Browse Catalog"
            actionLink="/products"
          />
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredOrders.map((ord) => {
              const formattedDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const canCancel = ['pending', 'confirmed'].includes(ord.order_status);

              return (
                <div key={ord.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  {/* Card Header */}
                  <div className="p-3 bg-light bg-opacity-75 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>ORDER PLACED</span>
                        <span className="fw-bold text-dark small">{formattedDate}</span>
                      </div>
                      <div className="border-start ps-3">
                        <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>TOTAL AMOUNT</span>
                        <span className="fw-bold text-primary small">{formatPrice(ord.total_amount)}</span>
                      </div>
                      <div className="border-start ps-3 d-none d-sm-block">
                        <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>DELIVER TO</span>
                        <span className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '160px' }}>
                          {user.name}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted me-1">ORDER #{ord.id}</span>
                      <OrderStatusBadge status={ord.order_status} />
                      <OrderStatusBadge status={ord.payment_status} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="row g-3 align-items-center">
                      {/* Products preview & Tracking Info */}
                      <div className="col-lg-8">
                        {ord.tracking_number && (
                          <div className="p-2 mb-3 bg-primary-subtle bg-opacity-25 rounded-3 d-flex align-items-center gap-2 small">
                            <i className="bi bi-truck text-primary fs-5"></i>
                            <div>
                              <span className="fw-bold text-dark">{ord.courier_name || 'Express Logistics'}</span>
                              <span className="text-muted ms-2">AWB Tracking: <strong>{ord.tracking_number}</strong></span>
                            </div>
                          </div>
                        )}

                        {ord.order_status === 'cancelled' && ord.cancel_reason && (
                          <div className="p-2 mb-3 bg-danger-subtle text-danger rounded-3 small d-flex align-items-center gap-2">
                            <i className="bi bi-x-circle-fill fs-5"></i>
                            <div>
                              <strong>Order Cancelled:</strong> {ord.cancel_reason}
                              <span className="d-block text-muted" style={{ fontSize: '0.74rem' }}>
                                Items returned to stock. If already paid, refund has been initiated.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Item Previews */}
                        <div className="d-flex flex-column gap-2">
                          {ord.items && ord.items.map((it, idx) => (
                            <div key={idx} className="d-flex align-items-center gap-3">
                              <div
                                style={{ width: '56px', height: '56px' }}
                                className="rounded-3 bg-light overflow-hidden border p-1 flex-shrink-0"
                              >
                                <img
                                  src={it.product_image || '/uploads/products/placeholder.svg'}
                                  alt={it.product_name}
                                  className="w-100 h-100 object-fit-contain"
                                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <Link
                                  to={`/products/${it.product_id}`}
                                  className="fw-bold text-dark text-decoration-none small hover-text-primary"
                                >
                                  {it.product_name}
                                </Link>
                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                  Qty: {it.quantity} • {formatPrice(it.price)} each
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="col-lg-4 text-lg-end border-top pt-3 pt-lg-0 border-lg-0">
                        <div className="d-flex flex-column gap-2 justify-content-lg-end">
                          <Link
                            to={`/orders/${ord.id}`}
                            className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                          >
                            <i className="bi bi-clock-history me-1"></i> Track &amp; Details
                          </Link>

                          {canCancel && (
                            <button
                              onClick={() => handleOpenCancelModal(ord)}
                              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                            >
                              <i className="bi bi-x-circle me-1"></i> Cancel Order
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadInvoice(ord.id)}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold"
                          >
                            <i className="bi bi-file-earmark-text me-1"></i> Tax Invoice
                          </button>

                          {ord.items && ord.items.length > 0 && (
                            <button
                              onClick={() => handleBuyAgain(ord.items)}
                              className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold"
                            >
                              <i className="bi bi-arrow-repeat me-1"></i> Buy Again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: CANCEL ORDER WITH REASON */}
        {cancelModalOpen && selectedOrderForCancel && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-octagon-fill"></i> Cancel Order #{selectedOrderForCancel.id}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCancelModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body pt-3">
                  <p className="text-secondary small mb-3">
                    Are you sure you want to cancel this order? The ordered items will be immediately returned to available stock.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Select Cancellation Reason <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select rounded-3"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                      <option value="Expected delivery time is too long">Expected delivery time is too long</option>
                      <option value="Need to change shipping address">Need to change shipping address</option>
                      <option value="Need to change payment method">Need to change payment method</option>
                      <option value="Item not needed anymore">Item not needed anymore</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Additional Comments / Feedback (Optional)
                    </label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="Share details to help us improve..."
                      value={customRemarks}
                      onChange={(e) => setCustomRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  {selectedOrderForCancel.payment_status === 'paid' && (
                    <div className="alert alert-info py-2 px-3 small rounded-3 mb-0">
                      <i className="bi bi-info-circle me-1"></i> Since you paid online, a 100% refund of <strong>{formatPrice(selectedOrderForCancel.total_amount)}</strong> will be credited back to your original payment method.
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setCancelModalOpen(false)}
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                    onClick={handleConfirmCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: INVOICE PREVIEW */}
        {showInvoiceModal && invoiceHtml && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Official GST Tax Invoice</h5>
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
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowInvoiceModal(false)}>
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
