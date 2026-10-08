import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
    }
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

            {/* OneUI Pill Search Bar */}
            <form className="d-flex me-lg-3 my-2 my-lg-0" onSubmit={handleSearchSubmit}>
              <div className="oneui-nav-search shadow-sm">
                <i className="bi bi-search text-muted me-2"></i>
                <input
                  type="text"
                  placeholder="Search store..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
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

            {/* Quick Actions (Wishlist, Cart & Profile) */}
            <div className="d-flex align-items-center gap-2">
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
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 small" to="/profile">
                        <i className="bi bi-person me-2 text-primary"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded-3 py-2 small" to="/orders">
                        <i className="bi bi-box-seam me-2 text-primary"></i> Order History
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
                          <Link className="dropdown-item rounded-3 py-2 small text-primary fw-semibold" to="/admin">
                            <i className="bi bi-shield-lock me-2"></i> Admin Dashboard
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
                <div className="d-flex align-items-center gap-2 ms-1">
                  <Link to="/login" className="btn btn-sm btn-outline-primary">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-primary">
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
