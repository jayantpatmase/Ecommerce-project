import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        if (res.data?.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="py-5 bg-light flex-grow-1 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow rounded-4 p-4 p-sm-5 bg-white">
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2">
                  <i className="bi bi-person-fill fs-3"></i>
                </div>
                <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
                <p className="text-muted small">Sign in to your E-Shop account to continue</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Quick Demo Credentials for Fast Testing */}
              <div className="mt-4 pt-3 border-top">
                <span className="text-muted small fw-semibold d-block text-center mb-2">
                  Instant Test Accounts:
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-50"
                    onClick={() => handleQuickFill('john.doe@example.com', 'Customer@123')}
                  >
                    <i className="bi bi-person me-1"></i> Rahul (Customer)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary w-50"
                    onClick={() => handleQuickFill('admin@eshop.com', 'Admin@123')}
                  >
                    <i className="bi bi-shield-lock me-1"></i> Admin (India)
                  </button>
                </div>
              </div>

              <div className="text-center mt-4 pt-2">
                <span className="text-muted small">Don't have an account yet? </span>
                <Link to="/register" className="text-primary fw-semibold small text-decoration-none">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
