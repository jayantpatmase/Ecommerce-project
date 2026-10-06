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
    return <Loading message="Loading storefront..." />;
  }

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-bold text-uppercase tracking-wider">
                New Summer Collection 2026
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ letterSpacing: '-1px', lineHeight: '1.15' }}>
                Discover Premium Quality Products Online
              </h1>
              <p className="lead text-slate-300 mb-4" style={{ color: '#cbd5e1', fontSize: '1.15rem' }}>
                Shop curated electronics, designer apparel, footwear, kitchen essentials and more with verified transactions, express shipping, and seamless returns.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/products" className="btn btn-primary btn-lg px-4 fw-bold shadow">
                  Shop Now <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/products?discount=15" className="btn btn-outline-light btn-lg px-4 fw-semibold">
                  View Special Offers
                </Link>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <div className="position-relative p-4 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img
                  src="/uploads/products/headphones.svg"
                  alt="Featured Hero Product"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ maxHeight: '380px' }}
                />
                <div className="position-absolute bottom-0 start-0 m-4 p-3 bg-white text-dark rounded-3 shadow text-start d-none d-sm-block">
                  <div className="badge bg-danger mb-1">-15% OFF</div>
                  <h6 className="fw-bold mb-0">Wireless ANC Pro Headphones</h6>
                  <span className="text-primary fw-extrabold fs-5">₹2,124</span>
                  <span className="text-muted text-decoration-line-through small ms-2">₹2,499</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary text-uppercase fw-bold small">Explore Catalog</span>
              <h3 className="fw-bold text-dark mb-0">Popular Categories</h3>
            </div>
            <Link to="/products" className="text-decoration-none text-primary fw-semibold small">
              All Categories <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.slice(0, 6).map((cat) => (
              <div key={cat.id} className="col-6 col-md-4 col-lg-2">
                <Link
                  to={`/products?category=${cat.id}`}
                  className="card border text-decoration-none text-center p-3 rounded-3 h-100 shadow-sm transition hover-shadow bg-light"
                >
                  <div className="rounded-circle bg-white shadow-sm mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                    <i className="bi bi-grid text-primary fs-4"></i>
                  </div>
                  <h6 className="fw-bold text-dark mb-1 small">{cat.name}</h6>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {cat.product_count || 0} Products
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary text-uppercase fw-bold small">Top Rated</span>
              <h3 className="fw-bold text-dark mb-0">Featured Products</h3>
            </div>
            <Link to="/products?sort=rating" className="text-decoration-none text-primary fw-semibold small">
              View All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Special Offers Section Banner */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-2">LIMITED TIME PROMOTION</span>
              <h2 className="display-6 fw-bold mb-2">Save Up to 20% on Tech &amp; Home Essentials</h2>
              <p className="mb-0 text-white-50">Hand-picked premium selections with verified discounts. Order today and get free delivery on all orders over ₹999.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/products?discount=10" className="btn btn-light btn-lg text-primary fw-bold px-4 shadow">
                Browse Sale Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Special Offers Grid */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-danger text-uppercase fw-bold small">Best Savings</span>
              <h3 className="fw-bold text-dark mb-0">Special Discounts</h3>
            </div>
            <Link to="/products?sort=discount" className="text-decoration-none text-primary fw-semibold small">
              View All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {specialOffers.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. New Arrivals */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary text-uppercase fw-bold small">Fresh Stock</span>
              <h3 className="fw-bold text-dark mb-0">New Arrivals</h3>
            </div>
            <Link to="/products?sort=newest" className="text-decoration-none text-primary fw-semibold small">
              View All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {newArrivals.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why Shop With Us Trust Badges */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary text-uppercase fw-bold small">Customer First</span>
            <h3 className="fw-bold text-dark">Why Shop With E-Shop India?</h3>
          </div>

          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm h-100 border">
                <div className="stat-icon bg-primary-subtle text-primary mx-auto mb-3">
                  <i className="bi bi-truck fs-3"></i>
                </div>
                <h6 className="fw-bold text-dark">Free Delivery</h6>
                <p className="text-muted small mb-0">Free shipping on orders over ₹999 across India.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm h-100 border">
                <div className="stat-icon bg-success-subtle text-success mx-auto mb-3">
                  <i className="bi bi-shield-check fs-3"></i>
                </div>
                <h6 className="fw-bold text-dark">UPI &amp; RuPay Ready</h6>
                <p className="text-muted small mb-0">Google Pay, PhonePe, Paytm, RuPay &amp; COD.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm h-100 border">
                <div className="stat-icon bg-warning-subtle text-warning mx-auto mb-3">
                  <i className="bi bi-arrow-counterclockwise fs-3"></i>
                </div>
                <h6 className="fw-bold text-dark">7-Day Easy Returns</h6>
                <p className="text-muted small mb-0">Instant replacement or hassle-free refunds.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white rounded-3 shadow-sm h-100 border">
                <div className="stat-icon bg-info-subtle text-info mx-auto mb-3">
                  <i className="bi bi-headset fs-3"></i>
                </div>
                <h6 className="fw-bold text-dark">All-India Support</h6>
                <p className="text-muted small mb-0">Toll-free 1800-123-4567 &amp; support@eshop.in.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
