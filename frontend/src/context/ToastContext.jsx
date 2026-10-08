import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating container */}
      <div
        className="toast-container position-fixed p-3"
        style={{
          top: '20px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let bgClass = 'bg-dark text-white';
          let iconClass = 'bi-info-circle-fill text-info';

          if (toast.type === 'success') {
            bgClass = 'bg-white text-dark border-success';
            iconClass = 'bi-check-circle-fill text-success';
          } else if (toast.type === 'danger' || toast.type === 'error') {
            bgClass = 'bg-white text-dark border-danger';
            iconClass = 'bi-exclamation-triangle-fill text-danger';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-white text-dark border-warning';
            iconClass = 'bi-exclamation-circle-fill text-warning';
          } else if (toast.type === 'primary') {
            bgClass = 'bg-primary text-white';
            iconClass = 'bi-stars text-warning';
          }

          return (
            <div
              key={toast.id}
              className={`card border shadow-lg rounded-4 p-3 mb-2 animate__animated animate__fadeInDown ${bgClass}`}
              style={{
                pointerEvents: 'auto',
                transition: 'all 0.3s ease',
                borderRadius: '18px'
              }}
            >
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${iconClass} fs-5`}></i>
                  <div className="small fw-semibold">{toast.message}</div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  aria-label="Close"
                  onClick={() => removeToast(toast.id)}
                  style={{ fontSize: '0.75rem' }}
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log('Toast:', msg)
    };
  }
  return context;
}
