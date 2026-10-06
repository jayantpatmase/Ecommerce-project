import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = 'bi-box-seam',
  title = 'No items found',
  description = 'There is currently nothing to display here.',
  actionText = 'Browse Products',
  actionLink = '/products'
}) {
  return (
    <div className="empty-state text-center my-4">
      <div className="empty-state-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h4 className="fw-bold text-dark">{title}</h4>
      <p className="text-muted mx-auto" style={{ maxWidth: '420px' }}>{description}</p>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-primary mt-2">
          {actionText}
        </Link>
      )}
    </div>
  );
}
