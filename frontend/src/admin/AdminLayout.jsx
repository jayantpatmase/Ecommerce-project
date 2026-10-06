import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      {/* OneUI Sidebar Navigation */}
      <aside className="admin-sidebar shadow-sm">
        {/* Brand Pill Header */}
        <div className="brand-pill d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
          >
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">OneUI Console</h6>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Store Operations</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="nav flex-column gap-1 flex-grow-1">
          <NavLink to="/admin" end className="nav-link">
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/products" className="nav-link">
            <i className="bi bi-box-seam"></i>
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/categories" className="nav-link">
            <i className="bi bi-tags"></i>
            <span>Categories</span>
          </NavLink>

          <NavLink to="/admin/customers" className="nav-link">
            <i className="bi bi-people"></i>
            <span>Customers</span>
          </NavLink>

          <NavLink to="/admin/orders" className="nav-link">
            <i className="bi bi-cart-check"></i>
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/inventory" className="nav-link">
            <i className="bi bi-boxes"></i>
            <span>Inventory</span>
          </NavLink>

          <div className="border-top my-3 mx-2 opacity-50"></div>

          <Link to="/" className="nav-link text-primary">
            <i className="bi bi-shop"></i>
            <span>View Public Store</span>
          </Link>

          <button onClick={handleLogout} className="nav-link text-danger border-0 bg-transparent text-start w-100">
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 rounded-4 bg-light mt-auto d-flex align-items-center gap-2 border">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="fw-bold text-dark text-truncate small">{user?.name}</div>
            <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>Admin • India Ops</div>
          </div>
        </div>
      </aside>

      {/* Main OneUI Admin Content Body */}
      <main className="admin-content">
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Viewing:</span>
            <span className="badge bg-primary-subtle text-primary fw-bold">OneUI Operations Panel</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-sm btn-outline-primary px-3 shadow-sm">
              <i className="bi bi-box-arrow-up-right me-1"></i> Public Storefront
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
