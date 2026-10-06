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
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar shadow-sm">
        <div className="px-4 pb-4 border-bottom border-secondary mb-3">
          <Link to="/admin" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill text-primary fs-4"></i>
            <div>
              <h6 className="fw-bold mb-0 text-white">E-Shop Admin</h6>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Management Console</span>
            </div>
          </Link>
        </div>

        <nav className="nav flex-column gap-1">
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

          <div className="border-top border-secondary my-3 mx-3"></div>

          <Link to="/" className="nav-link text-info">
            <i className="bi bi-shop"></i>
            <span>View Public Store</span>
          </Link>

          <button onClick={handleLogout} className="nav-link text-danger border-0 bg-transparent text-start w-100">
            <i className="bi bi-box-arrow-right"></i>
            <span>Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Admin Content Body */}
      <main className="admin-content">
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Welcome,</span>
            <span className="fw-bold text-dark">{user?.name}</span>
            <span className="badge bg-primary-subtle text-primary small">Administrator</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-box-arrow-up-right me-1"></i> Customer Front
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
