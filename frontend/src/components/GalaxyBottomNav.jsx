import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GalaxyBottomNav() {
  const { user, cartCount, wishlistCount } = useAuth();

  return (
    <nav className="galaxy-bottom-nav">
      <div className="d-flex justify-content-around align-items-center py-2 px-1">
        {/* Tab 1: Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `galaxy-nav-tab ${isActive ? 'active' : ''}`}
        >
          <div className="galaxy-tab-icon">
            <i className="bi bi-house-door-fill"></i>
          </div>
          <span className="galaxy-tab-label">Home</span>
        </NavLink>

        {/* Tab 2: Store / Catalog */}
        <NavLink
          to="/products"
          className={({ isActive }) => `galaxy-nav-tab ${isActive ? 'active' : ''}`}
        >
          <div className="galaxy-tab-icon">
            <i className="bi bi-grid-fill"></i>
          </div>
          <span className="galaxy-tab-label">Store</span>
        </NavLink>

        {/* Tab 3: Wishlist */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) => `galaxy-nav-tab ${isActive ? 'active' : ''}`}
        >
          <div className="galaxy-tab-icon position-relative">
            <i className="bi bi-heart-fill"></i>
            {wishlistCount > 0 && <span className="galaxy-tab-badge bg-danger"></span>}
          </div>
          <span className="galaxy-tab-label">Wishlist</span>
        </NavLink>

        {/* Tab 4: Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) => `galaxy-nav-tab ${isActive ? 'active' : ''}`}
        >
          <div className="galaxy-tab-icon position-relative">
            <i className="bi bi-bag-fill"></i>
            {cartCount > 0 && (
              <span className="galaxy-tab-badge-count bg-primary">{cartCount}</span>
            )}
          </div>
          <span className="galaxy-tab-label">Bag</span>
        </NavLink>

        {/* Tab 5: Account / Samsung Account */}
        <NavLink
          to={user ? "/profile" : "/login"}
          className={({ isActive }) => `galaxy-nav-tab ${isActive ? 'active' : ''}`}
        >
          <div className="galaxy-tab-icon">
            <i className="bi bi-person-fill"></i>
          </div>
          <span className="galaxy-tab-label">{user ? 'Account' : 'Sign In'}</span>
        </NavLink>
      </div>

      {/* Samsung One UI Android Gesture Bar Handle */}
      <div className="galaxy-gesture-bar-container">
        <div className="galaxy-gesture-bar"></div>
      </div>
    </nav>
  );
}
