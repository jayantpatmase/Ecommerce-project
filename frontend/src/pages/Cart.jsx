import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import CartItem from '../components/CartItem';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Cart() {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Available Coupons & Active Coupon State
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // SuperCoins / Reward Coins State
  const [redeemCoins, setRedeemCoins] = useState(false);
  const userCoins = user?.reward_coins || 120;

  // Saved for Later state
  const [savedForLater, setSavedForLater] = useState([]);

  // Load Saved for Later from localStorage
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem('eshop_saved_for_later');
      if (rawSaved) {
        setSavedForLater(JSON.parse(rawSaved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [cartRes, couponRes] = await Promise.all([
        api.getCart(),
        api.getCoupons()
      ]);

      if (cartRes.success) {
        setCart(cartRes.data);
      } else {
        setError(cartRes.message);
      }

      if (couponRes.success) {
        setCoupons(couponRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch cart contents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const handleQuantityChange = async (cartId, newQuantity) => {
    try {
      setUpdating(true);
      await api.updateCart(cartId, newQuantity);
      await loadCart();
      await refreshCounts();
      showToast('Cart quantity updated', 'info');
    } catch (err) {
      showToast(err.message || 'Could not update item quantity.', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      setUpdating(true);
      await api.removeFromCart(cartId);
      await loadCart();
      await refreshCounts();
      showToast('Item removed from cart', 'info');
    } catch (err) {
      showToast(err.message || 'Could not remove item.', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  // Amazon-style "Save for Later"
  const handleSaveForLater = async (item) => {
    try {
      setUpdating(true);
      await api.removeFromCart(item.cart_id);
      
      const updatedSaved = [
        ...savedForLater.filter((s) => s.product_id !== item.product_id),
        {
          product_id: item.product_id,
          name: item.name,
          final_price: item.final_price,
          price: item.price,
          discount: item.discount,
          image: item.image,
          quantity: item.quantity,
          category_name: item.category_name
        }
      ];
      setSavedForLater(updatedSaved);
      localStorage.setItem('eshop_saved_for_later', JSON.stringify(updatedSaved));

      await loadCart();
      await refreshCounts();
      showToast(`"${item.name}" moved to Saved for Later.`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not save item for later.', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  // Move back from Saved for Later to Cart
  const handleMoveToCart = async (item) => {
    try {
      setUpdating(true);
      await api.addToCart(item.product_id, item.quantity || 1);
      const updatedSaved = savedForLater.filter((s) => s.product_id !== item.product_id);
      setSavedForLater(updatedSaved);
      localStorage.setItem('eshop_saved_for_later', JSON.stringify(updatedSaved));

      await loadCart();
      await refreshCounts();
      showToast(`"${item.name}" moved back to your cart!`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not move item to cart.', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  // Delete from Saved for Later
  const handleDeleteSavedItem = (productId) => {
    const updated = savedForLater.filter((s) => s.product_id !== productId);
    setSavedForLater(updated);
    localStorage.setItem('eshop_saved_for_later', JSON.stringify(updated));
    showToast('Item removed from Saved for Later.', 'info');
  };

  // Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const targetCode = (codeToApply || couponInput).trim().toUpperCase();
    if (!targetCode) {
      showToast('Please enter a coupon code.', 'warning');
      return;
    }

    try {
      setValidatingCoupon(true);
      const subtotal = cart?.summary?.subtotal || 0;
      const res = await api.validateCoupon(targetCode, subtotal);
      if (res.success) {
        setAppliedCoupon(res.data);
        setShowCouponModal(false);
        setCouponInput('');
        showToast(res.message || `Coupon ${targetCode} applied!`, 'success');
      } else {
        showToast(res.message || 'Could not apply coupon.', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Invalid coupon code.', 'danger');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed from cart.', 'info');
  };

  if (!user) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-person-lock"
          title="Sign in to view your cart"
          description="Your cart is tied to your account so you can shop safely across devices."
          actionText="Log In Now"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading) return <Loading message="Loading your shopping cart..." />;

  const items = cart?.items || [];
  const baseSummary = cart?.summary || { subtotal: 0, discount_total: 0, shipping: 0, grand_total: 0, total_quantity: 0 };

  // Calculate discounts
  const couponDiscountAmount = appliedCoupon?.discount_amount || 0;
  const eligibleCoins = Math.min(userCoins, 50, Math.floor(baseSummary.subtotal * 0.1));
  const coinsDiscountAmount = redeemCoins ? eligibleCoins : 0;

  // Effective grand total
  const adjustedGrandTotal = Math.max(0, Math.round((baseSummary.grand_total - couponDiscountAmount - coinsDiscountAmount) * 100) / 100);

  // Free delivery threshold calculation (₹999)
  const freeDeliveryThreshold = 999;
  const freeDeliveryProgress = Math.min(100, Math.round((baseSummary.subtotal / freeDeliveryThreshold) * 100));
  const amountForFreeDelivery = Math.max(0, Math.round(freeDeliveryThreshold - baseSummary.subtotal));

  // Proceed to Checkout handler
  const handleProceedToCheckout = () => {
    // Store in sessionStorage for persistence across page refreshes
    if (appliedCoupon) {
      sessionStorage.setItem('eshop_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      sessionStorage.removeItem('eshop_applied_coupon');
    }
    sessionStorage.setItem('eshop_redeemed_coins', coinsDiscountAmount.toString());

    navigate('/checkout', {
      state: {
        appliedCoupon,
        coinsRedeemed: coinsDiscountAmount
      }
    });
  };

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        {/* Title Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-extrabold text-dark mb-0">
              Shopping Cart {items.length > 0 && <span className="text-muted fs-5">({items.length} item{items.length === 1 ? '' : 's'})</span>}
            </h2>
            <span className="text-muted small">Pan-India doorstep delivery with 100% verified products</span>
          </div>
          <span className="badge bg-white text-dark border px-3 py-2 small shadow-sm rounded-pill">
            🪙 Your Balance: <strong className="text-warning-emphasis">{userCoins} SuperCoins</strong>
          </span>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadCart} />}

        {items.length === 0 ? (
          <div>
            <EmptyState
              icon="bi-cart-x"
              title="Your shopping cart is empty"
              description="Looks like you haven't added any products to your cart yet. Discover our fresh collection today!"
              actionText="Start Shopping"
              actionLink="/products"
            />

            {/* If there are items in Saved for Later, show them! */}
            {savedForLater.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mt-4">
                <h5 className="fw-bold text-dark mb-3">Saved for Later ({savedForLater.length} items)</h5>
                <div className="row g-3">
                  {savedForLater.map((sItem) => (
                    <div key={sItem.product_id} className="col-md-6 col-lg-4">
                      <div className="card border rounded-3 p-3 h-100 d-flex flex-column">
                        <div className="d-flex gap-3 mb-3">
                          <div style={{ width: '60px', height: '60px' }} className="rounded-3 bg-light p-1 border overflow-hidden flex-shrink-0">
                            <img
                              src={sItem.image || '/uploads/products/placeholder.svg'}
                              alt={sItem.name}
                              className="w-100 h-100 object-fit-contain"
                              onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                            />
                          </div>
                          <div>
                            <span className="fw-bold text-dark small d-block line-clamp-2">{sItem.name}</span>
                            <span className="fw-bold text-primary small">{formatPrice(sItem.final_price)}</span>
                          </div>
                        </div>
                        <div className="mt-auto d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm rounded-pill flex-grow-1 fw-semibold"
                            onClick={() => handleMoveToCart(sItem)}
                            disabled={updating}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Move to Cart
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => handleDeleteSavedItem(sItem.product_id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {/* LEFT COLUMN: Cart Items & Saved for Later */}
            <div className="col-lg-8">
              {/* Free Delivery Flipkart-style Progress Meter */}
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 small">
                  <span className="fw-bold text-dark">
                    <i className="bi bi-truck text-primary me-1"></i> Pan-India Free Delivery
                  </span>
                  <span className="fw-semibold text-secondary">
                    {amountForFreeDelivery > 0 ? (
                      <>Add <strong>{formatPrice(amountForFreeDelivery)}</strong> more to get FREE Delivery</>
                    ) : (
                      <span className="text-success fw-bold">🎉 FREE Delivery Unlocked!</span>
                    )}
                  </span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div
                    className={`progress-bar ${amountForFreeDelivery === 0 ? 'bg-success' : 'bg-primary'}`}
                    role="progressbar"
                    style={{ width: `${freeDeliveryProgress}%`, transition: 'width 0.5s ease' }}
                  ></div>
                </div>
              </div>

              {/* Items List */}
              {items.map((item) => (
                <CartItem
                  key={item.cart_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  onSaveForLater={handleSaveForLater}
                  updating={updating}
                />
              ))}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                  <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                </Link>
              </div>

              {/* SAVED FOR LATER SECTION (Amazon Cart Style) */}
              {savedForLater.length > 0 && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mt-4">
                  <h5 className="fw-bold text-dark mb-1">Saved for Later ({savedForLater.length} items)</h5>
                  <p className="text-muted small mb-3">Items you saved to purchase at a later time</p>

                  <div className="row g-3">
                    {savedForLater.map((sItem) => (
                      <div key={sItem.product_id} className="col-md-6">
                        <div className="card border rounded-3 p-3 h-100 d-flex flex-column">
                          <div className="d-flex gap-3 mb-3">
                            <div style={{ width: '64px', height: '64px' }} className="rounded-3 bg-light p-1 border overflow-hidden flex-shrink-0">
                              <img
                                src={sItem.image || '/uploads/products/placeholder.svg'}
                                alt={sItem.name}
                                className="w-100 h-100 object-fit-contain"
                                onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                              />
                            </div>
                            <div>
                              <span className="fw-bold text-dark small d-block">{sItem.name}</span>
                              <span className="fw-bold text-primary small">{formatPrice(sItem.final_price)}</span>
                              {sItem.discount > 0 && (
                                <span className="text-muted text-decoration-line-through ms-2 small">
                                  {formatPrice(sItem.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-auto d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm rounded-pill flex-grow-1 fw-semibold"
                              onClick={() => handleMoveToCart(sItem)}
                              disabled={updating}
                            >
                              <i className="bi bi-cart-plus me-1"></i> Move to Cart
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              onClick={() => handleDeleteSavedItem(sItem.product_id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Coupons, SuperCoins & Order Summary */}
            <div className="col-lg-4">
              {/* COUPON PROMO CARD */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-ticket-perforated-fill text-primary"></i> Coupons &amp; Offers
                  </h6>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary small fw-semibold text-decoration-none"
                    onClick={() => setShowCouponModal(true)}
                  >
                    View All ({coupons.length})
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-success-subtle rounded-3 border border-success border-opacity-25 mt-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success fw-bold px-2 py-1 me-2">{appliedCoupon.code}</span>
                        <span className="text-success fw-bold small">
                          Applied: -{formatPrice(appliedCoupon.discount_amount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm text-danger p-0 fw-semibold"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                      {appliedCoupon.description}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      />
                      <button
                        className="btn btn-primary fw-semibold px-3"
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={validatingCoupon}
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {coupons.slice(0, 2).map((cp) => (
                        <button
                          key={cp.id}
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-0 px-2 rounded-pill small"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => handleApplyCoupon(cp.code)}
                        >
                          Use <strong>{cp.code}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SUPERCOINS REDEMPTION (Flipkart style) */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                <div className="form-check d-flex align-items-center justify-content-between ps-0">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="checkbox"
                      id="redeemSuperCoins"
                      checked={redeemCoins}
                      onChange={(e) => setRedeemCoins(e.target.checked)}
                      disabled={eligibleCoins <= 0}
                    />
                    <label className="form-check-label small fw-semibold text-dark m-0" htmlFor="redeemSuperCoins" style={{ cursor: 'pointer' }}>
                      🪙 Redeem SuperCoins ({eligibleCoins} available)
                    </label>
                  </div>
                  {redeemCoins && (
                    <span className="badge bg-success-subtle text-success fw-bold">
                      -{formatPrice(coinsDiscountAmount)}
                    </span>
                  )}
                </div>
                <div className="text-muted small mt-1 ps-4" style={{ fontSize: '0.75rem' }}>
                  1 SuperCoin = ₹1 discount on this order.
                </div>
              </div>

              {/* ORDER SUMMARY CHECKOUT CARD */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Price Details</h5>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Price ({baseSummary.total_quantity} items)</span>
                  <span className="fw-semibold text-dark">{formatPrice(baseSummary.subtotal)}</span>
                </div>

                {baseSummary.discount_total > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Discount Savings</span>
                    <span className="fw-semibold">-{formatPrice(baseSummary.discount_total)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span className="fw-semibold">-{formatPrice(couponDiscountAmount)}</span>
                  </div>
                )}

                {redeemCoins && coinsDiscountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>SuperCoins Redeemed ({coinsDiscountAmount})</span>
                    <span className="fw-semibold">-{formatPrice(coinsDiscountAmount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Delivery Charges</span>
                  <span className="fw-semibold text-dark">
                    {baseSummary.shipping === 0 ? (
                      <span className="badge bg-success-subtle text-success">FREE</span>
                    ) : (
                      formatPrice(baseSummary.shipping)
                    )}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-6 fw-bold text-dark">Total Amount</span>
                  <span className="fs-4 fw-extrabold text-primary">{formatPrice(adjustedGrandTotal)}</span>
                </div>

                {(couponDiscountAmount > 0 || coinsDiscountAmount > 0 || baseSummary.discount_total > 0) && (
                  <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 text-center fw-semibold" style={{ fontSize: '0.8rem' }}>
                    🎉 You will save{' '}
                    <strong>
                      {formatPrice(baseSummary.discount_total + couponDiscountAmount + coinsDiscountAmount)}
                    </strong>{' '}
                    on this order!
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={handleProceedToCheckout}
                  disabled={updating || items.some((i) => !i.is_available)}
                >
                  <span>Proceed to Checkout</span>
                  <i className="bi bi-arrow-right"></i>
                </button>

                <div className="mt-3 text-center text-muted small" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-shield-check text-success me-1"></i> Safe &amp; Secure Indian Payments
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: VIEW ALL COUPONS */}
      {showCouponModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill text-primary"></i> Available Promo Coupons
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCouponModal(false)}></button>
              </div>
              <div className="modal-body pt-3">
                <div className="d-flex flex-column gap-3">
                  {coupons.map((cp) => {
                    const isMinReached = baseSummary.subtotal >= Number(cp.min_order_amount);
                    return (
                      <div
                        key={cp.id}
                        className={`card border rounded-3 p-3 ${
                          isMinReached ? 'bg-light' : 'bg-light opacity-75'
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge bg-primary fs-6 px-3 py-1 mb-1">{cp.code}</span>
                            <div className="fw-semibold text-dark small">{cp.description}</div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              Min Cart Total: {formatPrice(cp.min_order_amount)}
                              {cp.max_discount && ` • Max Discount: ${formatPrice(cp.max_discount)}`}
                            </div>
                          </div>
                          <div>
                            {isMinReached ? (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                                onClick={() => handleApplyCoupon(cp.code)}
                                disabled={validatingCoupon}
                              >
                                Apply
                              </button>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary small">
                                Add {formatPrice(cp.min_order_amount - baseSummary.subtotal)} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowCouponModal(false)}>
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
