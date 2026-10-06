import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import CartItem from '../components/CartItem';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Cart() {
  const { user, refreshCounts } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCart();
      if (res.success) {
        setCart(res.data);
      } else {
        setError(res.message);
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
    } catch (err) {
      alert(err.message || 'Could not update item quantity.');
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
    } catch (err) {
      alert(err.message || 'Could not remove item.');
    } finally {
      setUpdating(false);
    }
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
  const summary = cart?.summary || { subtotal: 0, discount_total: 0, shipping: 0, grand_total: 0 };

  return (
    <div className="py-5">
      <div className="container">
        <h2 className="fw-bold text-dark mb-4">
          Shopping Cart {items.length > 0 && <span className="text-muted fs-5">({items.length} item{items.length === 1 ? '' : 's'})</span>}
        </h2>

        {error && <ErrorMessage message={error} onRetry={loadCart} />}

        {items.length === 0 ? (
          <EmptyState
            icon="bi-cart-x"
            title="Your shopping cart is empty"
            description="Looks like you haven't added any products to your cart yet. Discover our fresh collection today!"
            actionText="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="row g-4">
            {/* Items List */}
            <div className="col-lg-8">
              {items.map((item) => (
                <CartItem
                  key={item.cart_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  updating={updating}
                />
              ))}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Link to="/products" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Checkout Card */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order Summary</h5>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Subtotal ({summary.total_quantity} units)</span>
                  <span className="fw-semibold text-dark">{formatPrice(summary.subtotal)}</span>
                </div>

                {summary.discount_total > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Discount Savings</span>
                    <span className="fw-semibold">-{formatPrice(summary.discount_total)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Delivery Charges</span>
                  <span className="fw-semibold text-dark">
                    {summary.shipping === 0 ? <span className="badge bg-success-subtle text-success">FREE</span> : formatPrice(summary.shipping)}
                  </span>
                </div>

                {summary.subtotal < 999 && (
                  <div className="alert alert-info py-2 px-3 small rounded-2 mb-3" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-info-circle me-1"></i> Add <strong>{formatPrice(999 - summary.subtotal)}</strong> more for FREE delivery!
                  </div>
                )}

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-6 fw-bold text-dark">Total Amount</span>
                  <span className="fs-4 fw-extrabold text-primary">{formatPrice(summary.grand_total)}</span>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/checkout')}
                  disabled={updating || items.some((i) => !i.is_available)}
                >
                  <span>Proceed to Checkout</span>
                  <i className="bi bi-arrow-right"></i>
                </button>

                <div className="mt-3 text-center text-muted small" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-shield-check text-success me-1"></i> Secure checkout with end-to-end verification
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
