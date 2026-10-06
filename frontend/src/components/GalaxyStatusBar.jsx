import React, { useState, useEffect } from 'react';

export default function GalaxyStatusBar({ isPhoneFrame, onToggleFrame }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="galaxy-status-bar d-flex justify-content-between align-items-center px-4 py-1 text-dark select-none">
      {/* Left: Clock */}
      <div className="d-flex align-items-center gap-1 font-monospace fw-bold" style={{ fontSize: '0.85rem' }}>
        <span>{time || '12:45'}</span>
      </div>

      {/* Center: Punch-Hole Camera */}
      <div className="galaxy-camera-hole shadow-inner"></div>

      {/* Right: Signals & Battery + Mode Toggle */}
      <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
        {/* Toggle Mode Button (visible on md+ screens) */}
        <button
          type="button"
          onClick={onToggleFrame}
          className="btn btn-sm py-0 px-2 rounded-pill border shadow-sm d-none d-lg-inline-flex align-items-center gap-1"
          style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.85)' }}
          title={isPhoneFrame ? "Switch to Wide Responsive View" : "Switch to Samsung Galaxy Phone Mockup Frame"}
        >
          <i className={`bi ${isPhoneFrame ? 'bi-arrows-fullscreen' : 'bi-phone'}`}></i>
          <span className="fw-semibold">{isPhoneFrame ? 'Wide' : 'Galaxy S24 Frame'}</span>
        </button>

        <span className="fw-semibold" style={{ fontSize: '0.72rem' }}>5G</span>
        <i className="bi bi-reception-4" title="Full Signal"></i>
        <i className="bi bi-wifi" title="Wi-Fi 6 Connected"></i>
        <div className="d-flex align-items-center gap-1">
          <span className="small fw-bold" style={{ fontSize: '0.72rem' }}>95%</span>
          <i className="bi bi-battery-charging text-success fs-6" title="Charging 95%"></i>
        </div>
      </div>
    </div>
  );
}
