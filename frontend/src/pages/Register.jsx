import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setError('Password confirmation does not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await register(form);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light flex-grow-1 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div className="card border-0 shadow rounded-4 p-4 p-sm-5 bg-white">
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2">
                  <i className="bi bi-person-plus-fill fs-3"></i>
                </div>
                <h3 className="fw-bold text-dark mb-1">Create an Account</h3>
                <p className="text-muted small">Join E-Shop to enjoy seamless online shopping</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="+1 555 123 4567"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Shipping Address</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="address"
                      placeholder="123 Shopping St, City, Country"
                      value={form.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Password (Min 8 chars)</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      placeholder="••••••••"
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-4 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center mt-4 pt-2 border-top">
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="text-primary fw-semibold small text-decoration-none">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
