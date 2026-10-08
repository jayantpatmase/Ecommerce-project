import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice, INDIAN_STATES } from '../utils/format';

// Helper: Web Audio API pleasant payment success chime
const playPaymentChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.14); // A5
    gain2.gain.setValueAtTime(0.18, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.55);
  } catch {
    // Autoplay restrictions or audio unsupported
  }
};

// Helper: Real-time Card Brand detection
const detectCardBrand = (num = '') => {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'Visa', color: '#1a1f71', badge: 'Visa', logo: 'bi-credit-card-2-front-fill' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: '#eb001b', badge: 'Mastercard', logo: 'bi-credit-card-fill' };
  if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: '#097939', badge: 'RuPay', logo: 'bi-shield-check' };
  if (/^3[47]/.test(clean)) return { name: 'Amex', color: '#006fcf', badge: 'American Express', logo: 'bi-credit-card-2-back-fill' };
  return { name: 'Debit/Credit', color: '#475569', badge: 'Card', logo: 'bi-credit-card' };
};

export default function Checkout() {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Coupon & SuperCoins state
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    if (location.state?.appliedCoupon) return location.state.appliedCoupon;
    try {
      const stored = sessionStorage.getItem('eshop_applied_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [coinsRedeemed, setCoinsRedeemed] = useState(() => {
    if (typeof location.state?.coinsRedeemed === 'number') return location.state.coinsRedeemed;
    try {
      const stored = sessionStorage.getItem('eshop_redeemed_coins');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Address Book state
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

  // Payment Method Selection
  // 'upi' | 'card' | 'netbanking' | 'cod'
  const [paymentType, setPaymentType] = useState('upi');

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiMode, setUpiMode] = useState('app'); // 'app' | 'id' | 'qr'

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardToken, setSaveCardToken] = useState(true);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [customBank, setCustomBank] = useState('');

  // Cash on Delivery Captcha
  const [captchaCode, setCaptchaCode] = useState('4829');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  // -------------------------------------------------------------
  // REAL-LIFE PAYMENT GATEWAY MODAL STATES
  // -------------------------------------------------------------
  // activeGateway: null | 'card_otp' | 'upi_approval' | 'netbanking_portal' | 'upi_qr'
  const [activeGateway, setActiveGateway] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null); // { orderId, transactionId, amount, method, ... }
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [gatewayError, setGatewayError] = useState(null);
  const [paymentSuccessScreen, setPaymentSuccessScreen] = useState(false);

  // 3D Secure Card OTP State
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);
  const [otpTimer, setOtpTimer] = useState(30);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Net Banking Portal State
  const [nbUsername, setNbUsername] = useState('USER_9820150');
  const [nbPassword, setNbPassword] = useState('••••••••');

  // UPI Countdown timer (5 minutes = 300s)
  const [upiTimer, setUpiTimer] = useState(300);

  // Initialize
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Generate random 4-digit captcha
    setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
    setCardName(user.name || '');

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

  // Countdown timer effect when Gateway is active
  useEffect(() => {
    let interval = null;
    if (activeGateway === 'card_otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeGateway, otpTimer]);

  useEffect(() => {
    let interval = null;
    if ((activeGateway === 'upi_approval' || activeGateway === 'upi_qr') && upiTimer > 0) {
      interval = setInterval(() => setUpiTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeGateway, upiTimer]);

  // Card Formatting Handlers
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
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

  // OTP Box Navigation
  const handleOtpDigitChange = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    // Auto-advance
    if (digit && index < 5 && otpRefs[index + 1]?.current) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pasted.length > 0) {
      const arr = pasted.split('');
      while (arr.length < 6) arr.push('');
      setOtpDigits(arr);
      otpRefs[Math.min(pasted.length, 5)]?.current?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    setOtpDigits(['4', '8', '2', '9', '1', '0']);
    showToast('Demo OTP 482910 filled automatically!', 'info');
  };

  const handleVerifyUpiVpa = () => {
    if (!upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)', 'warning');
      return;
    }
    setUpiVerified(true);
    showToast(`Verified UPI ID: ${upiId} (${user?.name || 'Verified Customer'})`, 'success');
  };

  const handleAppendUpiDomain = (domain) => {
    const prefix = upiId.split('@')[0] || (user?.email?.split('@')[0] || 'customer');
    const full = `${prefix}${domain}`;
    setUpiId(full);
    setUpiVerified(true);
    showToast(`Set UPI VPA: ${full}`, 'info');
  };

  // Save new address
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

  // Calculate Totals
  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, shipping: 0, grand_total: 0 };
  const couponDiscountAmount = appliedCoupon?.discount_amount || 0;
  const coinsDiscountAmount = coinsRedeemed || 0;
  const finalPayable = Math.max(0, Math.round((summary.grand_total - couponDiscountAmount - coinsDiscountAmount) * 100) / 100);
  const gstAmount = Math.round((summary.subtotal * 0.18) * 100) / 100;
  const cardInfo = detectCardBrand(cardNumber);

  // -------------------------------------------------------------
  // MASTER ORDER & PAYMENT FLOW
  // -------------------------------------------------------------
  const handleInitiateOrder = async (e) => {
    e.preventDefault();

    // 1. Resolve Shipping Address
    let fullShippingAddress = '';
    if (selectedAddressId && !showNewAddressForm) {
      const chosen = savedAddresses.find((a) => a.id === selectedAddressId);
      if (chosen) {
        fullShippingAddress = `${chosen.full_name}, ${chosen.flat_no}, ${chosen.street}, ${chosen.landmark ? chosen.landmark + ', ' : ''}${chosen.city}, ${chosen.state} - ${chosen.pincode}, Phone: ${chosen.phone}`;
      }
    } else {
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

    // 2. Validate Payment Inputs
    if (paymentType === 'cod') {
      if (enteredCaptcha.trim() !== captchaCode) {
        setError('Incorrect security captcha code. Please re-enter the 4 digits shown below.');
        return;
      }
    } else if (paymentType === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a complete 16-digit Debit / Credit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setError('Please enter card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setError('Please enter 3-digit CVV from the back of your card.');
        return;
      }
    } else if (paymentType === 'upi' && upiMode === 'id' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank) or select an instant UPI app.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Determine Canonical Payment Method String for backend
      let canonicalMethod = 'Online Payment';
      if (paymentType === 'cod') canonicalMethod = 'Cash on Delivery';
      else if (paymentType === 'upi') canonicalMethod = 'UPI (Google Pay / PhonePe / Paytm / BHIM)';
      else if (paymentType === 'card') canonicalMethod = 'Credit/Debit Card (RuPay/Visa/Mastercard)';
      else if (paymentType === 'netbanking') canonicalMethod = 'Net Banking';

      // 3. Create Order
      const orderRes = await api.createOrder({
        shipping_address: fullShippingAddress,
        payment_method: canonicalMethod,
        coupon_code: appliedCoupon?.code || '',
        coins_redeemed: coinsRedeemed || 0
      });

      if (!orderRes.success || !orderRes.data?.order_id) {
        throw new Error(orderRes.message || 'Order creation failed.');
      }

      const orderId = orderRes.data.order_id;
      const totalAmount = orderRes.data.total_amount;

      // 4A. If Cash on Delivery -> Instant confirmation!
      if (paymentType === 'cod') {
        sessionStorage.removeItem('eshop_applied_coupon');
        sessionStorage.removeItem('eshop_redeemed_coins');
        await refreshCounts();
        showToast(`Order #${orderId} confirmed via Doorstep COD!`, 'success');
        navigate(`/order-success?order_id=${orderId}`, {
          state: {
            orderId,
            totalAmount,
            paymentMethod: canonicalMethod,
            paymentStatus: 'pending',
            orderStatus: 'confirmed'
          }
        });
        return;
      }

      // 4B. If Online Payment -> Initiate Payment Intent & Launch Authentic Gateway
      const payRes = await api.createPayment(orderId);
      if (!payRes.success || !payRes.data?.transaction_id) {
        throw new Error(payRes.message || 'Could not initiate payment session.');
      }

      const transactionId = payRes.data.transaction_id;

      // Prepare session details for Gateway Modal
      const sessionData = {
        orderId,
        transactionId,
        amount: totalAmount,
        method: canonicalMethod,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4) || '8890',
        cardBrand: cardInfo.name,
        bankName: paymentType === 'netbanking' ? (customBank || selectedBank) : 'HDFC Bank',
        upiApp: selectedUpiApp,
        upiVpa: upiId || `${user?.name?.toLowerCase().replace(/\s/g, '') || 'customer'}@okhdfcbank`
      };

      setPaymentSession(sessionData);
      setGatewayError(null);
      setOtpTimer(30);
      setUpiTimer(300);

      // Open Gateway Modal matching selected payment method
      if (paymentType === 'card') {
        setActiveGateway('card_otp');
      } else if (paymentType === 'upi') {
        setActiveGateway(upiMode === 'qr' ? 'upi_qr' : 'upi_approval');
      } else if (paymentType === 'netbanking') {
        setActiveGateway('netbanking_portal');
      }

    } catch (err) {
      setError(err.message || 'Order could not be processed. Please check details or retry.');
    } finally {
      setProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // VERIFY PAYMENT ACTION (OTP / UPI / NETBANKING)
  // -------------------------------------------------------------
  const handleVerifyGatewayPayment = async (simulateDecline = false) => {
    if (!paymentSession) return;

    try {
      setGatewayProcessing(true);
      setGatewayError(null);

      // Call backend verification API
      const verifyRes = await api.verifyPayment({
        order_id: paymentSession.orderId,
        transaction_id: paymentSession.transactionId,
        simulate_failure: simulateDecline
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Payment authentication failed.');
      }

      // Payment Succeeded!
      playPaymentChime();
      setPaymentSuccessScreen(true);
      sessionStorage.removeItem('eshop_applied_coupon');
      sessionStorage.removeItem('eshop_redeemed_coins');
      await refreshCounts();

      // Show celebratory transition then navigate
      setTimeout(() => {
        setActiveGateway(null);
        navigate(`/order-success?order_id=${paymentSession.orderId}`, {
          state: {
            orderId: paymentSession.orderId,
            totalAmount: paymentSession.amount,
            paymentMethod: paymentSession.method,
            paymentStatus: 'paid',
            orderStatus: 'confirmed'
          }
        });
      }, 1500);

    } catch (err) {
      setGatewayError(err.message || 'Payment declined by issuing bank or invalid authorization code. Please retry or pick another method.');
    } finally {
      setGatewayProcessing(false);
    }
  };

  // Coupon Handlers
  const handleApplyCheckoutCoupon = async (e) => {
    e.preventDefault();
    const code = checkoutCouponCode.trim().toUpperCase();
    if (!code) return;
    try {
      setValidatingCoupon(true);
      const res = await api.validateCoupon(code, cart?.summary?.subtotal || 0);
      if (res.success) {
        setAppliedCoupon(res.data);
        sessionStorage.setItem('eshop_applied_coupon', JSON.stringify(res.data));
        setCheckoutCouponCode('');
        showToast(`Coupon ${code} applied successfully!`, 'success');
      } else {
        showToast(res.message || 'Invalid coupon', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Could not apply coupon', 'danger');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCheckoutCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('eshop_applied_coupon');
    showToast('Coupon removed from checkout', 'info');
  };

  if (loading) return <Loading message="Preparing secure checkout..." />;

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-extrabold text-dark mb-0">Express Checkout</h2>
            <span className="text-muted small">Real-time UPI, 3D Secure Bank Cards &amp; Pan-India Doorstep Delivery</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-white text-dark border px-3 py-2 small shadow-sm rounded-pill">
              🇮🇳 Delivering to 19,000+ PIN Codes
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 small rounded-pill fw-bold">
              <i className="bi bi-shield-check me-1"></i> RBI Compliant
            </span>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleInitiateOrder}>
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
                        <label className="form-label small fw-semibold">State *</label>
                        <select
                          className="form-select form-select-sm"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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
                      <div className="col-12 mt-2">
                        <div className="d-flex gap-2 align-items-center">
                          <span className="small fw-semibold text-secondary me-2">Type:</span>
                          {['Home', 'Work', 'Other'].map((type) => (
                            <button
                              type="button"
                              key={type}
                              className={`btn btn-sm rounded-pill px-3 ${
                                newAddressType === type ? 'btn-dark' : 'btn-outline-secondary'
                              }`}
                              onClick={() => setNewAddressType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
                          onClick={handleSaveAndSelectNewAddress}
                        >
                          Save &amp; Deliver Here
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. REAL-LIFE PAYMENT OPTIONS SECTION */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-wallet2 text-success"></i> 2. Choose Payment Method
                  </h5>
                  <div className="d-flex gap-1 align-items-center">
                    <span className="badge bg-light text-dark border rounded-pill px-2 py-1 small">
                      <i className="bi bi-lock-fill text-success me-1"></i> 256-Bit SSL
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* OPTION A: UPI (PHONEPE / GPAY / PAYTM / BHIM) */}
                  <div
                    onClick={() => setPaymentType('upi')}
                    className={`border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentType === 'upi'
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                        : 'bg-white hover-border-primary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_type"
                          checked={paymentType === 'upi'}
                          onChange={() => setPaymentType('upi')}
                        />
                        <span className="fw-bold text-dark">UPI (Instant &amp; Zero Fee)</span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0 small fw-bold">
                          ⚡ Instant Bank Transfer
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <span className="badge bg-primary rounded-pill px-2">PhonePe</span>
                        <span className="badge bg-dark rounded-pill px-2">GPay</span>
                        <span className="badge bg-info text-dark rounded-pill px-2">Paytm</span>
                        <span className="badge bg-secondary rounded-pill px-2">BHIM</span>
                      </div>
                    </div>

                    {paymentType === 'upi' && (
                      <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                        {/* UPI Modes: Instant App vs Enter UPI ID vs Dynamic QR */}
                        <div className="btn-group btn-group-sm w-100 mb-3 rounded-pill p-1 bg-light border">
                          <button
                            type="button"
                            className={`btn rounded-pill fw-semibold ${upiMode === 'app' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-secondary'}`}
                            onClick={() => setUpiMode('app')}
                          >
                            <i className="bi bi-phone me-1"></i> UPI Apps
                          </button>
                          <button
                            type="button"
                            className={`btn rounded-pill fw-semibold ${upiMode === 'id' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-secondary'}`}
                            onClick={() => setUpiMode('id')}
                          >
                            <i className="bi bi-at me-1"></i> Enter UPI ID
                          </button>
                          <button
                            type="button"
                            className={`btn rounded-pill fw-semibold ${upiMode === 'qr' ? 'btn-white shadow-sm fw-bold' : 'btn-light text-secondary'}`}
                            onClick={() => setUpiMode('qr')}
                          >
                            <i className="bi bi-qr-code-scan me-1"></i> Scan QR Code
                          </button>
                        </div>

                        {/* MODE 1: UPI APPS */}
                        {upiMode === 'app' && (
                          <div>
                            <div className="small text-secondary mb-2 fw-semibold">Choose your UPI App to approve request:</div>
                            <div className="row g-2">
                              {[
                                { name: 'PhonePe', icon: 'bi-phone', color: '#5f259f' },
                                { name: 'Google Pay', icon: 'bi-google', color: '#1a73e8' },
                                { name: 'Paytm UPI', icon: 'bi-wallet2', color: '#00baf2' },
                                { name: 'CRED UPI', icon: 'bi-gem', color: '#111827' },
                                { name: 'BHIM UPI', icon: 'bi-shield-shaded', color: '#00843d' }
                              ].map((app) => (
                                <div key={app.name} className="col-6 col-sm-4">
                                  <div
                                    onClick={() => setSelectedUpiApp(app.name)}
                                    className={`p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                      selectedUpiApp === app.name ? 'border-2 border-primary bg-white shadow-sm' : 'bg-light'
                                    }`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div
                                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                      style={{ width: '28px', height: '28px', backgroundColor: app.color, fontSize: '0.8rem' }}
                                    >
                                      <i className={`bi ${app.icon}`}></i>
                                    </div>
                                    <span className="small fw-bold text-dark">{app.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="small text-muted mt-2">
                              <i className="bi bi-info-circle me-1"></i> A payment collect request of <strong>{formatPrice(finalPayable)}</strong> will be sent to your chosen app upon clicking Pay.
                            </div>
                          </div>
                        )}

                        {/* MODE 2: ENTER UPI ID */}
                        {upiMode === 'id' && (
                          <div>
                            <label className="form-label small fw-semibold text-secondary">
                              Enter your Virtual Payment Address (VPA / UPI ID)
                            </label>
                            <div className="input-group input-group-sm mb-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. yourname@okhdfcbank"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value);
                                  setUpiVerified(false);
                                }}
                              />
                              <button
                                type="button"
                                className={`btn ${upiVerified ? 'btn-success' : 'btn-outline-primary'} fw-semibold`}
                                onClick={handleVerifyUpiVpa}
                              >
                                {upiVerified ? <><i className="bi bi-check-lg"></i> Verified</> : 'Verify VPA'}
                              </button>
                            </div>

                            {/* Quick handle pills */}
                            <div className="d-flex flex-wrap gap-1 align-items-center">
                              <span className="small text-muted me-1" style={{ fontSize: '0.75rem' }}>Quick append:</span>
                              {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@ibl', '@axl'].map((handle) => (
                                <button
                                  type="button"
                                  key={handle}
                                  className="btn btn-outline-secondary btn-sm py-0 px-2 rounded-pill"
                                  style={{ fontSize: '0.72rem' }}
                                  onClick={() => handleAppendUpiDomain(handle)}
                                >
                                  {handle}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MODE 3: DYNAMIC QR CODE PREVIEW */}
                        {upiMode === 'qr' && (
                          <div className="p-3 bg-white rounded-3 border text-center">
                            <span className="badge bg-dark rounded-pill px-3 py-1 mb-2">
                              <i className="bi bi-qr-code me-1"></i> BHIM UPI Dynamic QR
                            </span>
                            <div className="small text-secondary mb-2">
                              Scan with any app (GPay, PhonePe, Paytm, CRED) to pay <strong>{formatPrice(finalPayable)}</strong>
                            </div>
                            <div className="d-inline-block p-2 bg-light border rounded-3 shadow-sm mb-2">
                              {/* Vector QR representation */}
                              <div style={{ width: '130px', height: '130px' }} className="d-flex flex-column justify-content-between p-2 bg-dark rounded-2 mx-auto">
                                <div className="d-flex justify-content-between">
                                  <div style={{ width: '30px', height: '30px', background: 'white' }}></div>
                                  <div style={{ width: '30px', height: '30px', background: 'white' }}></div>
                                </div>
                                <div className="text-center text-white small fw-bold">
                                  <i className="bi bi-qr-code fs-2"></i>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <div style={{ width: '30px', height: '30px', background: 'white' }}></div>
                                  <div style={{ width: '10px', height: '10px', background: 'white' }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              Instant auto-verification upon scanning and PIN approval
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* OPTION B: CREDIT / DEBIT / RUPAY CARDS */}
                  <div
                    onClick={() => setPaymentType('card')}
                    className={`border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentType === 'card'
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                        : 'bg-white hover-border-primary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_type"
                          checked={paymentType === 'card'}
                          onChange={() => setPaymentType('card')}
                        />
                        <span className="fw-bold text-dark">Credit / Debit / RuPay Cards</span>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0 small fw-bold">
                          3D Secure OTP
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <span className="badge bg-success rounded-pill px-2">RuPay</span>
                        <span className="badge bg-primary rounded-pill px-2">Visa</span>
                        <span className="badge bg-danger rounded-pill px-2">MasterCard</span>
                      </div>
                    </div>

                    {paymentType === 'card' && (
                      <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                              <span>Card Number</span>
                              <span className="badge bg-dark rounded-pill px-2" style={{ backgroundColor: cardInfo.color }}>
                                <i className={`bi ${cardInfo.logo} me-1`}></i> {cardInfo.badge}
                              </span>
                            </label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-white"><i className={`bi ${cardInfo.logo}`}></i></span>
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
                              maxLength="4"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            />
                          </div>
                          <div className="col-12 mt-2">
                            <div className="form-check small text-secondary">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="saveCardToken"
                                checked={saveCardToken}
                                onChange={(e) => setSaveCardToken(e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="saveCardToken" style={{ fontSize: '0.76rem' }}>
                                <i className="bi bi-shield-check text-success me-1"></i>
                                Save card securely via RBI Tokenization guidelines (Zero raw card numbers stored).
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION C: NET BANKING */}
                  <div
                    onClick={() => setPaymentType('netbanking')}
                    className={`border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentType === 'netbanking'
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                        : 'bg-white hover-border-primary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_type"
                          checked={paymentType === 'netbanking'}
                          onChange={() => setPaymentType('netbanking')}
                        />
                        <span className="fw-bold text-dark">Net Banking</span>
                      </div>
                      <span className="badge bg-light text-dark border rounded-pill px-2">40+ Indian Banks</span>
                    </div>

                    {paymentType === 'netbanking' && (
                      <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                        <div className="small text-secondary mb-2 fw-semibold">Popular Indian Banks:</div>
                        <div className="row g-2 mb-3">
                          {[
                            { name: 'HDFC Bank', code: 'HDFC' },
                            { name: 'State Bank of India', code: 'SBI' },
                            { name: 'ICICI Bank', code: 'ICICI' },
                            { name: 'Axis Bank', code: 'AXIS' },
                            { name: 'Kotak Mahindra Bank', code: 'KOTAK' },
                            { name: 'Punjab National Bank', code: 'PNB' }
                          ].map((bank) => (
                            <div key={bank.name} className="col-6 col-sm-4">
                              <div
                                onClick={() => { setSelectedBank(bank.name); setCustomBank(''); }}
                                className={`p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                  selectedBank === bank.name && !customBank ? 'border-2 border-primary bg-white shadow-sm' : 'bg-light'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="badge bg-dark rounded-pill px-2 py-1 small">{bank.code}</span>
                                <span className="small fw-semibold text-truncate">{bank.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <label className="form-label small fw-semibold text-secondary">Or Select from Other Indian Banks</label>
                        <select
                          className="form-select form-select-sm"
                          value={customBank}
                          onChange={(e) => {
                            setCustomBank(e.target.value);
                            if (e.target.value) setSelectedBank(e.target.value);
                          }}
                        >
                          <option value="">-- View All 40+ Commercial Banks --</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Union Bank of India">Union Bank of India</option>
                          <option value="IndusInd Bank">IndusInd Bank</option>
                          <option value="Federal Bank">Federal Bank</option>
                          <option value="IDBI Bank">IDBI Bank</option>
                          <option value="Indian Bank">Indian Bank</option>
                          <option value="YES Bank">YES Bank</option>
                          <option value="Bank of India">Bank of India</option>
                          <option value="Central Bank of India">Central Bank of India</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* OPTION D: CASH ON DELIVERY (COD) */}
                  <div
                    onClick={() => setPaymentType('cod')}
                    className={`border rounded-4 p-3 cursor-pointer transition-all ${
                      paymentType === 'cod'
                        ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                        : 'bg-white hover-border-primary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="payment_type"
                          checked={paymentType === 'cod'}
                          onChange={() => setPaymentType('cod')}
                        />
                        <span className="fw-bold text-dark">Cash on Delivery (COD)</span>
                      </div>
                      <span className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill px-2 py-0 small fw-bold">
                        Pay at Doorstep
                      </span>
                    </div>

                    {paymentType === 'cod' && (
                      <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                        <p className="small text-muted mb-2">
                          <i className="bi bi-shield-check text-success me-1"></i> You can pay via Cash, Card, or UPI QR code to the Blue Dart delivery agent upon arrival.
                        </p>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <label className="form-label small fw-semibold text-secondary mb-0">
                            Anti-Bot Security Code:
                          </label>
                          <div
                            className="px-3 py-1 bg-dark text-warning rounded-3 fw-extrabold letter-spacing-2 user-select-none shadow-sm"
                            style={{ letterSpacing: '4px', fontSize: '1.1rem', fontFamily: 'monospace' }}
                          >
                            {captchaCode}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
                            onClick={() => setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString())}
                            title="Refresh Security Code"
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                        </div>
                        <div className="input-group input-group-sm mt-2" style={{ maxWidth: '240px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 4 digits"
                            maxLength="4"
                            value={enteredCaptcha}
                            onChange={(e) => setEnteredCaptcha(e.target.value)}
                            required={paymentType === 'cod'}
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

                {/* Coupon applied or input in Checkout */}
                <div className="mb-3 p-3 bg-light rounded-3 border">
                  {appliedCoupon ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success fw-bold me-2">{appliedCoupon.code}</span>
                        <span className="small text-success fw-semibold">Saved {formatPrice(couponDiscountAmount)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0 fw-semibold text-decoration-none"
                        onClick={handleRemoveCheckoutCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="small fw-semibold text-dark mb-1">Have a Coupon Code?</div>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control text-uppercase"
                          placeholder="e.g. FESTIVE15"
                          value={checkoutCouponCode}
                          onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                        />
                        <button
                          className="btn btn-primary fw-semibold"
                          type="button"
                          onClick={handleApplyCheckoutCoupon}
                          disabled={validatingCoupon}
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Details */}
                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Items Subtotal</span>
                  <span className="fw-semibold text-dark">{formatPrice(summary.subtotal)}</span>
                </div>

                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span className="fw-semibold">-{formatPrice(couponDiscountAmount)}</span>
                  </div>
                )}

                {coinsDiscountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>SuperCoins Redeemed ({coinsDiscountAmount})</span>
                    <span className="fw-semibold">-{formatPrice(coinsDiscountAmount)}</span>
                  </div>
                )}

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
                    {formatPrice(finalPayable)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow py-3"
                  disabled={processing}
                >
                  {processing ? (
                    <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i> Initializing Gateway...</span>
                  ) : (
                    <span>
                      {paymentType === 'cod' ? 'Confirm Order (Pay on Delivery)' : `Pay ${formatPrice(finalPayable)} Securely`} <i className="bi bi-chevron-right ms-1"></i>
                    </span>
                  )}
                </button>

                <div className="mt-3 text-center">
                  <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                    <i className="bi bi-shield-lock-fill text-success me-1"></i>
                    256-Bit SSL Encrypted • NPCI / RBI Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* ============================================================= */}
        {/* MODAL 1: AUTHENTIC BANK 3D SECURE OTP MODAL (CREDIT/DEBIT CARDS) */}
        {/* ============================================================= */}
        {activeGateway === 'card_otp' && paymentSession && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                {/* Bank Header */}
                <div className="p-3 bg-dark text-white d-flex align-items-center justify-content-between border-bottom border-secondary">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary px-2 py-1 fs-6 fw-bold">
                      <i className="bi bi-bank2 me-1"></i> {paymentSession.cardBrand === 'RuPay' ? 'RuPay PaySecure' : 'HDFC Bank SecurePay'}
                    </span>
                    <span className="badge bg-secondary-subtle text-light small px-2 py-0">3D SECURE 2.0</span>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className="small text-success fw-bold">
                      <i className="bi bi-lock-fill me-1"></i> Verified by {paymentSession.cardBrand}
                    </span>
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      onClick={() => setActiveGateway(null)}
                      disabled={gatewayProcessing}
                    ></button>
                  </div>
                </div>

                <div className="modal-body p-4 bg-white text-center">
                  {paymentSuccessScreen ? (
                    <div className="py-4">
                      <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3 animate__animated animate__bounceIn">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }}></i>
                      </div>
                      <h4 className="fw-extrabold text-dark mb-1">Payment Successful!</h4>
                      <p className="text-muted small mb-0">Authorized by Issuing Bank. Redirecting to your Order Confirmation...</p>
                    </div>
                  ) : (
                    <>
                      {/* Transaction Meta Card */}
                      <div className="bg-light p-3 rounded-3 mb-3 text-start small border">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Merchant:</span>
                          <strong className="text-dark">E-Shop India Retail Pvt Ltd</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Card Number:</span>
                          <strong className="text-dark">•••• •••• •••• {paymentSession.cardLast4}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Transaction ID:</span>
                          <span className="font-monospace text-dark">{paymentSession.transactionId}</span>
                        </div>
                        <div className="d-flex justify-content-between pt-1 border-top mt-1">
                          <span className="fw-bold text-dark">Amount Payable:</span>
                          <strong className="text-primary fs-6">{formatPrice(paymentSession.amount)}</strong>
                        </div>
                      </div>

                      <h5 className="fw-bold text-dark mb-1">Enter 6-Digit Bank OTP</h5>
                      <p className="text-muted small mb-3">
                        One Time Password (OTP) has been sent to your registered mobile ending in <strong>•••••••710</strong> and email.
                      </p>

                      {gatewayError && (
                        <div className="alert alert-danger py-2 px-3 small rounded-3 text-start mb-3">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i> {gatewayError}
                        </div>
                      )}

                      {/* 6 OTP Boxes */}
                      <div className="d-flex justify-content-center gap-2 mb-3" onPaste={handlePasteOtp}>
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={otpRefs[idx]}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="form-control text-center fw-extrabold fs-4 border-2"
                            style={{ width: '48px', height: '56px', borderRadius: '12px' }}
                            disabled={gatewayProcessing}
                          />
                        ))}
                      </div>

                      {/* Helper demo button & timer */}
                      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm rounded-pill px-3 py-1 fw-semibold small"
                          onClick={handleFillDemoOtp}
                        >
                          <i className="bi bi-magic me-1"></i> Demo OTP: 482910
                        </button>
                        <span className="small text-muted">
                          {otpTimer > 0 ? (
                            <span>Resend OTP in <strong>{otpTimer}s</strong></span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                              onClick={() => { setOtpTimer(30); showToast('New OTP sent to mobile!', 'info'); }}
                            >
                              Resend OTP
                            </button>
                          )}
                        </span>
                      </div>

                      {/* Submit / Failure Simulation Buttons */}
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm"
                          onClick={() => handleVerifyGatewayPayment(false)}
                          disabled={gatewayProcessing}
                        >
                          {gatewayProcessing ? (
                            <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i> Verifying with Bank...</span>
                          ) : (
                            <span>SUBMIT OTP &amp; AUTHORIZE</span>
                          )}
                        </button>

                        <div className="d-flex justify-content-between gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill flex-grow-1"
                            onClick={() => handleVerifyGatewayPayment(true)}
                            disabled={gatewayProcessing}
                            title="Test Bank Decline scenario"
                          >
                            <i className="bi bi-slash-circle me-1"></i> Simulate Bank Decline
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={() => setActiveGateway(null)}
                            disabled={gatewayProcessing}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-center">
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-shield-shaded me-1 text-success"></i>
                          Never share your OTP or Card PIN with anyone. Bank officials will never ask for your password.
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODAL 2: UPI INSTANT APPROVAL & COLLECT REQUEST (PHONEPE/GPAY) */}
        {/* ============================================================= */}
        {activeGateway === 'upi_approval' && paymentSession && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '420px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden text-center">
                <div className="p-3 bg-dark text-white d-flex align-items-center justify-content-between border-bottom">
                  <span className="badge bg-primary px-3 py-1 fs-6 fw-bold">
                    <i className="bi bi-phone me-1"></i> {paymentSession.upiApp} UPI
                  </span>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setActiveGateway(null)}
                    disabled={gatewayProcessing}
                  ></button>
                </div>

                <div className="modal-body p-4 bg-white">
                  {paymentSuccessScreen ? (
                    <div className="py-4">
                      <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3 animate__animated animate__bounceIn">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }}></i>
                      </div>
                      <h4 className="fw-extrabold text-dark mb-1">UPI Payment Approved!</h4>
                      <p className="text-muted small mb-0">Received confirmation from NPCI. Confirming order...</p>
                    </div>
                  ) : (
                    <>
                      {/* Pulsing Radar Ring */}
                      <div className="my-3 position-relative d-inline-block">
                        <div
                          className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center mx-auto shadow-sm"
                          style={{ width: '88px', height: '88px' }}
                        >
                          <i className="bi bi-phone-vibrate text-primary fs-1 animate__animated animate__pulse animate__infinite"></i>
                        </div>
                      </div>

                      <h5 className="fw-extrabold text-dark mb-1">Approve Payment on Phone</h5>
                      <p className="text-muted small mb-2">
                        Collect request of <strong>{formatPrice(paymentSession.amount)}</strong> sent to your <strong>{paymentSession.upiApp}</strong> app.
                      </p>

                      <div className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-3">
                        <i className="bi bi-hourglass-split text-warning me-1"></i>
                        Request expires in <strong>{Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, '0')}</strong>
                      </div>

                      {gatewayError && (
                        <div className="alert alert-danger py-2 px-3 small rounded-3 text-start mb-3">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i> {gatewayError}
                        </div>
                      )}

                      <div className="bg-light p-3 rounded-3 text-start small border mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Payee VPA:</span>
                          <strong className="text-dark">eshopindia@okhdfcbank</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Payer VPA:</span>
                          <strong className="text-dark">{paymentSession.upiVpa}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Amount:</span>
                          <strong className="text-primary">{formatPrice(paymentSession.amount)}</strong>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-success btn-lg rounded-pill fw-bold shadow-sm"
                          onClick={() => handleVerifyGatewayPayment(false)}
                          disabled={gatewayProcessing}
                        >
                          {gatewayProcessing ? (
                            <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i> Confirming UPI PIN...</span>
                          ) : (
                            <span><i className="bi bi-check-lg me-1"></i> Simulate App Approval</span>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => handleVerifyGatewayPayment(true)}
                          disabled={gatewayProcessing}
                        >
                          Simulate UPI Decline / Timeout
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-link text-secondary text-decoration-none mt-1"
                          onClick={() => setActiveGateway(null)}
                          disabled={gatewayProcessing}
                        >
                          Cancel / Pay Another Way
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODAL 3: UPI DYNAMIC QR CODE SCANNER MODAL */}
        {/* ============================================================= */}
        {activeGateway === 'upi_qr' && paymentSession && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '400px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg text-center p-3">
                <div className="modal-header border-0 pb-0 justify-content-between">
                  <span className="badge bg-dark rounded-pill px-3 py-1">BHIM UPI Dynamic QR</span>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setActiveGateway(null)}
                    disabled={gatewayProcessing}
                  ></button>
                </div>

                <div className="modal-body pt-2">
                  <h6 className="fw-bold text-dark mb-1">Scan to Pay via Any UPI App</h6>
                  <p className="text-muted small mb-3">Amount: <strong className="text-primary fs-6">{formatPrice(paymentSession.amount)}</strong></p>

                  <div className="p-3 bg-white border rounded-4 d-inline-block shadow-sm mb-3">
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

                  <div className="badge bg-light text-dark border px-3 py-1 rounded-pill mb-3">
                    <i className="bi bi-clock me-1"></i>
                    Valid for {Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, '0')}
                  </div>

                  {gatewayError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 text-start mb-3">
                      {gatewayError}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-success btn-md rounded-pill w-100 fw-bold shadow-sm"
                    onClick={() => handleVerifyGatewayPayment(false)}
                    disabled={gatewayProcessing}
                  >
                    {gatewayProcessing ? 'Verifying QR Scan...' : 'Simulate QR Scan & PIN Approval'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* MODAL 4: NET BANKING PORTAL AUTHORIZATION MODAL */}
        {/* ============================================================= */}
        {activeGateway === 'netbanking_portal' && paymentSession && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="p-3 bg-dark text-white d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary px-3 py-1 fs-6 fw-bold">
                      <i className="bi bi-bank me-1"></i> {paymentSession.bankName}
                    </span>
                    <span className="small text-light">Retail Internet Banking</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setActiveGateway(null)}
                    disabled={gatewayProcessing}
                  ></button>
                </div>

                <div className="modal-body p-4 bg-white">
                  {paymentSuccessScreen ? (
                    <div className="py-4 text-center">
                      <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3 animate__animated animate__bounceIn">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }}></i>
                      </div>
                      <h4 className="fw-extrabold text-dark mb-1">Net Banking Authorized!</h4>
                      <p className="text-muted small mb-0">Funds debited from your bank account. Redirecting...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-light p-3 rounded-3 mb-3 small border">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Debit Account:</span>
                          <strong className="text-dark">Savings A/C •••• 4912</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Beneficiary:</span>
                          <strong className="text-dark">E-Shop India Pvt Ltd</strong>
                        </div>
                        <div className="d-flex justify-content-between pt-1 border-top mt-1">
                          <span className="fw-bold text-dark">Amount to Pay:</span>
                          <strong className="text-primary fs-6">{formatPrice(paymentSession.amount)}</strong>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Customer ID / User ID</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={nbUsername}
                          onChange={(e) => setNbUsername(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">Internet Banking Password / MPIN</label>
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          value={nbPassword}
                          onChange={(e) => setNbPassword(e.target.value)}
                        />
                      </div>

                      {gatewayError && (
                        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                          {gatewayError}
                        </div>
                      )}

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm"
                          onClick={() => handleVerifyGatewayPayment(false)}
                          disabled={gatewayProcessing}
                        >
                          {gatewayProcessing ? 'Authorizing with Bank...' : `Authorize & Pay ${formatPrice(paymentSession.amount)}`}
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => handleVerifyGatewayPayment(true)}
                          disabled={gatewayProcessing}
                        >
                          Simulate Bank Authorization Decline
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-link text-secondary text-decoration-none"
                          onClick={() => setActiveGateway(null)}
                          disabled={gatewayProcessing}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
