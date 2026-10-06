import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import GalaxyBottomNav from './GalaxyBottomNav';

export default function GalaxyLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 pb-5 pb-md-0">
        {children}
      </main>
      <Footer />

      {/* One UI Mobile Bottom Reachability Bar (Active on Mobile/Tablet) */}
      <div className="d-md-none">
        <GalaxyBottomNav />
      </div>
    </div>
  );
}
