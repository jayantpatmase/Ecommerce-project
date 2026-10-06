import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes, offersRes, newRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 4, sort: 'rating' }),
          api.getProducts({ limit: 4, sort: 'discount' }),
          api.getProducts({ limit: 4, sort: 'newest' })
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data.products);
        if (offersRes.success) setSpecialOffers(offersRes.data.products);
        if (newRes.success) setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <Loading message="Loading Galaxy Storefront..." />;
  }

  // Pre-configured Galaxy Store App Icon styles
  const categoryGradients = [
    { bg: 'linear-gradient(135deg, #0072de 0%, #00c6ff 100%)', icon: 'bi-headphones' },
    { bg: 'linear-gradient(135deg, #8a2387 0%, #e94057 100%)', icon: 'bi-gem' },
    { bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', icon: 'bi-shield-check' },
    { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: 'bi-cup-hot-fill' },
    { bg: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', icon: 'bi-book-half' },
    { bg: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', icon: 'bi-percent' }
  ];

  return (
    <div className="pb-4">
      {/* 1. Samsung One UI Glance & Weather Widget */}
      <section className="px-3 pt-3 pb-2">
        <div className="card border-0 rounded-4 p-3 bg-white shadow-sm mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted small fw-semibold" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-geo-alt-fill text-danger me-1"></i> Pan-India Express
              </div>
              <h5 className="fw-extrabold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                Galaxy Store India
              </h5>
            </div>
            <div className="text-end">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold small">
                One UI 6.1
              </span>
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-sun-fill text-warning me-1"></i> 28°C • Mumbai
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-3">
        {/* 2. Samsung Galaxy Store App Icons (Squircle Category Grid) */}
        <section className="card border-0 rounded-4 p-3 bg-white shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              Explore Categories
            </span>
            <Link to="/products" className="text-primary text-decoration-none small fw-semibold">
              All Items <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-2 justify-content-center">
            {categories.slice(0, 6).map((cat, idx) => {
              const style = categoryGradients[idx % categoryGradients.length];
              return (
                <div key={cat.id} className="col-4 col-sm-2 text-center">
                  <Link to={`/products?category=${cat.id}`} className="galaxy-app-tile">
                    <div
                      className="app-icon-squircle mx-auto"
                      style={{ background: style.bg }}
                    >
                      <i className={`bi ${style.icon}`}></i>
                    </div>
                    <span className="app-label">{cat.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Samsung Galaxy Hero Banner Card */}
        <section className="oneui-hero-card mb-4" style={{ borderRadius: '28px', padding: '2.5rem 1.75rem' }}>
          <div className="row align-items-center g-3 position-relative" style={{ zIndex: 1 }}>
            <div className="col-12 col-md-7">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1 mb-2 rounded-pill">
                FEATURED PROMO
              </span>
              <h2 className="fw-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em', lineHeight: 1.15, fontSize: '1.85rem' }}>
                Pro Wireless ANC
              </h2>
              <p className="mb-3" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.92rem' }}>
                Active Noise Cancellation &amp; 40-hour battery. Special India pricing with instant UPI checkout.
              </p>
              <div className="d-flex gap-2">
                <Link to="/products/1" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow">
                  ₹2,124 <i className="bi bi-arrow-right ms-1"></i>
                </Link>
                <Link to="/products?discount=15" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  Offers
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-5 text-center mt-3 mt-md-0">
              <div className="p-2 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <img
                  src="/uploads/products/headphones.svg"
                  alt="Featured Product"
                  className="img-fluid rounded-3"
                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. OneUI Quick Pill Filter Carousel */}
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <h6 className="fw-bold mb-0 text-dark">
              <i className="bi bi-sliders me-1 text-primary"></i> Quick Filter
            </h6>
          </div>

          <div className="oneui-chip-carousel py-1">
            <Link
              to="/products"
              className={`oneui-chip ${!activeCategoryTab ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('')}
            >
              <i className="bi bi-stars"></i>
              <span>All Products</span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className={`oneui-chip ${activeCategoryTab === String(cat.id) ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab(String(cat.id))}
              >
                <span>{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="badge bg-light text-dark rounded-pill py-0 px-2 small ms-1">
                    {cat.product_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Top Rated Products Section */}
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-3 px-1">
            <div>
              <span className="text-primary text-uppercase fw-bold small" style={{ fontSize: '0.72rem' }}>
                Customer Favorites
              </span>
              <h5 className="fw-bold text-dark mb-0">Featured Devices</h5>
            </div>
            <Link to="/products?sort=rating" className="text-decoration-none text-primary fw-semibold small">
              More <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-md-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Samsung Wallet / Indian Payment Trust Pill */}
        <section className="card border-0 rounded-4 p-3 bg-white shadow-sm mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
              style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}
            >
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold text-dark mb-0">One UI Pay &amp; Express Checkout</h6>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                UPI (GPay/PhonePe/Paytm), RuPay, NetBanking &amp; Cash on Delivery
              </span>
            </div>
            <span className="badge bg-success-subtle text-success rounded-pill fw-bold small">
              100% Safe
            </span>
          </div>
        </section>

        {/* 7. Special Discounts Grid */}
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-3 px-1">
            <div>
              <span className="text-danger text-uppercase fw-bold small" style={{ fontSize: '0.72rem' }}>
                Instant Price Drop
              </span>
              <h5 className="fw-bold text-dark mb-0">Special Offers</h5>
            </div>
            <Link to="/products?sort=discount" className="text-decoration-none text-primary fw-semibold small">
              More <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {specialOffers.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-md-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 8. Fresh Stock Arrivals */}
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-3 px-1">
            <div>
              <span className="text-primary text-uppercase fw-bold small" style={{ fontSize: '0.72rem' }}>
                Latest Catalog
              </span>
              <h5 className="fw-bold text-dark mb-0">New Arrivals</h5>
            </div>
            <Link to="/products?sort=newest" className="text-decoration-none text-primary fw-semibold small">
              More <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {newArrivals.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-md-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 9. Galaxy Grouped Settings-Style Trust List */}
        <section className="galaxy-settings-card mb-4">
          <div className="p-3 border-bottom bg-light">
            <span className="fw-bold text-dark small text-uppercase">
              <i className="bi bi-shield-check text-primary me-2"></i>E-Shop India Assurance
            </span>
          </div>

          <div className="galaxy-settings-item">
            <div className="item-squircle-icon bg-primary">
              <i className="bi bi-truck"></i>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-dark small">Pan-India Free Shipping</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Free doorstep delivery on orders above ₹999</div>
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </div>

          <div className="galaxy-settings-item">
            <div className="item-squircle-icon bg-success">
              <i className="bi bi-qr-code-scan"></i>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-dark small">UPI &amp; Doorstep Cash</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Google Pay, PhonePe, Paytm, RuPay &amp; COD</div>
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </div>

          <div className="galaxy-settings-item">
            <div className="item-squircle-icon bg-warning text-dark">
              <i className="bi bi-arrow-counterclockwise"></i>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-dark small">7-Day Replacement Guarantee</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Hassle-free doorstep returns and quick refunds</div>
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </div>

          <div className="galaxy-settings-item">
            <div className="item-squircle-icon bg-info">
              <i className="bi bi-headset"></i>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-dark small">Customer Helpline (1800-123-4567)</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Mon–Sat 9AM–8PM IST • support@eshop.in</div>
            </div>
            <i className="bi bi-chevron-right text-muted small"></i>
          </div>
        </section>
      </div>
    </div>
  );
}
