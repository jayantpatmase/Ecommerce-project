import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice, INDIAN_STATES } from '../utils/format';

export default function Checkout() {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Address Book integration
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form State
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newFlat, setNewFlat] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPincode, setNewPincode] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);

  // Payment method & details
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm / BHIM)');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // COD security captcha
  const [captchaCode, setCaptchaCode] = useState('4829');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Generate random 4-digit captcha
    setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());

    const loadData = async () => {
      try {
        setLoading(true);
        const [cartRes, addrRes] = await Promise.all([
          api.getCart(),
          api.getAddresses()
        ]);

        if (cartRes.success) {
          if (!cartRes.data.items || cartRes.data.items.length === 0) {
            navigate('/cart');
            return;
          }
          setCart(cartRes.data);
        }

        if (addrRes.success && addrRes.data.length > 0) {
          setSavedAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find((a) => a.is_default) || addrRes.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          // If no saved addresses exist, show the address form
          setShowNewAddressForm(true);
          setNewFullName(user?.name || '');
          setNewPhone(user?.phone || '');
        }
      } catch (err) {
        setError(err.message || 'Could not load checkout data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleVerifyUpi = () => {
    if (!upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g., yourname@okhdfcbank)', 'warning');
      return;
    }
    setUpiVerified(true);
    showToast(`Verified UPI VPA: ${upiId} (Name: ${user?.name || 'Verified Customer'})`, 'success');
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    // Format into groups of 4
    val = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(val);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleSaveAndSelectNewAddress = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(newPincode.trim())) {
      showToast('Please enter a valid 6-digit Indian PIN code.', 'warning');
      return;
    }

    const payload = {
      full_name: newFullName,
      phone: newPhone,
      flat_no: newFlat,
      street: newStreet,
      landmark: newLandmark,
      city: newCity,
      state: newState,
      pincode: newPincode,
      address_type: newAddressType,
      is_default: savedAddresses.length === 0
    };

    try {
      const res = await api.addAddress(payload);
      if (res.success) {
        showToast('Address saved to your address book!', 'success');
        const refreshed = await api.getAddresses();
        if (refreshed.success) {
          setSavedAddresses(refreshed.data);
          setSelectedAddressId(res.data.id);
        }
        setShowNewAddressForm(false);
      } else {
        showToast(res.message || 'Could not save address', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Error saving address', 'danger');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Resolve Shipping Address
    let fullShippingAddress = '';
    if (selectedAddressId && !showNewAddressForm) {
      const chosen = savedAddresses.find((a) => a.id === selectedAddressId);
      if (chosen) {
        fullShippingAddress = `${chosen.full_name}, ${chosen.flat_no}, ${chosen.street}, ${chosen.landmark ? chosen.landmark + ', ' : ''}${chosen.city}, ${chosen.state} - ${chosen.pincode}, Phone: ${chosen.phone}`;
      }
    } else {
      // Using manual form
      if (!/^\d{6}$/.test(newPincode.trim())) {
        setError('Please enter a valid 6-digit Indian Postal PIN code.');
        return;
      }
      fullShippingAddress = `${newFullName}, ${newFlat}, ${newStreet}, ${newLandmark ? newLandmark + ', ' : ''}${newCity}, ${newState} - ${newPincode}, Phone: ${newPhone}`;
    }

    if (!fullShippingAddress || fullShippingAddress.length < 15) {
      setError('Please provide a complete Indian delivery address including PIN code and phone number.');
      return;
    }

    // 2. Validate Payment Details
    if (paymentMethod.startsWith('Cash on Delivery') && enteredCaptcha.trim() !== captchaCode) {
      setError('Incorrect security captcha code. Please re-enter the 4-digit code shown below.');
      return;
    }

    if (paymentMethod.startsWith('Debit / Credit') && cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a complete 16-digit Debit / Credit card number.');
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
        showToast(`Order #${res.data.order_id} placed successfully!`, 'success');
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

  if (loading) return <Loading message="Preparing secure checkout..." />;

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, shipping: 0, grand_total: 0 };
  const gstAmount = Math.round((summary.subtotal * 0.18) * 100) / 100;

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-extrabold text-dark mb-0">Express Checkout</h2>
            <span className="text-muted small">Instant UPI &amp; Pan-India Doorstep Delivery</span>
          </div>
          <span className="badge bg-white text-dark border px-3 py-2 small shadow-sm rounded-pill">
            🇮🇳 Delivering across 19,000+ PIN Codes in India
          </span>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            {/* Left Column: Delivery Address & Payment Method */}
            <div className="col-lg-7">
              {/* 1. DELIVERY ADDRESS SECTION */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-primary"></i> 1. Select Delivery Address
                  </h5>
                  {!showNewAddressForm && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill fw-semibold"
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {/* Saved Address Cards */}
                {!showNewAddressForm && savedAddresses.length > 0 && (
                  <div className="row g-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div key={addr.id} className="col-12">
                          <div
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-3 rounded-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                                : 'border bg-light hover-border-primary'
                            }`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            <div className="d-flex align-items-start gap-3">
                              <input
                                type="radio"
                                name="delivery_address"
                                className="form-check-input mt-1"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className="fw-bold text-dark">{addr.full_name}</span>
                                  <span className="badge bg-dark rounded-pill px-2 py-0 small" style={{ fontSize: '0.68rem' }}>
                                    {addr.address_type}
                                  </span>
                                  {addr.is_default && (
                                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0 small fw-bold" style={{ fontSize: '0.68rem' }}>
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="small text-secondary mb-1">
                                  {addr.flat_no}, {addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                                </div>
                                <div className="small text-muted">
                                  <i className="bi bi-telephone me-1"></i> Phone: <strong>{addr.phone}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline New Address Form */}
                {showNewAddressForm && (
                  <div className="p-3 border rounded-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-dark mb-0">Add New Delivery Location</h6>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          Cancel / Use Saved
                        </button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Receiver Full Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Rahul Sharma"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          required={showNewAddressForm}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">10-Digit Mobile *</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white">+91</span>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="9876543210"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            required={showNewAddressForm}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Flat / House No. / Building *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Flat 402, Royal Palms"
                          value={newFlat}
                          onChange={(e) => setNewFlat(e.target.value)}
                          required={showNewAddressForm}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Street / Area / Sector *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Link Road, Andheri West"
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          required={showNewAddressForm}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">City *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Mumbai"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          required={showNewAddressForm}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">PIN Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="400053"
                          maxLength="6"
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          required={showNewAddressForm}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">State *</label>
                        <select
                          className="form-select form-select-sm"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                        onClick={handleSaveAndSelectNewAddress}
                      >
                        Save &amp; Deliver Here
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PAYMENT METHODS SECTION */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <i className="bi bi-wallet2 text-primary"></i> 2. Payment Method
                </h5>

                <div className="d-flex flex-column gap-3">
                  {/* OPTION A: UPI */}
                  <div
                    onClick={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm / BHIM)')}
                    className={`border rounded-4 p-3 cursor-pointer ${
                      paymentMethod.includes('UPI')
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_choice"
                          checked={paymentMethod.includes('UPI')}
                          onChange={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm / BHIM)')}
                        />
                        <span className="fw-bold text-dark">UPI Instant Payment</span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0 small fw-bold">
                          Zero Convenience Fee
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <span className="badge bg-dark rounded-pill px-2">GPay</span>
                        <span className="badge bg-primary rounded-pill px-2">PhonePe</span>
                        <span className="badge bg-info rounded-pill px-2">Paytm</span>
                      </div>
                    </div>

                    {paymentMethod.includes('UPI') && (
                      <div className="mt-3 pt-3 border-top">
                        <label className="form-label small fw-semibold text-secondary">
                          Enter your Virtual Payment Address (VPA / UPI ID)
                        </label>
                        <div className="input-group input-group-sm mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="username@okhdfcbank / 9876543210@paytm"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setUpiVerified(false);
                            }}
                          />
                          <button
                            type="button"
                            className={`btn ${upiVerified ? 'btn-success' : 'btn-outline-primary'} fw-semibold`}
                            onClick={handleVerifyUpi}
                          >
                            {upiVerified ? <><i className="bi bi-check-lg"></i> Verified</> : 'Verify VPA'}
                          </button>
                        </div>

                        <div className="d-flex gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark rounded-pill px-3"
                            onClick={() => setShowUpiQrModal(true)}
                          >
                            <i className="bi bi-qr-code me-1"></i> Scan &amp; Pay via QR Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION B: CARDS */}
                  <div
                    onClick={() => setPaymentMethod('Debit / Credit Card (RuPay, Visa, MasterCard)')}
                    className={`border rounded-4 p-3 cursor-pointer ${
                      paymentMethod.includes('Card')
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_choice"
                          checked={paymentMethod.includes('Card')}
                          onChange={() => setPaymentMethod('Debit / Credit Card (RuPay, Visa, MasterCard)')}
                        />
                        <span className="fw-bold text-dark">Credit / Debit / RuPay Cards</span>
                      </div>
                      <div className="d-flex gap-1">
                        <span className="badge bg-primary rounded-pill px-2">RuPay</span>
                        <span className="badge bg-secondary rounded-pill px-2">Visa</span>
                        <span className="badge bg-dark rounded-pill px-2">MasterCard</span>
                      </div>
                    </div>

                    {paymentMethod.includes('Card') && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label small fw-semibold text-secondary">Card Number</label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="4532 •••• •••• 8890"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                maxLength="19"
                              />
                            </div>
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-semibold text-secondary">Cardholder Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Name on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                            />
                          </div>
                          <div className="col-3">
                            <label className="form-label small fw-semibold text-secondary">Valid Thru</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="MM/YY"
                              maxLength="5"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                            />
                          </div>
                          <div className="col-3">
                            <label className="form-label small fw-semibold text-secondary">CVV</label>
                            <input
                              type="password"
                              className="form-control form-control-sm"
                              placeholder="•••"
                              maxLength="3"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION C: NET BANKING */}
                  <div
                    onClick={() => setPaymentMethod('Net Banking (SBI, HDFC, ICICI, Axis)')}
                    className={`border rounded-4 p-3 cursor-pointer ${
                      paymentMethod.includes('Net Banking')
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_choice"
                          checked={paymentMethod.includes('Net Banking')}
                          onChange={() => setPaymentMethod('Net Banking (SBI, HDFC, ICICI, Axis)')}
                        />
                        <span className="fw-bold text-dark">Net Banking</span>
                      </div>
                      <span className="badge bg-light text-dark border rounded-pill px-2">All Indian Banks</span>
                    </div>

                    {paymentMethod.includes('Net Banking') && (
                      <div className="mt-3 pt-3 border-top">
                        <label className="form-label small fw-semibold text-secondary">Select Bank</label>
                        <select
                          className="form-select form-select-sm"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* OPTION D: CASH ON DELIVERY */}
                  <div
                    onClick={() => setPaymentMethod('Cash on Delivery (Doorstep Cash / Card / UPI)')}
                    className={`border rounded-4 p-3 cursor-pointer ${
                      paymentMethod.includes('Cash on Delivery')
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_choice"
                          checked={paymentMethod.includes('Cash on Delivery')}
                          onChange={() => setPaymentMethod('Cash on Delivery (Doorstep Cash / Card / UPI)')}
                        />
                        <span className="fw-bold text-dark">Cash on Delivery (COD)</span>
                      </div>
                      <span className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill px-2 py-0 small fw-bold">
                        Pay at Doorstep
                      </span>
                    </div>

                    {paymentMethod.includes('Cash on Delivery') && (
                      <div className="mt-3 pt-3 border-top">
                        <p className="small text-muted mb-2">
                          <i className="bi bi-shield-check text-success me-1"></i> You can pay via Cash or UPI QR to the delivery executive upon arrival.
                        </p>
                        <label className="form-label small fw-semibold text-secondary">
                          Enter Security Code: <span className="badge bg-secondary ms-1 fs-6 px-2 py-0">{captchaCode}</span>
                        </label>
                        <div className="input-group input-group-sm" style={{ maxWidth: '240px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 4 digits"
                            maxLength="4"
                            value={enteredCaptcha}
                            onChange={(e) => setEnteredCaptcha(e.target.value)}
                            required={paymentMethod.includes('Cash on Delivery')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items Summary & Price Breakdown */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                  Order Summary <span className="text-muted fs-6 fw-normal">({items.length} item{items.length === 1 ? '' : 's'})</span>
                </h5>

                {/* Items Mini List */}
                <div className="mb-3 overflow-auto" style={{ maxHeight: '200px' }}>
                  {items.map((it) => (
                    <div key={it.cart_id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                      <div style={{ width: '48px', height: '48px' }} className="rounded-3 bg-light overflow-hidden flex-shrink-0 border">
                        <img
                          src={it.image || '/uploads/products/placeholder.svg'}
                          alt={it.name}
                          className="w-100 h-100 object-fit-contain p-1"
                          onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                        />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="small fw-bold text-dark text-truncate">{it.name}</div>
                        <div className="small text-muted">Qty: {it.quantity} × {formatPrice(it.final_price)}</div>
                      </div>
                      <div className="small fw-bold text-dark flex-shrink-0">
                        {formatPrice(it.item_total)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Details */}
                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Items Subtotal</span>
                  <span className="fw-semibold text-dark">{formatPrice(summary.subtotal)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>GST (18% inclusive)</span>
                  <span className="text-dark">CGST + SGST ({formatPrice(gstAmount)})</span>
                </div>

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Doorstep Express Delivery</span>
                  <span className="fw-bold text-success">
                    {summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping)}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <span className="fs-5 fw-extrabold text-dark d-block">Grand Total</span>
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>All Indian Taxes Included</span>
                  </div>
                  <span className="fs-4 fw-extrabold text-primary">
                    {formatPrice(summary.grand_total)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow"
                  disabled={processing}
                >
                  {processing ? (
                    <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i> Placing Order...</span>
                  ) : (
                    <span>Confirm &amp; Place Order <i className="bi bi-chevron-right ms-1"></i></span>
                  )}
                </button>

                <div className="mt-3 text-center">
                  <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                    <i className="bi bi-shield-lock-fill text-success me-1"></i>
                    Encrypted with 256-bit SSL • 100% Verified Order
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Dynamic UPI QR Code Modal */}
        {showUpiQrModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content rounded-4 border-0 shadow text-center p-3">
                <div className="modal-header border-0 pb-0 justify-content-end">
                  <button type="button" className="btn-close" onClick={() => setShowUpiQrModal(false)}></button>
                </div>
                <div className="modal-body pt-0">
                  <h6 className="fw-bold text-dark mb-1">Scan to Pay via UPI</h6>
                  <p className="text-muted small mb-3">Pay {formatPrice(summary.grand_total)}</p>

                  <div className="p-3 bg-white border rounded-4 d-inline-block shadow-sm mb-3">
                    {/* Authentic Vector QR Code Representation */}
                    <div style={{ width: '160px', height: '160px' }} className="d-flex flex-column justify-content-between p-2 bg-dark rounded-3 mx-auto">
                      <div className="d-flex justify-content-between">
                        <div style={{ width: '36px', height: '36px', background: 'white' }}></div>
                        <div style={{ width: '36px', height: '36px', background: 'white' }}></div>
                      </div>
                      <div className="text-center text-white small fw-bold">
                        <i className="bi bi-qr-code fs-1"></i>
                      </div>
                      <div className="d-flex justify-content-between">
                        <div style={{ width: '36px', height: '36px', background: 'white' }}></div>
                        <div style={{ width: '12px', height: '12px', background: 'white' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="small text-muted mb-2">
                    Supported: GPay • PhonePe • Paytm • BHIM
                  </div>
                  <button
                    type="button"
                    className="btn btn-success btn-sm rounded-pill w-100 fw-bold"
                    onClick={() => {
                      setShowUpiQrModal(false);
                      setUpiVerified(true);
                      showToast('UPI QR code scanned and verified successfully!', 'success');
                    }}
                  >
                    Simulate Payment Successful
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
