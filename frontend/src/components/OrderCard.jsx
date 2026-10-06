import React from 'react';
import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrderCard({ order }) {
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 mb-3 bg-white">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="fw-bold text-dark fs-6">Order #{order.id}</span>
            <span className="text-muted small">• Placed on {formattedDate}</span>
          </div>
          <div className="small text-muted">
            Payment Method: <span className="fw-semibold text-dark">{order.payment_method}</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <OrderStatusBadge status={order.order_status} />
          <OrderStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="small text-muted mb-1">Total Amount</div>
          <div className="fs-5 fw-bold text-primary">
            ${Number(order.total_amount).toFixed(2)}
          </div>
        </div>

        <Link to={`/orders/${order.id}`} className="btn btn-outline-primary btn-sm px-3 fw-semibold">
          View Details &amp; Invoice <i className="bi bi-chevron-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}
