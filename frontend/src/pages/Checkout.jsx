import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice, INDIAN_STATES } from '../utils/format';

export default function Checkout() {
  const { user, refreshCounts } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Indian Structured Address Form
  const [flatNo, setFlatNo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  // Payment Options tailored for India
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm / BHIM)');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (user.phone) setPhone(user.phone);

    if (user.address) {
      // If address already contains state or commas, pre-fill street/address
      setStreet(user.address);
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

    // Construct full Indian Shipping Address
    const addressParts = [
      flatNo.trim(),
      street.trim(),
      city.trim(),
      `${stateName} - ${pincode.trim()}`,
      `Phone: ${phone.trim() || user?.phone || ''}`
    ].filter(Boolean);

    const fullShippingAddress = addressParts.join(', ');

    if (!fullShippingAddress || fullShippingAddress.length < 10) {
      setError('Please provide a complete Indian delivery address including PIN code.');
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Indian Postal PIN code.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const res = await api.createOrder({
        shipping_address: fullShippingAddress,
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
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold text-dark mb-0">Secure Checkout</h2>
          <span className="badge bg-white text-dark border px-3 py-2 small shadow-sm">
            🇮🇳 Delivering across 19,000+ PIN Codes in India
          </span>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            {/* Left Column: Delivery Details & Payment */}
            <div className="col-lg-7">
              {/* 1. Contact Information */}
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
                    <label className="form-label text-muted fw-semibold mb-1">
                      Mobile Number (for SMS &amp; Delivery updates) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                      <span className="input-group-text bg-light">+91</span>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="98765 43210"
                        value={phone.replace(/^\+91\s*/, '')}
                        onChange={(e) => setPhone(`+91 ${e.target.value}`)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Indian Delivery Address */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt text-primary"></i> 2. Delivery Address (India)
                </h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Flat / House No. / Building / Society <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Flat 402, Sea Breeze Heights"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Street / Colony / Landmark <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Bandra West, Near Linking Road"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-sm-4">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      City / District <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-sm-4">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      State / Union Territory <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-4">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      6-Digit PIN Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      className="form-control form-control-sm"
                      placeholder="e.g. 400050"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 text-muted small d-flex align-items-center gap-1">
                  <i className="bi bi-shield-check text-success"></i>
                  <span>Standard delivery within 2–4 business days via Bluedart / Delhivery / India Post.</span>
                </div>
              </div>

              {/* 3. Indian Payment Methods */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-wallet2 text-primary"></i> 3. Payment Method
                </h5>

                <div className="d-flex flex-column gap-3">
                  {/* Option 1: UPI */}
                  <div
                    className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                      paymentMethod.startsWith('UPI') ? 'border-primary bg-primary-subtle' : 'bg-light'
                    }`}
                    onClick={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm / BHIM)')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        id="upiRadio"
                        className="form-check-input"
                        checked={paymentMethod.startsWith('UPI')}
                        onChange={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm / BHIM)')}
                      />
                      <label htmlFor="upiRadio" className="form-check-label mb-0 cursor-pointer">
                        <strong className="d-block text-dark">
                          UPI (Google Pay / PhonePe / Paytm / BHIM)
                          <span className="badge bg-success ms-2 small">Instant &amp; Zero Fee</span>
                        </strong>
                        <span className="text-muted small">Pay instantly via any UPI App or VPA.</span>
                      </label>
                    </div>
                    <i className="bi bi-qr-code-scan fs-3 text-primary"></i>
                  </div>

                  {paymentMethod.startsWith('UPI') && (
                    <div className="p-3 bg-white border rounded-3 ms-4 small">
                      <label className="form-label fw-semibold text-secondary mb-1">
                        Enter UPI ID / VPA (Optional simulation)
                      </label>
                      <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. mobile@upi or name@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                      <span className="text-muted small mt-1 d-block">
                        A payment prompt will be simulated upon order confirmation.
                      </span>
                    </div>
                  )}

                  {/* Option 2: Cash on Delivery */}
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
                        <span className="text-muted small">Pay with cash or UPI QR to the delivery agent at doorstep.</span>
                      </label>
                    </div>
                    <i className="bi bi-cash-stack fs-3 text-success"></i>
                  </div>

                  {/* Option 3: RuPay / Credit / Debit Cards */}
                  <div
                    className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                      paymentMethod === 'Credit/Debit Card (RuPay/Visa/Mastercard)' ? 'border-primary bg-primary-subtle' : 'bg-light'
                    }`}
                    onClick={() => setPaymentMethod('Credit/Debit Card (RuPay/Visa/Mastercard)')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        id="cardRadio"
                        className="form-check-input"
                        checked={paymentMethod === 'Credit/Debit Card (RuPay/Visa/Mastercard)'}
                        onChange={() => setPaymentMethod('Credit/Debit Card (RuPay/Visa/Mastercard)')}
                      />
                      <label htmlFor="cardRadio" className="form-check-label mb-0 cursor-pointer">
                        <strong className="d-block text-dark">RuPay / Visa / Mastercard</strong>
                        <span className="text-muted small">All major Indian debit and credit cards accepted.</span>
                      </label>
                    </div>
                    <i className="bi bi-credit-card-2-front fs-3 text-secondary"></i>
                  </div>

                  {/* Option 4: Net Banking */}
                  <div
                    className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                      paymentMethod === 'Net Banking' ? 'border-primary bg-primary-subtle' : 'bg-light'
                    }`}
                    onClick={() => setPaymentMethod('Net Banking')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        id="nbRadio"
                        className="form-check-input"
                        checked={paymentMethod === 'Net Banking'}
                        onChange={() => setPaymentMethod('Net Banking')}
                      />
                      <label htmlFor="nbRadio" className="form-check-label mb-0 cursor-pointer">
                        <strong className="d-block text-dark">Net Banking (50+ Indian Banks)</strong>
                        <span className="text-muted small">SBI, HDFC, ICICI, Axis, Kotak, PNB &amp; more.</span>
                      </label>
                    </div>
                    <i className="bi bi-bank fs-3 text-info"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
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
                          <div className="text-muted small">Qty: {it.quantity} × {formatPrice(it.final_price)}</div>
                        </div>
                      </div>
                      <span className="fw-bold text-dark small">{formatPrice(it.item_total)}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Items Subtotal</span>
                  <span className="fw-semibold text-dark">{formatPrice(summary.subtotal)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Delivery Charges</span>
                  <span className="fw-semibold text-dark">
                    {summary.shipping === 0 ? <span className="text-success fw-bold">FREE</span> : formatPrice(summary.shipping)}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-6 fw-bold text-dark">Total Amount (INR)</span>
                  <span className="fs-4 fw-extrabold text-primary">{formatPrice(summary.grand_total)}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill"></i>
                      <span>Place Order ({formatPrice(summary.grand_total)})</span>
                    </>
                  )}
                </button>

                <div className="mt-3 text-center text-muted small" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-shield-check text-success me-1"></i> 100% Safe &amp; Secure Payments | GST Tax Invoice Included
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
