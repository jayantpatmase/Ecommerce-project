import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Company info */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold d-flex align-items-center gap-2 text-white">
              <i className="bi bi-bag-check-fill text-primary"></i>
              <span>E-Shop <span className="text-warning">India</span></span>
            </h5>
            <p className="text-secondary small mt-3" style={{ lineHeight: '1.6' }}>
              India's trusted online shopping destination engineered with modern full-stack architecture (React.js, PHP REST APIs, PDO & MySQL). Fast delivery across 19,000+ PIN codes with UPI, RuPay, and Cash on Delivery support.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <span className="badge bg-secondary">UPI / GPay / PhonePe</span>
              <span className="badge bg-secondary">RuPay / Cards</span>
              <span className="badge bg-secondary">Net Banking</span>
              <span className="badge bg-secondary">Cash on Delivery</span>
            </div>
            <div className="d-flex gap-3 text-secondary mt-3">
              <span className="cursor-pointer hover-text-white"><i className="bi bi-facebook fs-5"></i></span>
              <span className="cursor-pointer hover-text-white"><i className="bi bi-twitter-x fs-5"></i></span>
              <span className="cursor-pointer hover-text-white"><i className="bi bi-instagram fs-5"></i></span>
              <span className="cursor-pointer hover-text-white"><i className="bi bi-github fs-5"></i></span>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-uppercase small text-light mb-3">Quick Links</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none text-secondary">Home</Link></li>
              <li><Link to="/products" className="text-decoration-none text-secondary">All Products</Link></li>
              <li><Link to="/cart" className="text-decoration-none text-secondary">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="text-decoration-none text-secondary">My Wishlist</Link></li>
              <li><Link to="/orders" className="text-decoration-none text-secondary">Track Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase small text-light mb-3">Customer Service</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><span className="text-secondary">Free Delivery over ₹999</span></li>
              <li><span className="text-secondary">7-Day Easy Returns Guarantee</span></li>
              <li><span className="text-secondary">UPI & Cash on Delivery Available</span></li>
              <li><span className="text-secondary">GST Compliant Tax Invoices</span></li>
              <li><span className="text-secondary">Toll Free: 1800-123-4567</span></li>
              <li><span className="text-secondary">support@eshop.in</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase small text-light mb-3">Newsletter</h6>
            <p className="text-secondary small">Subscribe for festival deals, Diwali offers, and exclusive cashback announcements.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to E-Shop India Newsletter!'); }} className="mt-2">
              <div className="input-group input-group-sm mb-2">
                <input type="email" className="form-control" placeholder="Your email address" required />
                <button className="btn btn-primary" type="submit">Subscribe</button>
              </div>
            </form>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} E-Shop Inc. All rights reserved. Built with React.js, PHP REST & MySQL.
          </div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
