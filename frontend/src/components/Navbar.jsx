import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const [quickSearch, setQuickSearch] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live suggestions with debounce
  useEffect(() => {
    const fetchSuggest = async () => {
      try {
        const res = await api.getSearchSuggestions(quickSearch);
        if (res.success) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error('Search suggest error:', err);
      }
    };

    const timer = setTimeout(() => {
      if (showSearchDropdown) {
        fetchSuggest();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [quickSearch, showSearchDropdown]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(quickSearch.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setShowSearchDropdown(false);
    setQuickSearch('');
    navigate(`/products/${productId}`);
  };

  const handleSelectKeyword = (kw) => {
    setQuickSearch(kw);
    setShowSearchDropdown(false);
    navigate(`/products?search=${encodeURIComponent(kw)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top Glassmorphic OneUI Navigation Bar */}
      <nav className="navbar navbar-expand-lg oneui-navbar sticky-top py-2 shadow-sm">
        <div className="container">
          {/* OneUI Brand Capsule */}
          <Link className="navbar-brand text-decoration-none" to="/">
            <div className="brand-icon shadow-sm">
              <i className="bi bi-bag-check-fill"></i>
            </div>
            <div className="d-flex align-items-baseline gap-1">
              <span>E-Shop</span>
              <span className="text-primary fw-extrabold">One</span>
            </div>
          </Link>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler border-0 shadow-none p-2 rounded-circle"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ background: 'var(--oneui-surface-muted)' }}
          >
            <i className="bi bi-list fs-4 text-dark"></i>
          </button>

          {/* Main Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1 ps-lg-3">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  <i className="bi bi-house-door me-1 d-lg-none"></i>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/products">
                  <i className="bi bi-grid me-1 d-lg-none"></i>
                  Products
                </NavLink>
              </li>
              {user && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/orders">
                    <i className="bi bi-bag-check me-1 d-lg-none"></i>
                    Orders
                  </NavLink>
                </li>
              )}
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <NavLink className="nav-link text-primary fw-bold" to="/admin">
                    <i className="bi bi-shield-check me-1"></i> Admin Console
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Amazon-Style Live Search Bar with Instant Autocomplete */}
            <div className="position-relative me-lg-3 my-2 my-lg-0" ref={searchContainerRef} style={{ minWidth: '280px' }}>
              <form onSubmit={handleSearchSubmit}>
                <div className="oneui-nav-search shadow-sm w-100">
                  <i className="bi bi-search text-muted me-2"></i>
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    value={quickSearch}
                    onFocus={() => setShowSearchDropdown(true)}
                    onChange={(e) => {
                      setQuickSearch(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                  />
                  {quickSearch && (
                    <button
                      type="button"
                      className="border-0 bg-transparent text-muted p-0 ms-1"
                      onClick={() => setQuickSearch('')}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {showSearchDropdown && suggestions && (
                <div
                  className="card position-absolute start-0 end-0 mt-2 border-0 shadow-lg rounded-4 overflow-hidden bg-white"
                  style={{ zIndex: 1060, maxHeight: '420px', overflowY: 'auto' }}
                >
                  {/* Matching Products */}
                  {suggestions.products && suggestions.products.length > 0 && (
                    <div className="p-2 border-bottom">
                      <span className="text-muted small fw-bold px-2 py-1 text-uppercase" style={{ fontSize: '0.7rem' }}>
                        Matching Products
                      </span>
                      {suggestions.products.map((p) => (
                        <div
                          key={p.id}
                          className="d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer hover-bg-light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSelectProduct(p.id)}
                        >
                          <img
                            src={p.image || '/uploads/products/placeholder.svg'}
                            alt=""
                            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                            className="rounded border p-1 bg-white flex-shrink-0"
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="small fw-semibold text-dark text-truncate">{p.name}</div>
                            <span className="text-primary fw-bold small">{formatPrice(p.final_price || p.price)}</span>
                          </div>
                          <i className="bi bi-chevron-right text-muted small"></i>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Categories */}
                  {suggestions.categories && suggestions.categories.length > 0 && (
                    <div className="p-2 border-bottom bg-light bg-opacity-50">
                      <span className="text-muted small fw-bold px-2 py-1 text-uppercase" style={{ fontSize: '0.7rem' }}>
                        Categories
                      </span>
                      <div className="d-flex flex-wrap gap-1 p-1">
                        {suggestions.categories.map((c) => (
                          <Link
                            key={c.id}
                            to={`/products?category=${c.id}`}
                            className="badge bg-white text-dark border rounded-pill px-3 py-2 text-decoration-none small shadow-sm"
                            onClick={() => setShowSearchDropdown(false)}
                          >
                            <i className="bi bi-tag-fill text-primary me-1"></i> {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Keywords */}
                  {suggestions.trending && suggestions.trending.length > 0 && (
                    <div className="p-2">
                      <span className="text-muted small fw-bold px-2 py-1 text-uppercase" style={{ fontSize: '0.7rem' }}>
                        Trending Searches
                      </span>
                      {suggestions.trending.map((kw, i) => (
                        <div
                          key={i}
                          className="d-flex align-items-center gap-2 px-2 py-1 rounded-2 cursor-pointer hover-bg-light small text-dark"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSelectKeyword(kw)}
                        >
                          <i className="bi bi-arrow-up-right text-muted"></i>
                          <span>{kw}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions (Coins, Wishlist, Cart & Profile) */}
            <div className="d-flex align-items-center gap-2">
              {/* Flipkart / Amazon style SuperCoins pill */}
              {user && (
                <Link
                  to="/profile"
                  className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill px-3 py-2 text-decoration-none small d-none d-sm-flex align-items-center gap-1 shadow-sm"
                  title="Your E-Shop Rewards & SuperCoins"
                >
                  <i className="bi bi-coin text-warning fs-6"></i>
                  <span className="fw-bold">{user.reward_coins || 120} Coins</span>
                </Link>
              )}

              {/* Wishlist Pill */}
              <Link to="/wishlist" className="nav-icon-btn" title="Saved Wishlist">
                <i className="bi bi-heart fs-5"></i>
                {wishlistCount > 0 && (
                  <span className="badge bg-danger badge-count">{wishlistCount}</span>
                )}
              </Link>

              {/* Cart Pill */}
              <Link to="/cart" className="nav-icon-btn" title="Shopping Cart">
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span className="badge bg-primary badge-count">{cartCount}</span>
                )}
              </Link>

              {/* User Dropdown */}
              {user ? (
                <div className="dropdown ms-1">
                  <button
                    className="btn btn-sm p-1 ps-2 pe-3 d-flex align-items-center gap-2 border shadow-sm"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ background: 'var(--oneui-surface)', borderRadius: 'var(--oneui-r-pill)' }}
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-semibold text-dark small d-none d-md-inline-block">
                      {user.name.split(' ')[0]}
                    </span>
                    <i className="bi bi-chevron-down text-muted small"></i>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2 mt-2 rounded-4" style={{ minWidth: '220px' }}>
                    <li className="px-3 py-2 border-bottom mb-1">
                      <div className="fw-bold text-dark">{user.name}</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                      <div className="mt-1">
                        <span className="badge bg-warning text-dark rounded-pill px-2 py-0 small" style={{ fontSize: '0.68rem' }}>
                          🪙 {user.reward_coins || 120} Reward Coins
                        </span>
                      </div>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 small" to="/profile">
                        <i className="bi bi-person me-2 text-primary"></i> My Profile &amp; Addresses
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 small" to="/orders">
                        <i className="bi bi-box-seam me-2 text-primary"></i> My Order History
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 small" to="/wishlist">
                        <i className="bi bi-heart me-2 text-danger"></i> Saved Wishlist
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <>
                        <li><hr className="dropdown-divider my-1" /></li>
                        <li>
                          <Link className="dropdown-item rounded-3 py-2 small text-primary fw-bold" to="/admin">
                            <i className="bi bi-shield-lock me-2"></i> Admin Panel
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button className="dropdown-item rounded-3 py-2 small text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-1 ms-1">
                  <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
