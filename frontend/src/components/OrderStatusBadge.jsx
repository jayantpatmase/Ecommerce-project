import React from 'react';

export default function OrderStatusBadge({ status }) {
  const s = (status || '').toLowerCase();

  const configs = {
    pending: { bg: 'bg-warning text-dark', label: 'Pending', icon: 'bi-clock-history' },
    confirmed: { bg: 'bg-info text-dark', label: 'Confirmed', icon: 'bi-check2-circle' },
    packed: { bg: 'bg-primary text-white', label: 'Packed', icon: 'bi-box-seam' },
    shipped: { bg: 'bg-indigo text-white', style: { backgroundColor: '#6366f1' }, label: 'Shipped', icon: 'bi-truck' },
    delivered: { bg: 'bg-success text-white', label: 'Delivered', icon: 'bi-check-all' },
    cancelled: { bg: 'bg-danger text-white', label: 'Cancelled', icon: 'bi-x-circle' },
    paid: { bg: 'bg-success text-white', label: 'Paid', icon: 'bi-shield-check' },
    failed: { bg: 'bg-danger text-white', label: 'Failed', icon: 'bi-exclamation-octagon' },
    refunded: { bg: 'bg-secondary text-white', label: 'Refunded', icon: 'bi-arrow-counterclockwise' }
  };

  const conf = configs[s] || { bg: 'bg-secondary text-white', label: status || 'Unknown', icon: 'bi-info-circle' };

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold ${conf.bg}`}
      style={conf.style || {}}
    >
      <i className={`bi ${conf.icon}`}></i>
      {conf.label}
    </span>
  );
}
