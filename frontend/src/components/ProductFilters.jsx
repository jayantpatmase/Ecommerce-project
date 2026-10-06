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
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="bi bi-funnel-fill text-primary"></i> Filter Products
        </h6>
        <button className="btn btn-sm text-primary fw-semibold p-0 border-0 bg-transparent" onClick={onReset}>
          Reset
        </button>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2" style={{ letterSpacing: '0.5px' }}>
          Categories
        </label>
        <div className="d-flex flex-column gap-1">
          <button
            className={`btn btn-sm text-start py-2 px-3 rounded-pill transition ${
              !selectedCategory ? 'btn-primary text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => onCategoryChange('')}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm text-start py-2 px-3 rounded-pill d-flex justify-content-between align-items-center transition ${
                String(selectedCategory) === String(cat.id) ? 'btn-primary text-white fw-bold shadow-sm' : 'btn-light text-dark'
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
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2" style={{ letterSpacing: '0.5px' }}>
          Price Range (₹)
        </label>
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control form-control-sm rounded-pill text-center"
            placeholder="Min ₹"
            min="0"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
          />
          <span className="text-muted fw-bold">-</span>
          <input
            type="number"
            className="form-control form-control-sm rounded-pill text-center"
            placeholder="Max ₹"
            min="0"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
          />
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2" style={{ letterSpacing: '0.5px' }}>
          Availability
        </label>
        <div className="form-check p-2 bg-light rounded-3 ps-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="inStockCheck"
            checked={inStockOnly}
            onChange={(e) => onStockToggle(e.target.checked)}
          />
          <label className="form-check-label small fw-semibold text-dark cursor-pointer" htmlFor="inStockCheck">
            In Stock Only
          </label>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2" style={{ letterSpacing: '0.5px' }}>
          Customer Rating
        </label>
        <div className="d-flex flex-column gap-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              className={`btn btn-sm text-start py-1 px-3 rounded-pill d-flex align-items-center justify-content-between ${
                String(minRating) === String(r) ? 'btn-primary text-white fw-bold' : 'btn-light text-dark'
              }`}
              onClick={() => onRatingChange(String(minRating) === String(r) ? '' : String(r))}
            >
              <div className="d-flex align-items-center gap-1">
                <i className="bi bi-star-fill text-warning"></i>
                <span>{r} Stars &amp; Above</span>
              </div>
              <i className="bi bi-chevron-right small opacity-50"></i>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Discount */}
      <div className="mb-3">
        <label className="form-label fw-bold small text-uppercase text-secondary mb-2" style={{ letterSpacing: '0.5px' }}>
          Discount
        </label>
        <div className="d-flex flex-wrap gap-1">
          {['10', '15', '20'].map((d) => (
            <button
              key={d}
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                String(minDiscount) === String(d) ? 'btn-primary text-white fw-bold' : 'btn-light text-dark'
              }`}
              onClick={() => onDiscountChange(String(minDiscount) === String(d) ? '' : String(d))}
            >
              {d}%+ Off
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
