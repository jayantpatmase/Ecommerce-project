import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function CartItem({ item, onQuantityChange, onRemove, onSaveForLater, updating = false }) {
  const isOutOfStock = !item.is_available;

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
      <div className="row align-items-center g-3">
        {/* Product image */}
        <div className="col-3 col-sm-2">
          <div className="ratio ratio-1x1 rounded-3 overflow-hidden bg-light border">
            <img
              src={item.image || '/uploads/products/placeholder.svg'}
              alt={item.name}
              className="object-fit-cover"
              onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="col-9 col-sm-4">
          <span className="badge bg-secondary-subtle text-secondary small mb-1">
            {item.category_name}
          </span>
          <h6 className="fw-bold mb-1">
            <Link to={`/products/${item.product_id}`} className="text-dark text-decoration-none">
              {item.name}
            </Link>
          </h6>
          <div className="small text-muted">
            Unit Price: <span className="fw-semibold text-dark">{formatPrice(item.final_price)}</span>
            {item.discount > 0 && (
              <span className="text-decoration-line-through ms-2">{formatPrice(item.price)}</span>
            )}
          </div>
          {isOutOfStock && (
            <span className="badge bg-danger-subtle text-danger small mt-1">
              Quantity exceeds stock ({item.stock} left)
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="col-6 col-sm-3">
          <div
            className="d-inline-flex align-items-center bg-light border rounded-pill p-1 shadow-sm"
            style={{ flexWrap: 'nowrap' }}
          >
            <button
              className="btn btn-white rounded-circle p-0 d-flex align-items-center justify-content-center text-dark border shadow-sm"
              type="button"
              style={{ width: '28px', height: '28px', minWidth: '28px' }}
              disabled={updating || item.quantity <= 1}
              onClick={() => onQuantityChange(item.cart_id, item.quantity - 1)}
              title="Decrease quantity"
            >
              <i className="bi bi-dash"></i>
            </button>
            <span
              className="px-2 fw-bold text-dark text-center"
              style={{ minWidth: '32px', fontSize: '0.92rem', userSelect: 'none' }}
            >
              {item.quantity}
            </span>
            <button
              className="btn btn-white rounded-circle p-0 d-flex align-items-center justify-content-center text-dark border shadow-sm"
              type="button"
              style={{ width: '28px', height: '28px', minWidth: '28px' }}
              disabled={updating || item.quantity >= item.stock}
              onClick={() => onQuantityChange(item.cart_id, item.quantity + 1)}
              title="Increase quantity"
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>

        {/* Total & Remove */}
        <div className="col-6 col-sm-3 text-end d-flex flex-column align-items-end justify-content-center">
          <div className="fs-6 fw-bold text-dark mb-1">
            {formatPrice(item.item_total)}
          </div>
          <div className="d-flex gap-3 align-items-center">
            {onSaveForLater && (
              <button
                className="btn btn-sm btn-link text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                disabled={updating}
                onClick={() => onSaveForLater(item)}
              >
                <i className="bi bi-bookmark"></i>
                <span className="small">Save for later</span>
              </button>
            )}
            <button
              className="btn btn-sm btn-link text-danger text-decoration-none p-0 d-flex align-items-center gap-1"
              disabled={updating}
              onClick={() => onRemove(item.cart_id)}
            >
              <i className="bi bi-trash"></i>
              <span className="small">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
