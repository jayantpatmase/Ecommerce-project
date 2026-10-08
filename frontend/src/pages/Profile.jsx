import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES } from '../utils/format';
import Loading from '../components/Loading';

export default function Profile() {
  const { user, logout, reloadUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'security'

  // Personal Info Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address Form State
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrFlat, setAddrFlat] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Maharashtra');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrType, setAddrType] = useState('Home');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await api.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.updateProfile({ name, phone });
      if (res.success) {
        showToast('Profile information updated successfully!', 'success');
        await reloadUser();
      } else {
        showToast(res.message || 'Could not update profile', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Could not update profile', 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddrFullName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrFlat('');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('Maharashtra');
    setAddrPincode('');
    setAddrType('Home');
    setAddrIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr.id);
    setAddrFullName(addr.full_name);
    setAddrPhone(addr.phone);
    setAddrFlat(addr.flat_no);
    setAddrStreet(addr.street);
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrType(addr.address_type);
    setAddrIsDefault(addr.is_default);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(addrPincode.trim())) {
      showToast('Please enter a valid 6-digit Indian PIN code.', 'warning');
      return;
    }

    const payload = {
      full_name: addrFullName,
      phone: addrPhone,
      flat_no: addrFlat,
      street: addrStreet,
      landmark: addrLandmark,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      address_type: addrType,
      is_default: addrIsDefault
    };

    try {
      setSavingAddress(true);
      if (editingAddressId) {
        payload.id = editingAddressId;
        const res = await api.updateSavedAddress(payload);
        if (res.success) {
          showToast('Delivery address updated successfully!', 'success');
          setShowAddressModal(false);
          await loadAddresses();
          await reloadUser();
        } else {
          showToast(res.message || 'Could not update address.', 'danger');
        }
      } else {
        const res = await api.addAddress(payload);
        if (res.success) {
          showToast('New delivery address added successfully!', 'success');
          setShowAddressModal(false);
          await loadAddresses();
          await reloadUser();
        } else {
          showToast(res.message || 'Could not save address.', 'danger');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save address.', 'danger');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.deleteAddress(addrId);
      if (res.success) {
        showToast('Address deleted successfully.', 'info');
        await loadAddresses();
        await reloadUser();
      }
    } catch (err) {
      showToast(err.message || 'Could not delete address.', 'danger');
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const res = await api.setDefaultAddress(addrId);
      if (res.success) {
        showToast('Default delivery address updated!', 'success');
        await loadAddresses();
        await reloadUser();
      }
    } catch (err) {
      showToast(err.message || 'Could not set default address.', 'danger');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'warning');
      return;
    }

    try {
      setSavingPass(true);
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (res.success) {
        showToast('Security password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Failed to change password.', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Could not update password.', 'danger');
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
        {/* Page Title */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-extrabold text-dark mb-1">Samsung Account &amp; Profile</h2>
            <p className="text-muted small mb-0">Manage your identity, personal contact details, and address book</p>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-bold">
            🇮🇳 India Region
          </span>
        </div>

        <div className="row g-4">
          {/* Left Column: Profile Card & Navigation */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                style={{ width: '84px', height: '84px', fontSize: '2.2rem' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold text-dark mb-0">{user.name}</h5>
              <span className="text-muted small">{user.email}</span>
              <div className="mt-2">
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">
                  {user.role === 'admin' ? 'Administrator' : 'Verified Customer'}
                </span>
              </div>

              {/* Navigation Pill Tabs */}
              <div className="d-flex flex-column gap-2 mt-4 pt-3 border-top text-start">
                <button
                  className={`btn text-start rounded-pill px-3 py-2 fw-semibold ${
                    activeTab === 'profile' ? 'btn-primary shadow-sm' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person-gear me-2"></i> Personal Information
                </button>

                <button
                  className={`btn text-start rounded-pill px-3 py-2 fw-semibold d-flex justify-content-between align-items-center ${
                    activeTab === 'addresses' ? 'btn-primary shadow-sm' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <span><i className="bi bi-geo-alt me-2"></i> Saved Addresses</span>
                  <span className={`badge rounded-pill ${activeTab === 'addresses' ? 'bg-white text-primary' : 'bg-secondary text-white'}`}>
                    {addresses.length}
                  </span>
                </button>

                <button
                  className={`btn text-start rounded-pill px-3 py-2 fw-semibold ${
                    activeTab === 'security' ? 'btn-primary shadow-sm' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock me-2"></i> Security &amp; Password
                </button>

                <hr className="my-2" />

                <Link to="/orders" className="btn btn-outline-secondary btn-sm rounded-pill text-start px-3 py-2">
                  <i className="bi bi-box2 me-2"></i> My Order History
                </Link>

                <Link to="/wishlist" className="btn btn-outline-secondary btn-sm rounded-pill text-start px-3 py-2">
                  <i className="bi bi-heart me-2"></i> Saved Wishlist
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-outline-primary btn-sm rounded-pill text-start px-3 py-2">
                    <i className="bi bi-speedometer2 me-2"></i> Admin Panel
                  </Link>
                )}

                <button
                  className="btn btn-outline-danger btn-sm rounded-pill text-start px-3 py-2 mt-1"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="col-lg-8">
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'profile' && (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-person-fill text-primary me-2"></i> Personal Details
                  </h5>
                  <span className="text-muted small">Keep your contact info current</span>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Email Address (Registered)</label>
                      <input
                        type="email"
                        className="form-control rounded-3 bg-light"
                        value={user.email}
                        disabled
                      />
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Email address is tied to your account login.
                      </span>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Mobile Number (India) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">+91</span>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Used for delivery SMS, OTP, and dispatch coordination.
                      </span>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Primary Address Overview</label>
                      <div className="p-2 bg-light rounded-3 small text-truncate">
                        {user.address || 'No primary address configured yet.'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES (ADDRESS BOOK) */}
            {activeTab === 'addresses' && (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-geo-alt-fill text-primary me-2"></i> Address Book
                    </h5>
                    <span className="text-muted small">Manage addresses for one-click checkout</span>
                  </div>
                  <button
                    onClick={openAddAddressModal}
                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <Loading message="Loading address book..." />
                ) : addresses.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="d-inline-flex p-3 rounded-circle bg-light text-muted mb-3">
                      <i className="bi bi-geo fs-1"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No delivery addresses saved</h6>
                    <p className="text-muted small mb-3">
                      Add your home or office address to enable instant one-click express delivery.
                    </p>
                    <button
                      onClick={openAddAddressModal}
                      className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold"
                    >
                      + Add Address Now
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="col-12 col-md-6">
                        <div
                          className={`card rounded-4 p-3 h-100 position-relative ${
                            addr.is_default
                              ? 'border-2 border-primary bg-primary-subtle bg-opacity-10 shadow-sm'
                              : 'border shadow-none bg-white'
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-dark rounded-pill px-2 py-1 small">
                                {addr.address_type}
                              </span>
                              {addr.is_default && (
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small fw-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-light rounded-circle p-1"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 small">
                                <li>
                                  <button
                                    className="dropdown-item py-1"
                                    onClick={() => openEditAddressModal(addr)}
                                  >
                                    <i className="bi bi-pencil me-2 text-primary"></i> Edit
                                  </button>
                                </li>
                                {!addr.is_default && (
                                  <li>
                                    <button
                                      className="dropdown-item py-1"
                                      onClick={() => handleSetDefaultAddress(addr.id)}
                                    >
                                      <i className="bi bi-star me-2 text-warning"></i> Set as Default
                                    </button>
                                  </li>
                                )}
                                <li><hr className="dropdown-divider my-1" /></li>
                                <li>
                                  <button
                                    className="dropdown-item py-1 text-danger"
                                    onClick={() => handleDeleteAddress(addr.id)}
                                  >
                                    <i className="bi bi-trash me-2"></i> Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <h6 className="fw-bold text-dark mb-1">{addr.full_name}</h6>
                          <div className="small text-muted mb-2">
                            <i className="bi bi-telephone me-1"></i> {addr.phone}
                          </div>
                          <p className="small text-secondary mb-3 flex-grow-1" style={{ lineHeight: '1.4' }}>
                            {addr.flat_no}, {addr.street}
                            {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                            <br />
                            <strong>{addr.city}, {addr.state} - {addr.pincode}</strong>
                          </p>

                          <div className="d-flex gap-2 pt-2 border-top">
                            <button
                              onClick={() => openEditAddressModal(addr)}
                              className="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1 fw-semibold"
                            >
                              Edit
                            </button>
                            {!addr.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="btn btn-outline-primary btn-sm rounded-pill flex-grow-1 fw-semibold"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-shield-lock-fill text-primary me-2"></i> Security &amp; Password
                  </h5>
                  <span className="text-muted small">Update your account credentials</span>
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Current Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">New Password (Min 8 characters)</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="submit"
                      className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm"
                      disabled={savingPass}
                    >
                      {savingPass ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* MODAL: ADD / EDIT ADDRESS */}
        {showAddressModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddressModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSaveAddress}>
                  <div className="modal-body pt-3">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Receiver Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Rahul Sharma"
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">10-Digit Mobile Number *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">+91</span>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="9876543210"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Flat / House No. / Building *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Flat 402, Royal Palms"
                          value={addrFlat}
                          onChange={(e) => setAddrFlat(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Street / Area / Sector *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Link Road, Andheri West"
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Landmark (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Near Infinity Mall"
                          value={addrLandmark}
                          onChange={(e) => setAddrLandmark(e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">City / Town *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Mumbai"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">6-Digit PIN Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 400053"
                          maxLength="6"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">State / Union Territory *</label>
                        <select
                          className="form-select"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          required
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold d-block">Address Type</label>
                        <div className="btn-group w-100" role="group">
                          {['Home', 'Work', 'Other'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`btn btn-sm ${
                                addrType === type ? 'btn-primary' : 'btn-outline-secondary'
                              }`}
                              onClick={() => setAddrType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isDefaultCheck"
                            checked={addrIsDefault}
                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                          />
                          <label className="form-check-label small fw-semibold" htmlFor="isDefaultCheck">
                            Make this my default delivery address
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4"
                      onClick={() => setShowAddressModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                      disabled={savingAddress}
                    >
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
