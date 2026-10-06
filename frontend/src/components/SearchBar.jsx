import React from 'react';

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search by product name, category or specs...' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div
        className="d-flex align-items-center shadow-sm bg-white border p-1 ps-3 transition"
        style={{
          borderRadius: 'var(--oneui-r-pill)',
          borderColor: 'var(--oneui-border)'
        }}
      >
        <i className="bi bi-search text-primary fs-5 me-2"></i>
        <input
          type="text"
          className="form-control border-0 bg-transparent py-2 px-1 shadow-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: '0.95rem' }}
        />
        {value && (
          <button
            type="button"
            className="btn btn-sm text-muted border-0 bg-transparent p-0 me-2"
            onClick={() => { onChange(''); if (onSearch) onSearch(); }}
            title="Clear search"
          >
            <i className="bi bi-x-circle-fill fs-5"></i>
          </button>
        )}
        <button className="btn btn-primary px-4 fw-bold shadow-sm" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
