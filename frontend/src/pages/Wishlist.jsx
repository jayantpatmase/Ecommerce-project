import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Wishlist() {
  const { user, refreshCounts } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movingId, setMovingId] = useState(null);

  const loadWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWishlist();
      if (res.success) {
        setWishlist(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const handleRemove = async (wishlistId, productId) => {
    try {
      await api.removeFromWishlist(wishlistId, productId);
      await loadWishlist();
      await refreshCounts();
    } catch (err) {
      alert(err.message || 'Could not remove item');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      setMovingId(productId);
      await api.moveWishlistToCart(productId);
      await loadWishlist();
      await refreshCounts();
    } catch (err) {
      alert(err.message || 'Could not move product to cart');
    } finally {
      setMovingId(null);
    }
  };

  if (!user) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-heart"
          title="Sign in to view your wishlist"
          description="Keep track of your favorite products and get notified about deals."
          actionText="Log In"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading) return <Loading message="Loading your saved wishlist..." />;

  return (
    <div className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Wishlist</h2>
            <p className="text-muted small mb-0">{wishlist.length} item{wishlist.length === 1 ? '' : 's'} saved</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadWishlist} />}

        {wishlist.length === 0 ? (
          <EmptyState
            icon="bi-heart"
            title="Your wishlist is empty"
            description="Tap the heart icon on any product to save it here for later."
            actionText="Browse Catalog"
            actionLink="/products"
          />
        ) : (
          <div className="row g-4">
            {wishlist.map((item) => (
              <div key={item.wishlist_id} className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                  <div className="position-relative bg-light ratio ratio-1x1">
                    <img
                      src={item.image || '/uploads/products/placeholder.svg'}
                      alt={item.name}
                      className="object-fit-contain p-3"
                      onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                    />
                    <button
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                      onClick={() => handleRemove(item.wishlist_id, item.product_id)}
                      title="Remove from wishlist"
                    >
                      <i className="bi bi-x-lg text-danger"></i>
                    </button>
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <span className="badge bg-secondary-subtle text-secondary small align-self-start mb-1">
                      {item.category_name}
                    </span>
                    <h6 className="fw-bold mb-2">
                      <Link to={`/products/${item.product_id}`} className="text-dark text-decoration-none text-truncate d-block">
                        {item.name}
                      </Link>
                    </h6>

                    <div className="mt-auto pt-2">
                      <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span className="fs-5 fw-bold text-dark">
                          ${Number(item.final_price).toFixed(2)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-muted small text-decoration-line-through">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary btn-sm fw-semibold"
                          disabled={item.stock <= 0 || movingId === item.product_id}
                          onClick={() => handleMoveToCart(item.product_id)}
                        >
                          <i className="bi bi-cart-plus me-1"></i>
                          {movingId === item.product_id ? 'Moving...' : item.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
