import React from 'react';

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Search by name, category or description...' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="input-group shadow-sm rounded-3 overflow-hidden">
        <span className="input-group-text bg-white border-end-0 text-muted ps-3">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0 py-2"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="btn btn-white bg-white border-start-0 border-end-0 text-muted"
            onClick={() => { onChange(''); if (onSearch) onSearch(); }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
        <button className="btn btn-primary px-4 fw-semibold" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
