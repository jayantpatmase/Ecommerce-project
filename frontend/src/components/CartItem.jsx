import React from 'react';
import { Link } from 'react-router-dom';

export default function CartItem({ item, onQuantityChange, onRemove, updating = false }) {
  const isOutOfStock = !item.is_available;

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
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
            Unit Price: <span className="fw-semibold text-dark">${Number(item.final_price).toFixed(2)}</span>
            {item.discount > 0 && (
              <span className="text-decoration-line-through ms-2">${Number(item.price).toFixed(2)}</span>
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
          <div className="input-group input-group-sm" style={{ maxWidth: '130px' }}>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={updating || item.quantity <= 1}
              onClick={() => onQuantityChange(item.cart_id, item.quantity - 1)}
            >
              <i className="bi bi-dash"></i>
            </button>
            <input
              type="text"
              className="form-control text-center fw-bold bg-white"
              value={item.quantity}
              readOnly
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={updating || item.quantity >= item.stock}
              onClick={() => onQuantityChange(item.cart_id, item.quantity + 1)}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>

        {/* Total & Remove */}
        <div className="col-6 col-sm-3 text-end d-flex flex-column align-items-end justify-content-center">
          <div className="fs-6 fw-bold text-dark mb-1">
            ${Number(item.item_total).toFixed(2)}
          </div>
          <button
            className="btn btn-sm btn-link text-danger text-decoration-none p-0 d-flex align-items-center gap-1"
            disabled={updating}
            onClick={() => onRemove(item.cart_id)}
          >
            <i className="bi bi-trash"></i>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
