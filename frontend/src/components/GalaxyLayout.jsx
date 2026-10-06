import React from 'react';
import { useOneUITheme } from '../context/OneUIThemeContext';
import GalaxyStatusBar from './GalaxyStatusBar';
import Navbar from './Navbar';
import Footer from './Footer';
import GalaxyBottomNav from './GalaxyBottomNav';

export default function GalaxyLayout({ children }) {
  const { isPhoneFrame, togglePhoneFrame } = useOneUITheme();

  if (isPhoneFrame) {
    return (
      <div className="galaxy-desktop-stage">
        {/* Floating Top Switcher Bar on Desktop */}
        <div className="galaxy-stage-toolbar shadow-sm d-none d-lg-flex align-items-center justify-content-between px-4 py-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white px-3 py-1 rounded-pill fw-bold">
              <i className="bi bi-phone me-1"></i> Samsung Galaxy S24 Ultra • One UI 6.1
            </span>
            <span className="text-secondary small fw-semibold">
              Live Interactive Mobile Phone Simulation
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={togglePhoneFrame}
              className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold shadow-sm"
            >
              <i className="bi bi-arrows-fullscreen me-1"></i> Switch to Full-Width Responsive View
            </button>
          </div>
        </div>

        {/* Samsung Galaxy Mobile Phone Chassis */}
        <div className="galaxy-phone-wrapper">
          <div className="galaxy-phone-chassis">
            {/* Side Hardware Buttons */}
            <div className="galaxy-hardware-btn galaxy-btn-volume-up" title="Volume Up"></div>
            <div className="galaxy-hardware-btn galaxy-btn-volume-down" title="Volume Down"></div>
            <div className="galaxy-hardware-btn galaxy-btn-power" title="Side Key / Bixby"></div>

            {/* Inner AMOLED Screen Display */}
            <div className="galaxy-phone-screen">
              <GalaxyStatusBar isPhoneFrame={true} onToggleFrame={togglePhoneFrame} />
              <Navbar />
              <div className="galaxy-scroll-content">
                {children}
                <div style={{ height: '70px' }}></div>
              </div>
              <GalaxyBottomNav />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Width View
  return (
    <div className="galaxy-fluid-wrapper d-flex flex-column min-vh-100">
      <GalaxyStatusBar isPhoneFrame={false} onToggleFrame={togglePhoneFrame} />
      <Navbar />
      <main className="flex-grow-1" style={{ paddingBottom: '75px' }}>
        {children}
      </main>
      <Footer />
      <GalaxyBottomNav />
    </div>
  );
}
