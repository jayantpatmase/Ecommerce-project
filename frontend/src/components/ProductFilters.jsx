import React from 'react';

export default function ProductFilters({
  categories = [],
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onStockToggle,
  minRating,
  onRatingChange,
  minDiscount,
  onDiscountChange,
  onReset
}) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
        <h6 className="fw-bold mb-0 text-dark">
          <i className="bi bi-funnel me-2 text-primary"></i>Filters
        </h6>
        <button className="btn btn-sm btn-link text-decoration-none p-0 text-muted" onClick={onReset}>
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Category</label>
        <div className="d-flex flex-column gap-1">
          <button
            className={`btn btn-sm text-start py-1 px-2 rounded-2 ${!selectedCategory ? 'btn-primary text-white fw-bold' : 'btn-light text-dark'}`}
            onClick={() => onCategoryChange('')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm text-start py-1 px-2 rounded-2 d-flex justify-content-between align-items-center ${
                String(selectedCategory) === String(cat.id) ? 'btn-primary text-white fw-bold' : 'btn-light text-dark'
              }`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span>{cat.name}</span>
              {cat.product_count !== undefined && (
                <span className={`badge ${String(selectedCategory) === String(cat.id) ? 'bg-light text-dark' : 'bg-secondary-subtle text-secondary'} rounded-pill`}>
                  {cat.product_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Price Range (₹)</label>
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Min"
            min="0"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Max"
            min="0"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
          />
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Availability</label>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="inStockCheck"
            checked={inStockOnly}
            onChange={(e) => onStockToggle(e.target.checked)}
          />
          <label className="form-check-label small" htmlFor="inStockCheck">
            In Stock Only
          </label>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Customer Rating</label>
        <div className="d-flex flex-column gap-1">
          {[4, 3, 2].map((r) => (
            <div key={r} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="ratingFilter"
                id={`rating-${r}`}
                checked={Number(minRating) === r}
                onChange={() => onRatingChange(r)}
              />
              <label className="form-check-label small d-flex align-items-center gap-1" htmlFor={`rating-${r}`}>
                <span className="text-warning">
                  {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                </span>
                <span className="text-muted ms-1">&amp; Up</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Minimum Discount */}
      <div>
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Special Offers</label>
        <div className="d-flex flex-column gap-1">
          {[10, 15, 20].map((d) => (
            <div key={d} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="discountFilter"
                id={`discount-${d}`}
                checked={Number(minDiscount) === d}
                onChange={() => onDiscountChange(d)}
              />
              <label className="form-check-label small" htmlFor={`discount-${d}`}>
                {d}% or more off
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
