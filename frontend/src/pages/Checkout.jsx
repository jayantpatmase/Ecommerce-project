import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Checkout() {
  const { user, refreshCounts } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (user.address) {
      setShippingAddress(user.address);
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await api.getCart();
        if (res.success) {
          if (!res.data.items || res.data.items.length === 0) {
            navigate('/cart');
            return;
          }
          setCart(res.data);
        }
      } catch (err) {
        setError(err.message || 'Could not load checkout data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      setError('Please provide a complete shipping address.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const res = await api.createOrder({
        shipping_address: shippingAddress.trim(),
        payment_method: paymentMethod
      });

      if (res.success && res.data?.order_id) {
        await refreshCounts();
        navigate(`/order-success?order_id=${res.data.order_id}`, {
          state: {
            orderId: res.data.order_id,
            totalAmount: res.data.total_amount,
            paymentMethod: res.data.payment_method,
            paymentStatus: res.data.payment_status,
            orderStatus: res.data.order_status
          }
        });
      } else {
        setError(res.message || 'Order creation failed.');
      }
    } catch (err) {
      setError(err.message || 'Order could not be placed. Please check stock or details.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading message="Preparing checkout..." />;

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, shipping: 0, grand_total: 0 };

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        <h2 className="fw-bold text-dark mb-4">Complete Your Order</h2>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            {/* Left: Shipping & Payment details */}
            <div className="col-lg-7">
              {/* Customer summary */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-person-check text-primary"></i> 1. Contact Information
                </h5>
                <div className="row g-3 small">
                  <div className="col-sm-6">
                    <label className="text-muted fw-semibold">Customer Name</label>
                    <div className="fw-bold text-dark">{user?.name}</div>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-muted fw-semibold">Email Address</label>
                    <div className="fw-bold text-dark">{user?.email}</div>
                  </div>
                  <div className="col-12">
                    <label className="text-muted fw-semibold">Phone Number</label>
                    <div className="fw-bold text-dark">{user?.phone || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt text-primary"></i> 2. Delivery Address
                </h5>
                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary">
                    Full Shipping Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Street Address, Apartment/Suite, City, State/Province, Postal Code, Country"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  ></textarea>
                </div>
                <span className="text-muted small">
                  We deliver worldwide with tracked express courier shipping.
                </span>
              </div>

              {/* Payment Method */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-credit-card-2-front text-primary"></i> 3. Payment Method
                </h5>

                <div className="d-flex flex-column gap-3">
                  {/* Option 1: Cash on Delivery */}
                  <div
                    className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                      paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary-subtle' : 'bg-light'
                    }`}
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        id="codRadio"
                        className="form-check-input"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                      />
                      <label htmlFor="codRadio" className="form-check-label mb-0 cursor-pointer">
                        <strong className="d-block text-dark">Cash on Delivery (COD)</strong>
                        <span className="text-muted small">Pay with cash or POS card upon package delivery.</span>
                      </label>
                    </div>
                    <i className="bi bi-cash-stack fs-3 text-success"></i>
                  </div>

                  {/* Option 2: Online Payment */}
                  <div
                    className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                      paymentMethod === 'Online Payment' ? 'border-primary bg-primary-subtle' : 'bg-light'
                    }`}
                    onClick={() => setPaymentMethod('Online Payment')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        id="onlineRadio"
                        className="form-check-input"
                        checked={paymentMethod === 'Online Payment'}
                        onChange={() => setPaymentMethod('Online Payment')}
                      />
                      <label htmlFor="onlineRadio" className="form-check-label mb-0 cursor-pointer">
                        <strong className="d-block text-dark">Secure Online Payment</strong>
                        <span className="text-muted small">Pay securely via Credit/Debit card, UPI, or Net Banking.</span>
                      </label>
                    </div>
                    <i className="bi bi-shield-lock-fill fs-3 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order Items ({items.length})</h5>

                <div className="overflow-auto mb-3" style={{ maxHeight: '250px' }}>
                  {items.map((it) => (
                    <div key={it.cart_id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '40px', height: '40px' }} className="rounded bg-light overflow-hidden border">
                          <img
                            src={it.image || '/uploads/products/placeholder.svg'}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                          />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '180px' }}>
                            {it.name}
                          </div>
                          <div className="text-muted small">Qty: {it.quantity} × ${Number(it.final_price).toFixed(2)}</div>
                        </div>
                      </div>
                      <span className="fw-bold text-dark small">${Number(it.item_total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Subtotal</span>
                  <span className="fw-semibold text-dark">${summary.subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Shipping</span>
                  <span className="fw-semibold text-dark">
                    {summary.shipping === 0 ? <span className="text-success fw-bold">FREE</span> : `$${summary.shipping.toFixed(2)}`}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-6 fw-bold text-dark">Total to Pay</span>
                  <span className="fs-4 fw-extrabold text-primary">${summary.grand_total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill"></i>
                      <span>Place Order (${summary.grand_total.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
