import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/format';

export default function OrderDetails() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Expected delivery time is too long');
  const [customRemarks, setCustomRemarks] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Invoice Modal State
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

  const handleConfirmCancelOrder = async () => {
    try {
      setCancelling(true);
      const finalReason = customRemarks ? `${cancelReason} - ${customRemarks}` : cancelReason;
      const res = await api.cancelOrder(order.id, finalReason);
      if (res.success) {
        showToast('Order has been successfully cancelled and stock restored.', 'info');
        setCancelModalOpen(false);
        await fetchDetails();
      } else {
        showToast(res.message || 'Could not cancel order', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Could not cancel order', 'danger');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReviewModal = (product) => {
    setSelectedProductForReview(product);
    setReviewRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProductForReview) return;
    try {
      setSubmittingReview(true);
      const res = await api.addReview({
        product_id: selectedProductForReview.product_id,
        rating: reviewRating,
        review: reviewText
      });
      if (res.success) {
        showToast('Thank you! Your product review has been published.', 'success');
        setReviewModalOpen(false);
      } else {
        showToast(res.message || 'Could not submit review.', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting review.', 'danger');
    } finally {
      setSubmittingReview(false);
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
      showToast('Could not load invoice.', 'danger');
    }
  };

  if (loading) return <Loading message="Loading order details & shipment tracking..." />;
  if (error || !order) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error || 'Order not found.'} />
        <Link to="/orders" className="btn btn-outline-primary mt-3">Back to Orders</Link>
      </div>
    );
  }

  const items = order.items || [];
  const isCancelled = order.order_status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.order_status);

  // Stepper steps
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: 'bi-cart-check' },
    { key: 'confirmed', label: 'Confirmed', icon: 'bi-check2-circle' },
    { key: 'packed', label: 'Packed', icon: 'bi-box-seam' },
    { key: 'shipped', label: 'In Transit', icon: 'bi-truck' },
    { key: 'delivered', label: 'Delivered', icon: 'bi-house-check' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'packed': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.order_status);

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <Link to="/orders" className="btn btn-outline-secondary btn-sm rounded-pill">
            <i className="bi bi-arrow-left me-1"></i> Back to All Orders
          </Link>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm rounded-pill fw-semibold" onClick={handleViewInvoice}>
              <i className="bi bi-file-earmark-text me-1"></i> Print / Download Invoice
            </button>
            {canCancel && (
              <button
                className="btn btn-outline-danger btn-sm rounded-pill fw-semibold"
                onClick={() => setCancelModalOpen(true)}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* CANCELLATION BANNER IF CANCELLED */}
        {isCancelled && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-danger-subtle text-danger mb-4">
            <div className="d-flex align-items-start gap-3">
              <i className="bi bi-x-octagon-fill fs-2"></i>
              <div>
                <h5 className="fw-bold mb-1">This order was cancelled</h5>
                <p className="mb-1 text-dark small">
                  <strong>Reason:</strong> {order.cancel_reason || 'Cancelled by customer'}
                </p>
                <span className="text-secondary small">
                  Items have been returned to warehouse stock. {order.payment_status === 'refunded' ? 'A full refund has been credited back to your original payment method.' : 'No charges were incurred.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ORDER PROGRESS STEPPER (IF NOT CANCELLED) */}
        {!isCancelled && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-geo-alt-fill text-primary me-2"></i> Shipment Tracking
              </h5>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">
                Status: {order.order_status.toUpperCase()}
              </span>
            </div>

            {/* Stepper graphical line */}
            <div className="position-relative my-4">
              <div
                className="position-absolute top-50 start-0 translate-middle-y w-100 bg-light"
                style={{ height: '4px', zIndex: 1 }}
              >
                <div
                  className="bg-primary h-100 transition-all"
                  style={{
                    width: `${Math.max(0, (currentStepIdx / (steps.length - 1)) * 100)}%`,
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>

              <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
                {steps.map((st, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={st.key} className="text-center" style={{ width: '80px' }}>
                      <div
                        className={`rounded-circle mx-auto d-flex align-items-center justify-content-center shadow-sm ${
                          isDone
                            ? 'bg-primary text-white'
                            : 'bg-white border text-muted'
                        }`}
                        style={{
                          width: '38px',
                          height: '38px',
                          border: isCurrent ? '3px solid #0072de' : undefined
                        }}
                      >
                        <i className={`bi ${st.icon}`}></i>
                      </div>
                      <div
                        className={`small mt-2 ${
                          isDone ? 'fw-bold text-dark' : 'text-muted'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & Tracking details */}
            <div className="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '42px', height: '42px' }}
                >
                  <i className="bi bi-truck fs-5"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark small">{order.courier_name || 'Express Logistics India'}</div>
                  <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                    Air Waybill (AWB): <strong>{order.tracking_number || `EXP-${order.id}-IN`}</strong>
                  </div>
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 small fw-bold">
                  On-Time Delivery Guarantee
                </span>
                <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                  Pan-India Doorstep Dispatch
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER SUMMARY & ADDRESS CARD */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom mb-3">
            <div>
              <h4 className="fw-bold text-dark mb-1">Order #{order.id}</h4>
              <span className="text-muted small">
                Placed on {new Date(order.created_at).toLocaleString('en-IN')}
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
              <strong className="d-block text-secondary mb-1">Delivery Address</strong>
              <div className="text-dark" style={{ lineHeight: '1.4' }}>
                {order.shipping_address}
              </div>
            </div>

            <div className="col-md-4">
              <strong className="d-block text-secondary mb-1">Payment Mode</strong>
              <div className="fw-semibold text-dark">{order.payment_method}</div>
              <div className="text-muted">Total Paid: {formatPrice(order.total_amount)}</div>
              {order.payment_status === 'paid' && (
                <span className="badge bg-success-subtle text-success border border-success-subtle mt-1 rounded-pill px-2 py-0">
                  <i className="bi bi-check-circle-fill me-1"></i> Paid in Full
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ORDERED ITEMS TABLE */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <div className="p-4 border-bottom">
            <h5 className="fw-bold text-dark mb-0">Items in this Package</h5>
          </div>
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th className="ps-4">Product Details</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Unit Price</th>
                  <th className="text-end pe-4">Subtotal</th>
                  <th className="text-center pe-4">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '50px', height: '50px' }} className="rounded-3 bg-light overflow-hidden border p-1">
                          <img
                            src={it.product_image || '/uploads/products/placeholder.svg'}
                            alt={it.product_name}
                            className="w-100 h-100 object-fit-contain"
                            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                          />
                        </div>
                        <div>
                          <Link to={`/products/${it.product_id}`} className="fw-bold text-dark text-decoration-none">
                            {it.product_name}
                          </Link>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            Item Code: SKU-{it.product_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center small text-muted">{it.category_name}</td>
                    <td className="text-center fw-semibold">{it.quantity}</td>
                    <td className="text-end small">{formatPrice(it.purchase_price)}</td>
                    <td className="text-end pe-4 fw-bold text-dark">{formatPrice(it.item_total)}</td>
                    <td className="text-center pe-4">
                      <button
                        onClick={() => handleOpenReviewModal(it)}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="bi bi-star me-1"></i> Write Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-light d-flex justify-content-end">
            <div style={{ minWidth: '260px' }}>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Items Subtotal</span>
                <span className="fw-semibold text-dark">
                  {formatPrice(items.reduce((s, x) => s + x.item_total, 0))}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>GST (18% inclusive)</span>
                <span className="text-dark">CGST + SGST</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Delivery Charges</span>
                <span className="fw-semibold text-success">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-extrabold text-primary">
                <span>Grand Total (INR)</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: CANCEL ORDER */}
        {cancelModalOpen && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-octagon-fill"></i> Cancel Order #{order.id}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setCancelModalOpen(false)}></button>
                </div>
                <div className="modal-body pt-3">
                  <p className="text-secondary small mb-3">
                    Are you sure you want to cancel this order? All items will be restocked to inventory.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Cancellation Reason *</label>
                    <select
                      className="form-select rounded-3"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="Expected delivery time is too long">Expected delivery time is too long</option>
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Ordered by mistake / duplicate order">Ordered by mistake / duplicate order</option>
                      <option value="Need to change shipping address">Need to change shipping address</option>
                      <option value="Need to change payment method">Need to change payment method</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Additional Remarks</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="Optional feedback..."
                      value={customRemarks}
                      onChange={(e) => setCustomRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setCancelModalOpen(false)}>
                    Keep Order
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 fw-bold"
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

        {/* MODAL: SUBMIT REVIEW */}
        {reviewModalOpen && selectedProductForReview && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Rate &amp; Review Product</h5>
                  <button type="button" className="btn-close" onClick={() => setReviewModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmitReview}>
                  <div className="modal-body pt-3">
                    <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded-3">
                      <img
                        src={selectedProductForReview.product_image || '/uploads/products/placeholder.svg'}
                        alt=""
                        style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                      />
                      <span className="fw-bold text-dark small">{selectedProductForReview.product_name}</span>
                    </div>

                    <div className="mb-3 text-center">
                      <label className="form-label small fw-semibold d-block text-secondary mb-2">Overall Rating</label>
                      <div className="d-flex justify-content-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => setReviewRating(star)}
                            style={{ fontSize: '1.8rem', color: star <= reviewRating ? '#ffc107' : '#e4e5e9' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Your Review</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        placeholder="What did you like or dislike about this product? How was the build quality and performance?"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setReviewModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
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
