import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useAuth();
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

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
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-bag-check-fill text-primary fs-3"></i>
          <span>E-Shop</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                Products
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/orders">
                  My Orders
                </NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link text-primary fw-bold" to="/admin">
                  <i className="bi bi-speedometer2 me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          {/* Search Bar Input */}
          <form className="d-flex me-lg-3 my-2 my-lg-0" onSubmit={handleSearchSubmit}>
            <div className="input-group input-group-sm" style={{ minWidth: '220px' }}>
              <input
                type="text"
                className="form-control rounded-start-pill border-end-0 ps-3"
                placeholder="Search products..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary border-start-0 rounded-end-pill pe-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Right Action Icons & Auth */}
          <ul className="navbar-nav align-items-lg-center gap-2">
            {/* Wishlist Icon */}
            <li className="nav-item">
              <Link to="/wishlist" className="nav-link position-relative px-2" title="Wishlist">
                <i className="bi bi-heart fs-5"></i>
                {wishlistCount > 0 && (
                  <span className="badge bg-danger badge-count">{wishlistCount}</span>
                )}
              </Link>
            </li>

            {/* Cart Icon */}
            <li className="nav-item me-lg-2">
              <Link to="/cart" className="nav-link position-relative px-2" title="Shopping Cart">
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span className="badge bg-primary badge-count">{cartCount}</span>
                )}
              </Link>
            </li>

            {/* Auth conditional */}
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2 fw-semibold"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                  <li className="dropdown-header text-muted small">
                    Signed in as <strong>{user.email}</strong>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      <i className="bi bi-box2 me-2"></i> Order History
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/wishlist">
                      <i className="bi bi-heart me-2"></i> Saved Wishlist
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item text-primary" to="/admin">
                          <i className="bi bi-gear-fill me-2"></i> Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-primary px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary px-3">
                  Register
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
