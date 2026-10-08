import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product, onWishlistChange = null, isWishlisted = false }) {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const hasDiscount = product.discount && Number(product.discount) > 0;
  const isOutOfStock = Number(product.stock) <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await api.addToCart(product.id, 1);
      await refreshCounts();
      showToast(`Added "${product.name}" to your shopping bag!`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not add product to cart', 'danger');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (wishlisted) {
        await api.removeFromWishlist(null, product.id);
        setWishlisted(false);
        showToast(`Removed "${product.name}" from wishlist`, 'info');
      } else {
        await api.addToWishlist(product.id);
        setWishlisted(true);
        showToast(`Saved "${product.name}" to wishlist!`, 'success');
      }
      await refreshCounts();
      if (onWishlistChange) onWishlistChange();
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'danger');
    }
  };

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <Link to={`/products/${product.id}`} className="w-100 h-100 d-block">
          <img
            src={product.image || '/uploads/products/placeholder.svg'}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
          />
        </Link>

        {hasDiscount && (
          <span className="discount-badge">
            -{Number(product.discount)}%
          </span>
        )}

        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>
      </div>

      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>
          {product.category_name || 'General'}
        </div>

        <h6 className="card-title fw-bold mb-2 text-dark">
          <Link to={`/products/${product.id}`} className="text-decoration-none text-dark line-clamp-2">
            {product.name}
          </Link>
        </h6>

        {/* Rating */}
        <div className="d-flex align-items-center gap-1 mb-2">
          <div className="star-rating">
            <i className="bi bi-star-fill text-warning"></i>
            <span className="ms-1 fw-bold text-dark small">
              {product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : 'New'}
            </span>
          </div>
          {product.review_count > 0 && (
            <span className="text-muted small">({product.review_count})</span>
          )}
        </div>

        {/* Price & Stock status */}
        <div className="mt-auto pt-2">
          <div className="d-flex align-items-baseline justify-content-between mb-2">
            <div>
              <span className="price-current">
                {formatPrice(product.final_price || product.price)}
              </span>
              {hasDiscount && (
                <span className="price-original">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div>
              {isOutOfStock ? (
                <span className="badge bg-danger-subtle text-danger fw-semibold px-2 py-1 small">
                  Out of Stock
                </span>
              ) : Number(product.stock) <= 5 ? (
                <span className="badge bg-warning-subtle text-warning-emphasis fw-semibold px-2 py-1 small">
                  Only {product.stock} left
                </span>
              ) : (
                <span className="badge bg-success-subtle text-success fw-semibold px-2 py-1 small">
                  In Stock
                </span>
              )}
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              <i className="bi bi-cart-plus"></i>
              {addingToCart ? 'Adding...' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
