import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function Profile() {
  const { user, logout, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await api.updateProfile({ name, phone, address });
      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        await reloadUser();
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.message || 'Could not update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPassMsg({ type: 'danger', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'danger', text: 'Passwords do not match.' });
      return;
    }

    try {
      setSavingPass(true);
      setPassMsg(null);
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (res.success) {
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.message || 'Could not update password.' });
    } finally {
      setSavingPass(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        <div className="row g-4">
          {/* Sidebar Navigation */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold text-dark mb-0">{user.name}</h5>
              <span className="text-muted small">{user.email}</span>
              <span className="badge bg-primary-subtle text-primary align-self-center mt-2 px-3 py-1">
                {user.role === 'admin' ? 'Administrator' : 'Verified Customer'}
              </span>

              <div className="d-grid gap-2 mt-4 pt-3 border-top">
                <Link to="/orders" className="btn btn-outline-secondary btn-sm text-start">
                  <i className="bi bi-box2 me-2"></i> My Orders
                </Link>
                <Link to="/wishlist" className="btn btn-outline-secondary btn-sm text-start">
                  <i className="bi bi-heart me-2"></i> Saved Wishlist
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-outline-primary btn-sm text-start">
                    <i className="bi bi-gear-fill me-2"></i> Admin Panel
                  </Link>
                )}
                <button className="btn btn-outline-danger btn-sm text-start" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Edit Forms */}
          <div className="col-lg-8">
            {/* 1. Profile information */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="bi bi-person-gear text-primary me-2"></i> Profile Information
              </h5>

              {profileMsg && (
                <div className={`alert alert-${profileMsg.type} py-2 px-3 small rounded-3 mb-3`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Email Address (Read-Only)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user.email}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Mobile Number (+91)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Default Delivery Address (India)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Flat/House No., Street/Colony, City, State - PIN code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 mt-3 fw-bold shadow-sm"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* 2. Change password */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">
                <i className="bi bi-shield-lock text-primary me-2"></i> Change Password
              </h5>

              {passMsg && (
                <div className={`alert alert-${passMsg.type} py-2 px-3 small rounded-3 mb-3`}>
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">New Password (Min 8 chars)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-primary rounded-pill px-4 mt-3 fw-bold"
                  disabled={savingPass}
                >
                  {savingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
