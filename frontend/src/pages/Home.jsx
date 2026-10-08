import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { formatPrice } from '../utils/format';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('');
  const [loading, setLoading] = useState(true);

  // Live Deal of the Day Countdown Timer (Amazon / Flipkart Lightning Deals)
  const [countdown, setCountdown] = useState({ hours: 7, minutes: 24, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    { bg: 'linear-gradient(135deg, #0072de 0%, #00c6ff 100%)', icon: 'bi-phone' },
    { bg: 'linear-gradient(135deg, #8a2387 0%, #e94057 100%)', icon: 'bi-gem' },
    { bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', icon: 'bi-laptop' },
    { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: 'bi-headphones' },
    { bg: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', icon: 'bi-smartwatch' },
    { bg: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', icon: 'bi-percent' }
  ];

  const padZero = (n) => String(n).padStart(2, '0');

  // Spotlight Deal
  const spotlightDeal = specialOffers.length > 0 ? specialOffers[0] : null;

  return (
    <div className="container py-3">
      {/* 1. Indian Festive Ribbon Ticker (Amazon Great Indian Festival / Flipkart Big Billion Days) */}
      <div className="alert alert-warning py-2 px-3 rounded-pill d-flex align-items-center justify-content-between mb-3 shadow-sm border-0 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 small">
          <span className="badge bg-danger text-white rounded-pill px-2 py-1 fw-bold">FESTIVE MEGA SALE</span>
          <span className="text-dark fw-semibold">
            Use code <strong className="text-primary">FESTIVE15</strong> for 15% OFF • Flat ₹500 off with <strong className="text-primary">FLAT500</strong>
          </span>
        </div>
        <Link to="/products?discount=15" className="btn btn-dark btn-sm rounded-pill px-3 py-0 small fw-bold" style={{ fontSize: '0.75rem' }}>
          Shop Deals <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {/* 2. Samsung Galaxy Store App Icons (Squircle Category Grid) */}
      <section className="card border-0 rounded-4 p-3 bg-white shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
            Featured Collections
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

      {/* 3. Hero Banner Card */}
      <section className="oneui-hero-card mb-4" style={{ borderRadius: '28px', padding: '2.5rem 1.75rem' }}>
        <div className="row align-items-center g-3 position-relative" style={{ zIndex: 1 }}>
          <div className="col-12 col-md-7">
            <span className="badge bg-warning text-dark fw-bold px-3 py-1 mb-2 rounded-pill">
              FESTIVAL EXCLUSIVE
            </span>
            <h2 className="fw-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em', lineHeight: 1.15, fontSize: '1.95rem' }}>
              Next-Gen Tech &amp; Everyday Essentials
            </h2>
            <p className="mb-3" style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.92rem' }}>
              Free Pan-India doorstep delivery over ₹999 with instant UPI and 7-day hassle-free replacements.
            </p>
            <div className="d-flex gap-2">
              <Link to="/products" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow">
                Explore Catalog <i className="bi bi-arrow-right ms-1"></i>
              </Link>
              <Link to="/products?discount=15" className="btn btn-outline-light btn-sm rounded-pill px-3">
                Top Discounts
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

      {/* 4. DEAL OF THE DAY WITH LIVE COUNTDOWN TIMER (Amazon / Flipkart Lightning Deals) */}
      {spotlightDeal && (
        <section className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 border-start-primary">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger text-white rounded-pill px-3 py-1 fw-bold">
                ⚡ DEAL OF THE DAY
              </span>
              <span className="fw-bold text-dark small">Limited Time Lightning Offer</span>
            </div>
            {/* Live Ticking Countdown */}
            <div className="d-flex align-items-center gap-1 small">
              <span className="text-muted fw-semibold">Ends in:</span>
              <span className="badge bg-dark text-white rounded-2 px-2 py-1 fw-mono">
                {padZero(countdown.hours)}h
              </span>
              <span>:</span>
              <span className="badge bg-dark text-white rounded-2 px-2 py-1 fw-mono">
                {padZero(countdown.minutes)}m
              </span>
              <span>:</span>
              <span className="badge bg-danger text-white rounded-2 px-2 py-1 fw-mono">
                {padZero(countdown.seconds)}s
              </span>
            </div>
          </div>

          <div className="row g-3 align-items-center">
            <div className="col-md-3 text-center">
              <div className="ratio ratio-1x1 bg-light rounded-3 p-2 border overflow-hidden">
                <img
                  src={spotlightDeal.image || '/uploads/products/placeholder.svg'}
                  alt={spotlightDeal.name}
                  className="w-100 h-100 object-fit-contain"
                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <span className="badge bg-primary-subtle text-primary small mb-1">{spotlightDeal.category_name}</span>
              <h5 className="fw-bold text-dark mb-1">
                <Link to={`/products/${spotlightDeal.id}`} className="text-dark text-decoration-none">
                  {spotlightDeal.name}
                </Link>
              </h5>
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <span className="fs-4 fw-extrabold text-primary">
                  {formatPrice(spotlightDeal.final_price || spotlightDeal.price)}
                </span>
                <span className="text-muted text-decoration-line-through small">
                  {formatPrice(spotlightDeal.price)}
                </span>
                <span className="badge bg-danger rounded-pill">
                  -{Number(spotlightDeal.discount)}% OFF
                </span>
              </div>
              <div className="progress mb-2" style={{ height: '6px', maxWidth: '300px' }}>
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: '74%' }}></div>
              </div>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-fire text-danger me-1"></i> 74% claimed • Deal expires soon!
              </span>
            </div>
            <div className="col-md-3 text-md-end">
              <Link
                to={`/products/${spotlightDeal.id}`}
                className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm w-100 w-md-auto"
              >
                Claim Deal <i className="bi bi-lightning-fill"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. OneUI Quick Pill Filter Carousel */}
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
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Featured Products Section */}
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

      {/* 7. Bank Offers & Payment Strip (Amazon India / Flipkart) */}
      <section className="card border-0 rounded-4 p-3 bg-white shadow-sm mb-4">
        <div className="row g-3 align-items-center text-center text-md-start">
          <div className="col-md-4 d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '44px', height: '44px' }}>
              <i className="bi bi-credit-card-2-front fs-5"></i>
            </div>
            <div>
              <div className="fw-bold text-dark small">Instant Bank Discounts</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>10% Instant off with SBI &amp; HDFC Cards</div>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-center gap-3">
            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '44px', height: '44px' }}>
              <i className="bi bi-qr-code-scan fs-5"></i>
            </div>
            <div>
              <div className="fw-bold text-dark small">Instant UPI &amp; Cash on Delivery</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Pay via Google Pay, PhonePe or Doorstep Cash</div>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-center gap-3">
            <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '44px', height: '44px' }}>
              <i className="bi bi-arrow-repeat fs-5"></i>
            </div>
            <div>
              <div className="fw-bold text-dark small">7-Day Doorstep Replacement</div>
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Hassle-free courier pickup guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Special Discounts Grid */}
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

      {/* 9. Fresh Stock Arrivals */}
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
    </div>
  );
}
