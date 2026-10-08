import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import Reviews from '../components/Reviews';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuantity(1);

        const [prodRes, relRes] = await Promise.all([
          api.getProduct(id),
          api.getRelatedProducts(id)
        ]);

        if (prodRes.success) {
          setProduct(prodRes.data);
        } else {
          setError(prodRes.message);
        }

        if (relRes.success) {
          setRelated(relRes.data);
        }
      } catch (err) {
        setError(err.message || 'Product could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetails();
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await api.addToCart(product.id, quantity);
      await refreshCounts();
      if (buyNow) {
        showToast(`Proceeding to checkout with ${product.name}...`, 'primary');
        navigate('/checkout');
      } else {
        showToast(`Added ${quantity} unit(s) of "${product.name}" to your cart!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Could not add to cart.', 'danger');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (wishlisted) {
        await api.removeFromWishlist(null, product.id);
        setWishlisted(false);
        showToast('Removed from your saved wishlist', 'info');
      } else {
        await api.addToWishlist(product.id);
        setWishlisted(true);
        showToast('Added to your saved wishlist!', 'success');
      }
      await refreshCounts();
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'danger');
    }
  };

  if (loading) return <Loading message="Loading product information..." />;
  if (error || !product) return <div className="container py-5"><ErrorMessage message={error || 'Product not found.'} /></div>;

  const isOutOfStock = Number(product.stock) <= 0;
  const hasDiscount  = Number(product.discount) > 0;

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none">Products</Link></li>
            <li className="breadcrumb-item"><Link to={`/products?category=${product.category_id}`} className="text-decoration-none">{product.category_name}</Link></li>
            <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>{product.name}</li>
          </ol>
        </nav>

        {/* Top Product Information Layout */}
        <div className="row g-5 mb-5">
          {/* Product Image */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3 bg-white text-center">
              <div className="ratio ratio-1x1 bg-light rounded-3 overflow-hidden d-flex align-items-center justify-content-center">
                <img
                  src={product.image || '/uploads/products/placeholder.svg'}
                  alt={product.name}
                  className="object-fit-contain p-4 w-100 h-100"
                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                />
              </div>
            </div>
          </div>

          {/* Details & Action Panel */}
          <div className="col-lg-6 d-flex flex-column">
            <div className="badge bg-primary-subtle text-primary align-self-start mb-2 px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
              {product.category_name}
            </div>

            <h2 className="fw-bold text-dark mb-2">{product.name}</h2>

            {/* Ratings summary */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="text-warning fs-5">
                {'★'.repeat(Math.round(product.avg_rating || 0))}
                {'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
              </div>
              <span className="fw-bold text-dark small">{product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : 'New'}</span>
              <span className="text-muted small">({product.review_count} verified reviews)</span>
            </div>

            {/* Price Box */}
            <div className="p-3 bg-light rounded-3 mb-4 d-flex align-items-baseline gap-3">
              <span className="display-6 fw-bold text-primary">
                {formatPrice(product.final_price || product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="fs-5 text-muted text-decoration-line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="badge bg-danger fs-6 px-2 py-1">
                    -{Number(product.discount)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold text-secondary small">Availability:</span>
                {isOutOfStock ? (
                  <span className="badge bg-danger-subtle text-danger px-3 py-2 fw-semibold">
                    Out of Stock
                  </span>
                ) : Number(product.stock) <= 5 ? (
                  <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 fw-semibold">
                    Low Stock — Only {product.stock} units available
                  </span>
                ) : (
                  <span className="badge bg-success-subtle text-success px-3 py-2 fw-semibold">
                    In Stock ({product.stock} units ready to ship)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Purchase Buttons */}
            {!isOutOfStock && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="fw-semibold text-secondary small">Quantity:</span>
                <div className="input-group" style={{ width: '130px' }}>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center fw-bold"
                    value={quantity}
                    min="1"
                    max={product.stock}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (v >= 1 && v <= product.stock) setQuantity(v);
                    }}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
              <button
                className="btn btn-primary btn-lg rounded-pill flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock || addingToCart}
              >
                <i className="bi bi-cart-plus fs-5"></i>
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                className="btn btn-success btn-lg rounded-pill flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock || addingToCart}
              >
                <i className="bi bi-lightning-charge fs-5"></i>
                Buy Now
              </button>

              <button
                className={`btn btn-lg rounded-pill border px-4 ${wishlisted ? 'btn-danger text-white' : 'btn-outline-danger'}`}
                onClick={handleToggleWishlist}
                title="Wishlist"
              >
                <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="border-top pt-3 mt-auto">
              <div className="row g-2 text-muted small">
                <div className="col-sm-6 d-flex align-items-center gap-2">
                  <i className="bi bi-truck text-primary fs-5"></i>
                  <span>Free delivery over ₹999 across India</span>
                </div>
                <div className="col-sm-6 d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-counterclockwise text-primary fs-5"></i>
                  <span>7-Day easy replacement guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Specifications */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-5">
          <ul className="nav nav-pills mb-3 border-bottom pb-3">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Product Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Technical Specifications
              </button>
            </li>
          </ul>

          <div className="tab-content py-2">
            {activeTab === 'description' ? (
              <div className="text-secondary" style={{ lineHeight: '1.8' }}>
                <p>{product.description || 'No detailed description provided for this product.'}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    {product.specifications ? (
                      product.specifications.split('|').map((spec, i) => {
                        const parts = spec.split(':');
                        return (
                          <tr key={i}>
                            <th className="bg-light text-secondary small text-uppercase" style={{ width: '30%' }}>
                              {parts[0]?.trim()}
                            </th>
                            <td className="text-dark small">
                              {parts[1]?.trim() || ''}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="text-muted">Standard manufacturer specifications apply.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-5">
          <Reviews productId={product.id} />
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h4 className="fw-bold text-dark mb-4">You May Also Like</h4>
            <div className="row g-4">
              {related.map((rel) => (
                <div key={rel.id} className="col-12 col-sm-6 col-lg-3">
                  <ProductCard product={rel} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
