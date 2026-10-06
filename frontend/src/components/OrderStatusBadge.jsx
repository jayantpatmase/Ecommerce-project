import React from 'react';

export default function OrderStatusBadge({ status }) {
  const s = (status || '').toLowerCase();

  const configs = {
    pending: { bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', label: 'Pending', icon: 'bi-clock-history' },
    confirmed: { bg: 'bg-info-subtle text-info-emphasis border border-info-subtle', label: 'Confirmed', icon: 'bi-check2-circle' },
    packed: { bg: 'bg-primary-subtle text-primary border border-primary-subtle', label: 'Packed', icon: 'bi-box-seam' },
    shipped: { bg: 'bg-indigo-subtle text-indigo border border-indigo-subtle', style: { backgroundColor: '#eef2ff', color: '#6366f1', borderColor: '#c7d2fe' }, label: 'Shipped', icon: 'bi-truck' },
    delivered: { bg: 'bg-success-subtle text-success border border-success-subtle', label: 'Delivered', icon: 'bi-check-all' },
    cancelled: { bg: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Cancelled', icon: 'bi-x-circle' },
    paid: { bg: 'bg-success-subtle text-success border border-success-subtle', label: 'Paid', icon: 'bi-shield-check' },
    failed: { bg: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Failed', icon: 'bi-exclamation-octagon' },
    refunded: { bg: 'bg-secondary-subtle text-secondary border border-secondary-subtle', label: 'Refunded', icon: 'bi-arrow-counterclockwise' }
  };

  const conf = configs[s] || { bg: 'bg-secondary-subtle text-secondary', label: status || 'Unknown', icon: 'bi-info-circle' };

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-3 py-1 fw-semibold ${conf.bg}`}
      style={conf.style || {}}
    >
      <i className={`bi ${conf.icon}`}></i>
      {conf.label}
    </span>
  );
}
