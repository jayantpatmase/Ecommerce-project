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
    return <Loading message="Loading OneUI storefront..." />;
  }

  return (
    <div className="pb-5">
      {/* 1. OneUI Viewing Header Area */}
      <section className="oneui-viewing-header">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <span className="badge bg-primary-subtle text-primary mb-2 px-3 py-1 fw-bold">
                E-SHOP INDIA • ONE UI EDITION
              </span>
              <h2>Simplicity within reach.</h2>
              <p>Discover hand-picked electronics, fashion, and lifestyle essentials with Pan-India express delivery.</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link to="/products" className="btn btn-primary btn-sm px-3 shadow-sm">
                Explore Catalog <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. OneUI Island Hero Banner */}
        <section className="oneui-hero-card">
          <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1 mb-3 rounded-pill">
                FESTIVAL SPECIAL 2026
              </span>
              <h1 className="display-5 fw-extrabold text-white mb-3" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Engineered for sound. Crafted for comfort.
              </h1>
              <p className="lead mb-4" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem' }}>
                Pro Wireless ANC Headphones with 40-hour battery life and spatial audio. Order now with free Pan-India delivery &amp; instant UPI payment.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/products/1" className="btn btn-primary btn-lg px-4 shadow">
                  Shop Deal (₹2,124) <i className="bi bi-chevron-right ms-1"></i>
                </Link>
                <Link to="/products?discount=15" className="btn btn-outline-light btn-lg px-4">
                  View All Offers
                </Link>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="position-relative p-3 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <img
                  src="/uploads/products/headphones.svg"
                  alt="Featured Hero Product"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: '320px', objectFit: 'contain' }}
                />
                <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white text-dark rounded-4 shadow text-start d-none d-sm-block" style={{ border: '1px solid var(--oneui-border-subtle)' }}>
                  <div className="badge bg-danger rounded-pill mb-1">-15% OFF</div>
                  <h6 className="fw-bold mb-0 text-dark">Wireless ANC Pro</h6>
                  <span className="text-primary fw-extrabold fs-5">₹2,124</span>
                  <span className="text-muted text-decoration-line-through small ms-2">₹2,499</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. OneUI Category Quick Filter Pill Carousel */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-collection me-2 text-primary"></i>Browse by Category
            </h5>
            <Link to="/products" className="text-decoration-none text-primary fw-semibold small">
              View All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="oneui-chip-carousel">
            <Link
              to="/products"
              className={`oneui-chip ${!activeCategoryTab ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('')}
            >
              <i className="bi bi-grid-fill"></i>
              <span>All Items</span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className={`oneui-chip ${activeCategoryTab === String(cat.id) ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab(String(cat.id))}
              >
                <i className="bi bi-tag-fill text-muted"></i>
                <span>{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="badge bg-light text-dark rounded-pill py-0 px-2 small">
                    {cat.product_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* 4. OneUI Top Rated / Featured Products Grid */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <span className="text-primary text-uppercase fw-bold small">Customer Favorites</span>
              <h4 className="fw-bold text-dark mb-0">Featured Products</h4>
            </div>
            <Link to="/products?sort=rating" className="text-decoration-none text-primary fw-semibold small">
              See All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. OneUI Mid-Page Promo Island */}
        <section className="card border-0 rounded-4 p-4 p-md-5 mb-5 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #0072de 0%, #0056b3 100%)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-white text-primary fw-bold px-3 py-1 rounded-pill mb-2">LIMITED TIME</span>
              <h3 className="display-6 fw-bold mb-2 text-white">Save Up to 20% on Laptops &amp; Audio</h3>
              <p className="mb-0 text-white-50">Hand-selected devices with manufacturer warranty, free Pan-India doorstep delivery over ₹999, and verified UPI payment.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/products?discount=10" className="btn btn-light btn-lg text-primary fw-bold px-4 shadow">
                Browse Deals <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. OneUI Special Discounts Grid */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <span className="text-danger text-uppercase fw-bold small">Instant Savings</span>
              <h4 className="fw-bold text-dark mb-0">Special Discounts</h4>
            </div>
            <Link to="/products?sort=discount" className="text-decoration-none text-primary fw-semibold small">
              See All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {specialOffers.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 7. OneUI Fresh Arrivals */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <span className="text-primary text-uppercase fw-bold small">Just Added</span>
              <h4 className="fw-bold text-dark mb-0">New Arrivals</h4>
            </div>
            <Link to="/products?sort=newest" className="text-decoration-none text-primary fw-semibold small">
              See All <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {newArrivals.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-lg-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 8. OneUI Squircle Feature / Trust Badges */}
        <section className="card border-0 rounded-4 p-4 p-md-5 bg-white shadow-sm mb-4">
          <div className="text-center mb-4">
            <span className="text-primary text-uppercase fw-bold small">Why Customers Love Us</span>
            <h4 className="fw-bold text-dark mb-0">Designed For Seamless Shopping</h4>
          </div>

          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border-0 transition">
                <div className="oneui-squircle-icon bg-primary-subtle text-primary mx-auto mb-3">
                  <i className="bi bi-truck"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">Free Delivery</h6>
                <p className="text-muted small mb-0">On orders over ₹999 across 19,000+ PIN codes.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border-0 transition">
                <div className="oneui-squircle-icon bg-success-subtle text-success mx-auto mb-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">UPI &amp; RuPay Ready</h6>
                <p className="text-muted small mb-0">GPay, PhonePe, Paytm, RuPay, NetBanking &amp; COD.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border-0 transition">
                <div className="oneui-squircle-icon bg-warning-subtle text-warning-emphasis mx-auto mb-3">
                  <i className="bi bi-arrow-counterclockwise"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">7-Day Easy Returns</h6>
                <p className="text-muted small mb-0">Instant replacement or 100% money-back refund.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 rounded-4 bg-light h-100 border-0 transition">
                <div className="oneui-squircle-icon bg-info-subtle text-info mx-auto mb-3">
                  <i className="bi bi-headset"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">Pan-India Support</h6>
                <p className="text-muted small mb-0">Toll-free 1800-123-4567 (Mon–Sat, 9AM–8PM IST).</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
