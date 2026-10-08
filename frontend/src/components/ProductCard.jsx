import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

export default function ProductCard({
  product,
  onWishlistChange = null,
  isWishlisted = false,
  viewMode = 'grid'
}) {
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const hasDiscount = product.discount && Number(product.discount) > 0;
  const isOutOfStock = Number(product.stock) <= 0;

  const handleAddToCart = async (e, buyNow = false) => {
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
      if (buyNow) {
        showToast(`Proceeding to checkout with ${product.name}...`, 'primary');
        navigate('/checkout');
      } else {
        showToast(`Added "${product.name}" to your shopping bag!`, 'success');
      }
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

  // AMAZON-STYLE LIST VIEW MODE
  if (viewMode === 'list') {
    return (
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3 bg-white mb-3 hover-shadow transition-all">
        <div className="row g-3 align-items-center">
          {/* Thumbnail */}
          <div className="col-4 col-sm-3 col-md-3">
            <div className="bg-light rounded-3 overflow-hidden border position-relative w-100" style={{ aspectRatio: '1 / 1' }}>
              <Link to={`/products/${product.id}`} className="w-100 h-100 d-block">
                <img
                  src={product.image || '/uploads/products/placeholder.svg'}
                  alt={product.name}
                  loading="lazy"
                  className="w-100 h-100 object-fit-contain p-2"
                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                />
              </Link>
              {hasDiscount && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-danger rounded-pill px-2 py-1 small" style={{ zIndex: 2, width: 'auto', height: 'auto' }}>
                  -{Number(product.discount)}%
                </span>
              )}
            </div>
          </div>

          {/* Details & Specs */}
          <div className="col-8 col-sm-6 col-md-6 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                {product.category_name || 'General'}
              </span>
              <span className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill small" style={{ fontSize: '0.68rem' }}>
                ⚡ Prime Assured
              </span>
            </div>

            <h5 className="fw-bold mb-1">
              <Link to={`/products/${product.id}`} className="text-decoration-none text-dark line-clamp-2">
                {product.name}
              </Link>
            </h5>

            {/* Ratings */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="badge bg-success text-white px-2 py-0 rounded-pill d-flex align-items-center gap-1">
                <span>{product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : '4.5'}</span>
                <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.68rem' }}></i>
              </div>
              <span className="text-muted small">({product.review_count || 12} reviews)</span>
            </div>

            {/* Description excerpt */}
            <p className="text-secondary small mb-2 line-clamp-2 d-none d-sm-block" style={{ fontSize: '0.82rem' }}>
              {product.description || 'Verified authentic manufacturer unit with 1-year brand warranty and doorstep returns.'}
            </p>

            <div className="text-success small fw-semibold">
              <i className="bi bi-truck me-1"></i> FREE Delivery by Tomorrow • Eligible for Cash on Delivery
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="col-12 col-sm-3 col-md-3 d-flex flex-column justify-content-between align-items-end border-start-sm ps-sm-3">
            <div className="text-sm-end w-100 mb-2">
              <div className="fs-4 fw-extrabold text-primary">
                {formatPrice(product.final_price || product.price)}
              </div>
              {hasDiscount && (
                <div className="small text-muted text-decoration-line-through">
                  M.R.P: {formatPrice(product.price)}
                </div>
              )}
              <div className="text-muted small mt-1">
                {isOutOfStock ? (
                  <span className="badge bg-danger-subtle text-danger">Out of Stock</span>
                ) : Number(product.stock) <= 5 ? (
                  <span className="badge bg-warning-subtle text-warning-emphasis">Only {product.stock} left</span>
                ) : (
                  <span className="badge bg-success-subtle text-success">In Stock</span>
                )}
              </div>
            </div>

            <div className="d-flex flex-column gap-2 w-100 mt-auto">
              <button
                className="btn btn-sm btn-primary rounded-pill w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1"
                onClick={(e) => handleAddToCart(e, false)}
                disabled={isOutOfStock || addingToCart}
              >
                <i className="bi bi-cart-plus"></i>
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                className={`btn btn-sm rounded-pill w-100 border d-flex align-items-center justify-content-center gap-1 ${
                  wishlisted ? 'btn-danger text-white' : 'btn-outline-secondary'
                }`}
                onClick={handleToggleWishlist}
              >
                <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{wishlisted ? 'Wishlisted' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT GRID VIEW MODE
  return (
    <div className="product-card h-100 d-flex flex-column">
      <div className="product-img-wrapper position-relative">
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
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
            {product.category_name || 'General'}
          </span>
          <span className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill small" style={{ fontSize: '0.65rem' }}>
            ⚡ Prime
          </span>
        </div>

        <h6 className="card-title fw-bold mb-2 text-dark">
          <Link to={`/products/${product.id}`} className="text-decoration-none text-dark line-clamp-2">
            {product.name}
          </Link>
        </h6>

        {/* Rating */}
        <div className="d-flex align-items-center gap-1 mb-2">
          <div className="badge bg-success text-white px-2 py-0 rounded-pill d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
            <span>{product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : '4.5'}</span>
            <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.68rem' }}></i>
          </div>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            ({product.review_count || 12})
          </span>
        </div>

        {/* Delivery promise tag (Amazon / Flipkart) */}
        <div className="text-success small mb-2" style={{ fontSize: '0.72rem' }}>
          <i className="bi bi-truck me-1"></i> FREE Delivery by Tomorrow
        </div>

        {/* Price & Stock status */}
        <div className="mt-auto pt-2 border-top">
          <div className="d-flex align-items-baseline justify-content-between mb-2">
            <div>
              <span className="price-current">
                {formatPrice(product.final_price || product.price)}
              </span>
              {hasDiscount && (
                <span className="price-original ms-1">
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
              className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold shadow-sm"
              onClick={(e) => handleAddToCart(e, false)}
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
