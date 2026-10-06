import React from 'react';

export default function ErrorMessage({ message = 'An error occurred while loading data.', onRetry = null }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between my-4 rounded-3 shadow-sm" role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <div>{message}</div>
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
