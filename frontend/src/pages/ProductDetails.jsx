import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import Reviews from '../components/Reviews';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshCounts } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingBundle, setAddingBundle] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlisted, setWishlisted] = useState(false);

  // Gallery multi-angle thumbnails & Lightbox
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sticky Bottom Bar trigger on scroll (Amazon / Flipkart style)
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Variants selection (Amazon / Flipkart / Myntra style)
  const [selectedColor, setSelectedColor] = useState('Phantom Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Delivery Pincode checker
  const [pincode, setPincode] = useState('400001');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Bank Offers modal state
  const [showBankOffersModal, setShowBankOffersModal] = useState(false);

  // Frequently Bought Together bundle
  const [bundleIncludeSecondary, setBundleIncludeSecondary] = useState(true);

  // Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Customer Q&A Search & List (Amazon Q&A)
  const [qaSearch, setQaSearch] = useState('');
  const [qaList, setQaList] = useState([
    {
      id: 1,
      q: 'Is Cash on Delivery (COD) available for this product?',
      a: 'Yes, Cash on Delivery is available across 19,000+ PIN codes in India. You can pay via cash or UPI QR code at your doorstep upon delivery.',
      votes: 42
    },
    {
      id: 2,
      q: 'How does the 7-day doorstep replacement guarantee work?',
      a: 'If you receive a defective, damaged, or mismatched product, you can request a 1-click replacement from your Orders page. Our courier partner (Blue Dart / Delhivery) will pick it up directly from your doorstep at zero extra cost.',
      votes: 38
    },
    {
      id: 3,
      q: 'Is this item authentic and does it include a brand warranty?',
      a: '100% Genuine. Every product is sourced directly from certified authorized distributors and comes with a 1-Year Pan-India Manufacturer Warranty plus an official GST Tax Invoice.',
      votes: 29
    },
    {
      id: 4,
      q: 'Can I claim GST Input Tax Credit on this purchase?',
      a: 'Yes, an official GST Tax Invoice (with CGST & SGST breakup) is generated instantly with every order. You can enter your company GSTIN during checkout to claim tax credit.',
      votes: 18
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Track scroll position for sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 420) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuantity(1);

        const [prodRes, relRes] = await Promise.all([
          api.getProduct(id),
          api.getRelatedProducts(id)
        ]);

        if (prodRes.success) {
          const p = prodRes.data;
          setProduct(p);
          setSelectedImage(p.image || '/uploads/products/placeholder.svg');

          // Determine initial size/variant
          const isTech = ['electronics', 'appliances', 'mobiles'].some((c) =>
            (p.category_name || '').toLowerCase().includes(c)
          );
          setSelectedSize(isTech ? '256 GB' : 'M');

          // Save to Recently Viewed in localStorage
          try {
            const rawStored = localStorage.getItem('eshop_recently_viewed');
            let list = rawStored ? JSON.parse(rawStored) : [];
            list = list.filter((item) => Number(item.id) !== Number(p.id));
            list.unshift({
              id: p.id,
              name: p.name,
              price: p.final_price || p.price,
              original_price: p.price,
              image: p.image,
              category_name: p.category_name,
              avg_rating: p.avg_rating
            });
            localStorage.setItem('eshop_recently_viewed', JSON.stringify(list.slice(0, 8)));
            setRecentlyViewed(list.slice(1, 7));
          } catch (storageErr) {
            console.error('Storage error', storageErr);
          }
        } else {
          setError(prodRes.message);
        }

        if (relRes.success) {
          setRelated(relRes.data);
        }
      } catch (err) {
        setError(err.message || 'Product could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadDetails();
  }, [id]);

  const handleCheckPincode = (e) => {
    e?.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      showToast('Please enter a valid 6-digit Indian PIN code.', 'warning');
      return;
    }
    setCheckingPin(true);
    setTimeout(() => {
      const pinNum = parseInt(pincode.trim(), 10);
      const deliveryDays = pinNum % 3 === 0 ? 2 : pinNum % 2 === 0 ? 3 : 4;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + deliveryDays);
      const formattedDate = targetDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });

      setPincodeStatus({
        pincode: pincode.trim(),
        available: true,
        date: formattedDate,
        fastest: deliveryDays <= 2,
        cod: true
      });
      setCheckingPin(false);
      showToast(`Delivery available to PIN ${pincode}! Expected by ${formattedDate}.`, 'success');
    }, 400);
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await api.addToCart(product.id, quantity);
      await refreshCounts();
      if (buyNow) {
        showToast(`Proceeding to checkout with ${product.name}...`, 'primary');
        navigate('/checkout');
      } else {
        showToast(`Added ${quantity} unit(s) of "${product.name}" (${selectedColor}, ${selectedSize}) to your cart!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Could not add to cart.', 'danger');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddBundleToCart = async (bundleItem) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingBundle(true);
      const calls = [api.addToCart(product.id, 1)];
      if (bundleIncludeSecondary && bundleItem) {
        calls.push(api.addToCart(bundleItem.id, 1));
      }
      await Promise.all(calls);
      await refreshCounts();
      showToast(
        bundleIncludeSecondary
          ? `Bundle added! "${product.name}" + "${bundleItem.name}" added to cart.`
          : `Added "${product.name}" to cart.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Could not add bundle items.', 'danger');
    } finally {
      setAddingBundle(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (wishlisted) {
        await api.removeFromWishlist(null, product.id);
        setWishlisted(false);
        showToast('Removed from your saved wishlist', 'info');
      } else {
        await api.addToWishlist(product.id);
        setWishlisted(true);
        showToast('Added to your saved wishlist!', 'success');
      }
      await refreshCounts();
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'danger');
    }
  };

  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard! Share it with friends.', 'info');
    } else {
      showToast('Share link: ' + window.location.href, 'info');
    }
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newEntry = {
      id: Date.now(),
      q: newQuestionText.trim(),
      a: 'Thank you for asking! Our verified product support team will answer this question within 2 hours.',
      votes: 1
    };
    setQaList([newEntry, ...qaList]);
    setNewQuestionText('');
    showToast('Your question has been posted to community Q&A!', 'success');
  };

  if (loading) return <Loading message="Loading product information..." />;
  if (error || !product) return <div className="container py-5"><ErrorMessage message={error || 'Product not found.'} /></div>;

  const isOutOfStock = Number(product.stock) <= 0;
  const hasDiscount  = Number(product.discount) > 0;
  const isTechCategory = ['electronics', 'appliances', 'mobiles', 'audio', 'laptop'].some((c) =>
    (product.category_name || '').toLowerCase().includes(c)
  );

  // Dynamic gallery angles (Multi-Angle Switcher)
  const mainImg = product.image || '/uploads/products/placeholder.svg';
  const galleryAngles = [
    { label: 'Front View', url: mainImg },
    { label: 'Side Angle', url: mainImg },
    { label: 'Packaging', url: mainImg },
    { label: 'Macro Detail', url: mainImg }
  ];

  // Available variant options
  const colorOptions = [
    { name: 'Phantom Black', hex: '#1e1e1e' },
    { name: 'Mystic Silver', hex: '#d1d5db' },
    { name: 'Sapphire Blue', hex: '#0072de' },
    { name: 'Rose Titanium', hex: '#c59b9b' }
  ];

  const sizeOptions = isTechCategory
    ? ['128 GB', '256 GB', '512 GB', '1 TB']
    : ['S', 'M', 'L', 'XL', 'XXL'];

  // Bundle Item (Companion from related products)
  const bundleCompanion = related.length > 0 ? related[0] : null;
  const bundleSavings = bundleCompanion ? Math.round(bundleCompanion.final_price * 0.1) : 0;
  const bundleTotalPrice = bundleCompanion
    ? Math.round((product.final_price + (bundleIncludeSecondary ? bundleCompanion.final_price - bundleSavings : 0)) * 100) / 100
    : product.final_price;

  // Filter Q&A
  const filteredQa = qaList.filter(
    (item) =>
      item.q.toLowerCase().includes(qaSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(qaSearch.toLowerCase())
  );

  return (
    <div className="py-4 bg-light flex-grow-1">
      <div className="container">
        {/* Breadcrumb & Social Share */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none">Products</Link></li>
              <li className="breadcrumb-item">
                <Link to={`/products?category=${product.category_id}`} className="text-decoration-none">
                  {product.category_name}
                </Link>
              </li>
              <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '280px' }}>{product.name}</li>
            </ol>
          </nav>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 shadow-sm"
              onClick={handleShareProduct}
              title="Share Product"
            >
              <i className="bi bi-share"></i>
              <span className="small">Share</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 shadow-sm ${
                wishlisted ? 'btn-danger text-white' : 'btn-outline-danger'
              }`}
              onClick={handleToggleWishlist}
            >
              <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span className="small">{wishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* TOP PRODUCT HERO SECTION */}
        <div className="row g-4 mb-5">
          {/* LEFT: Multi-Angle Interactive Gallery with Lightbox trigger */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3 bg-white sticky-top" style={{ top: '90px' }}>
              {/* Main Active Image with Zoom Feel */}
              <div
                className="ratio ratio-1x1 bg-light rounded-4 overflow-hidden d-flex align-items-center justify-content-center position-relative mb-3 border"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setLightboxOpen(true)}
                title="Click to Zoom Fullscreen"
              >
                <img
                  src={selectedImage || mainImg}
                  alt={product.name}
                  className="object-fit-contain p-4 w-100 h-100 transition-all"
                  style={{ transition: 'transform 0.3s ease' }}
                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                />
                <span className="position-absolute bottom-0 start-0 m-3 badge bg-white text-secondary border shadow-sm rounded-pill px-3 py-2 small">
                  <i className="bi bi-arrows-fullscreen me-1 text-primary"></i> Click to Zoom (360° Inspect)
                </span>
                {hasDiscount && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-danger text-white rounded-pill px-3 py-2 fw-bold shadow-sm">
                    {Number(product.discount)}% OFF
                  </span>
                )}
              </div>

              {/* Angle Thumbnails Carousel / Selector */}
              <div className="d-flex gap-2 justify-content-center">
                {galleryAngles.map((angle, idx) => {
                  const isCur = selectedImage === angle.url && idx === 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(angle.url)}
                      className={`btn p-1 rounded-3 border bg-light d-flex flex-column align-items-center ${
                        isCur ? 'border-primary shadow-sm ring' : 'border-light-subtle'
                      }`}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderWidth: '2px',
                        borderColor: isCur ? '#0072de' : undefined
                      }}
                      title={angle.label}
                    >
                      <img
                        src={angle.url}
                        alt={angle.label}
                        className="w-100 h-100 object-fit-contain rounded-2"
                        onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Safe Shopping Guarantee Trust Strip */}
              <div className="row g-2 mt-3 pt-3 border-top text-center text-secondary small">
                <div className="col-3">
                  <i className="bi bi-arrow-repeat text-primary fs-5 d-block mb-1"></i>
                  <span className="fw-semibold">7-Day Return</span>
                </div>
                <div className="col-3">
                  <i className="bi bi-shield-check text-success fs-5 d-block mb-1"></i>
                  <span className="fw-semibold">100% Genuine</span>
                </div>
                <div className="col-3">
                  <i className="bi bi-truck text-info fs-5 d-block mb-1"></i>
                  <span className="fw-semibold">Free Express</span>
                </div>
                <div className="col-3">
                  <i className="bi bi-file-earmark-check text-warning fs-5 d-block mb-1"></i>
                  <span className="fw-semibold">GST Invoice</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details, Variants & Actions */}
          <div className="col-lg-6 d-flex flex-column">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white flex-grow-1">
              {/* Category & Flipkart Assured Pill */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-primary-subtle text-primary px-3 py-2 text-uppercase fw-bold rounded-pill" style={{ fontSize: '0.75rem' }}>
                  {product.category_name}
                </span>
                <span className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill px-3 py-1 fw-bold small">
                  ⚡ E-Shop Assured Prime
                </span>
              </div>

              <h1 className="h3 fw-bold text-dark mb-2">{product.name}</h1>

              {/* Ratings Summary (Amazon / Flipkart star pill) */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="badge bg-success text-white px-2 py-1 rounded-pill d-flex align-items-center gap-1">
                  <span>{product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : '4.5'}</span>
                  <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.75rem' }}></i>
                </div>
                <span className="text-secondary small fw-medium">
                  {product.review_count || 14} Verified Ratings &amp; Reviews
                </span>
                <span className="text-muted small">•</span>
                <span className="text-muted small">SKU: IND-{product.id}-2026</span>
              </div>

              {/* Price Block */}
              <div className="p-3 bg-light rounded-4 mb-3 border">
                <div className="d-flex align-items-baseline gap-3 mb-1">
                  <span className="display-6 fw-extrabold text-primary">
                    {formatPrice(product.final_price || product.price)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="fs-5 text-muted text-decoration-line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="badge bg-danger fs-6 px-2 py-1 rounded-pill">
                        {Number(product.discount)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                  Inclusive of all taxes (CGST + SGST). Free Pan-India Doorstep Delivery over ₹999.
                </span>
              </div>

              {/* BANK OFFERS & NO-COST EMI ACCORDION (Amazon / Flipkart Signature) */}
              <div className="p-3 rounded-4 bg-light border border-info border-opacity-25 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold text-dark small d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card-2-front-fill text-primary"></i> Bank Offers &amp; No Cost EMI
                  </div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary small fw-semibold text-decoration-none"
                    onClick={() => setShowBankOffersModal(true)}
                  >
                    View All (4 Offers)
                  </button>
                </div>

                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-success-subtle text-success mt-1 fw-bold">BANK OFFER</span>
                    <span className="text-dark">
                      Flat <strong>₹1,500 Instant Discount</strong> on HDFC &amp; SBI Credit Card EMI transactions.
                    </span>
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-info-subtle text-info-emphasis mt-1 fw-bold">NO COST EMI</span>
                    <span className="text-dark">
                      Avail No Cost EMI starting at <strong>{formatPrice(Math.round(product.final_price / 6))}/mo</strong> for 6 months.
                    </span>
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <span className="badge bg-warning-subtle text-dark mt-1 fw-bold">SUPERCOINS</span>
                    <span className="text-dark">
                      Earn <strong>25 SuperCoins</strong> on this order. 1 Coin = ₹1 discount on next purchases.
                    </span>
                  </div>
                </div>
              </div>

              {/* Flipkart-Style Highlights Bullets */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark small mb-2">Key Highlights:</h6>
                <div className="row g-2 small text-secondary">
                  <div className="col-sm-6 d-flex align-items-center gap-2">
                    <i className="bi bi-patch-check-fill text-primary"></i>
                    <span>1-Year Pan-India Warranty</span>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center gap-2">
                    <i className="bi bi-box-seam-fill text-success"></i>
                    <span>7-Day Doorstep Replacement</span>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center gap-2">
                    <i className="bi bi-truck text-info"></i>
                    <span>Free Express Delivery over ₹999</span>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center gap-2">
                    <i className="bi bi-receipt text-warning"></i>
                    <span>Official GST Tax Invoice</span>
                  </div>
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark small">
                    Color: <span className="text-primary fw-semibold">{selectedColor}</span>
                  </span>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  {colorOptions.map((c) => {
                    const isSel = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`btn p-1 rounded-circle border d-flex align-items-center justify-content-center ${
                          isSel ? 'ring ring-primary shadow-sm' : ''
                        }`}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: c.hex,
                          borderColor: isSel ? '#0072de' : '#dee2e6',
                          borderWidth: isSel ? '3px' : '1px'
                        }}
                        title={c.name}
                      >
                        {isSel && (
                          <i
                            className="bi bi-check-lg"
                            style={{ color: ['#1e1e1e', '#0072de'].includes(c.hex) ? '#fff' : '#000' }}
                          ></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size / Capacity Variant Selector with Size Chart modal link */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark small">
                    {isTechCategory ? 'Storage Capacity:' : 'Size:'}{' '}
                    <span className="text-primary fw-semibold">{selectedSize}</span>
                  </span>
                  {!isTechCategory && (
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-semibold text-primary"
                      onClick={() => setShowSizeModal(true)}
                    >
                      <i className="bi bi-rulers me-1"></i> Size Chart &amp; Fit Guide
                    </button>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {sizeOptions.map((sz) => {
                    const isSel = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`btn px-3 py-2 rounded-3 fw-semibold small ${
                          isSel ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Indian Pincode Delivery Estimator */}
              <div className="p-3 rounded-4 bg-light border mb-4">
                <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
                  <i className="bi bi-geo-alt text-danger"></i> Check Delivery to Your Pincode
                </label>
                <form onSubmit={handleCheckPincode} className="d-flex gap-2">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded-start-pill"
                      placeholder="Enter 6-digit PIN code"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                      className="btn btn-outline-primary rounded-end-pill px-4 fw-semibold"
                      type="submit"
                      disabled={checkingPin}
                    >
                      {checkingPin ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                </form>

                {pincodeStatus && (
                  <div className="mt-3 pt-2 border-top small">
                    <div className="d-flex align-items-center gap-2 text-success fw-bold">
                      <i className="bi bi-truck fs-5"></i>
                      <span>
                        Delivery to {pincodeStatus.pincode} by {pincodeStatus.date} •{' '}
                        <span className="badge bg-success-subtle text-success">FREE</span>
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-secondary mt-1">
                      <i className="bi bi-cash-stack text-primary"></i>
                      <span>Cash on Delivery (COD) available for this location</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold text-secondary small">Availability:</span>
                  {isOutOfStock ? (
                    <span className="badge bg-danger-subtle text-danger px-3 py-2 fw-semibold rounded-pill">
                      Out of Stock
                    </span>
                  ) : Number(product.stock) <= 5 ? (
                    <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 fw-semibold rounded-pill">
                      <i className="bi bi-fire me-1"></i> Only {product.stock} left in stock — order soon!
                    </span>
                  ) : (
                    <span className="badge bg-success-subtle text-success px-3 py-2 fw-semibold rounded-pill">
                      <i className="bi bi-check-circle me-1"></i> In Stock ({product.stock} units ready to ship)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span className="fw-semibold text-secondary small">Quantity:</span>
                  <div className="input-group" style={{ width: '130px' }}>
                    <button
                      className="btn btn-outline-secondary rounded-start-pill"
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center fw-bold"
                      value={quantity}
                      min="1"
                      max={product.stock}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (v >= 1 && v <= product.stock) setQuantity(v);
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary rounded-end-pill"
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons (Add to Cart, Buy Now) */}
              <div className="d-flex flex-wrap gap-3 mb-3" id="main-buy-buttons">
                <button
                  className="btn btn-primary btn-lg rounded-pill flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || addingToCart}
                >
                  <i className="bi bi-cart-plus fs-5"></i>
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <button
                  className="btn btn-success btn-lg rounded-pill flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock || addingToCart}
                >
                  <i className="bi bi-lightning-charge-fill fs-5"></i>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER (Amazon / Flipkart Style Bundle Deal) */}
        {bundleCompanion && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-5">
            <h4 className="fw-bold text-dark mb-1">Frequently Bought Together</h4>
            <p className="text-muted small mb-4">Customers who viewed this item also bought these companion accessories</p>

            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  {/* Item 1: Current Product */}
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border" style={{ minWidth: '240px' }}>
                    <div style={{ width: '60px', height: '60px' }} className="rounded-3 bg-white p-1 border overflow-hidden">
                      <img
                        src={product.image || '/uploads/products/placeholder.svg'}
                        alt={product.name}
                        className="w-100 h-100 object-fit-contain"
                        onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                      />
                    </div>
                    <div>
                      <span className="fw-bold text-dark small d-block text-truncate" style={{ maxWidth: '160px' }}>
                        {product.name}
                      </span>
                      <span className="fw-bold text-primary small">
                        {formatPrice(product.final_price || product.price)}
                      </span>
                    </div>
                  </div>

                  <span className="fs-3 text-muted fw-bold">+</span>

                  {/* Item 2: Companion Product */}
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border" style={{ minWidth: '240px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={bundleIncludeSecondary}
                      onChange={(e) => setBundleIncludeSecondary(e.target.checked)}
                      id="bundleCompanionCheck"
                    />
                    <label htmlFor="bundleCompanionCheck" className="d-flex align-items-center gap-3 m-0" style={{ cursor: 'pointer' }}>
                      <div style={{ width: '60px', height: '60px' }} className="rounded-3 bg-white p-1 border overflow-hidden">
                        <img
                          src={bundleCompanion.image || '/uploads/products/placeholder.svg'}
                          alt={bundleCompanion.name}
                          className="w-100 h-100 object-fit-contain"
                          onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                        />
                      </div>
                      <div>
                        <span className="fw-bold text-dark small d-block text-truncate" style={{ maxWidth: '150px' }}>
                          {bundleCompanion.name}
                        </span>
                        <span className="fw-bold text-primary small">
                          {formatPrice(bundleCompanion.final_price || bundleCompanion.price)}
                        </span>
                        {bundleSavings > 0 && (
                          <span className="badge bg-success-subtle text-success ms-2 small">Save ₹{bundleSavings}</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bundle Purchase CTA */}
              <div className="col-lg-4 border-start-lg ps-lg-4">
                <div className="p-3 bg-light rounded-4 border">
                  <div className="small text-secondary mb-1">Bundle Total Price:</div>
                  <div className="fs-4 fw-extrabold text-primary mb-2">
                    {formatPrice(bundleTotalPrice)}
                  </div>
                  {bundleIncludeSecondary && bundleSavings > 0 && (
                    <div className="badge bg-success text-white mb-3">
                      Combo Savings: {formatPrice(bundleSavings)}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-warning w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleAddBundleToCart(bundleCompanion)}
                    disabled={addingBundle}
                  >
                    <i className="bi bi-bag-plus-fill"></i>
                    {addingBundle ? 'Adding Bundle...' : 'Add Both to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS: PRODUCT DESCRIPTION & TECHNICAL SPECS */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-5">
          <ul className="nav nav-pills mb-3 border-bottom pb-3">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold rounded-pill px-4 ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Product Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold rounded-pill px-4 ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Technical Specifications
              </button>
            </li>
          </ul>

          <div className="tab-content py-2">
            {activeTab === 'description' ? (
              <div className="text-secondary" style={{ lineHeight: '1.8' }}>
                <p>{product.description || 'No detailed description provided for this product.'}</p>
                <div className="row g-3 mt-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-dark mb-1">Package Contents</h6>
                      <p className="small text-muted mb-0">1x Main Product Unit, User Manual, Warranty Card, Standard Accessories.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-dark mb-1">Manufacturer Warranty</h6>
                      <p className="small text-muted mb-0">1-Year Pan-India On-Site / Carry-In Warranty against manufacturing defects.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    {product.specifications ? (
                      product.specifications.split('|').map((spec, i) => {
                        const parts = spec.split(':');
                        return (
                          <tr key={i}>
                            <th className="bg-light text-secondary small text-uppercase" style={{ width: '30%' }}>
                              {parts[0]?.trim()}
                            </th>
                            <td className="text-dark small">
                              {parts[1]?.trim() || ''}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="text-muted">Standard manufacturer specifications apply.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER QUESTIONS & ANSWERS (Amazon Style Q&A Section) */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h4 className="fw-bold text-dark mb-1">Customer Questions &amp; Answers</h4>
              <p className="text-muted small mb-0">Have a question about this product? Find answers below</p>
            </div>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 small fw-bold">
              {qaList.length} Community Answers
            </span>
          </div>

          {/* Q&A Search bar */}
          <div className="input-group mb-4">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Have a question? Search for answers (e.g. warranty, delivery, cod)..."
              value={qaSearch}
              onChange={(e) => setQaSearch(e.target.value)}
            />
            {qaSearch && (
              <button className="btn btn-outline-secondary" type="button" onClick={() => setQaSearch('')}>
                Clear
              </button>
            )}
          </div>

          {/* Q&A List */}
          <div className="d-flex flex-column gap-3 mb-4">
            {filteredQa.map((item) => (
              <div key={item.id} className="p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <span className="badge bg-secondary-subtle text-dark fw-bold px-2 py-1">Q</span>
                  <strong className="text-dark">{item.q}</strong>
                </div>
                <div className="d-flex align-items-start gap-2 text-secondary small ps-4">
                  <span className="badge bg-primary-subtle text-primary fw-bold px-2 py-1">A</span>
                  <div>
                    <p className="mb-1 text-dark">{item.a}</p>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      <i className="bi bi-hand-thumbs-up me-1"></i> {item.votes} people found this helpful • Verified E-Shop Answer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Post Question Form */}
          <form onSubmit={handleAskQuestion} className="border-top pt-3">
            <label className="form-label small fw-bold text-dark">Don't see your question? Ask the community</label>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Type your question here..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary px-4 fw-semibold rounded-pill">
                Submit Question
              </button>
            </div>
          </form>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="mb-5">
          <Reviews productId={product.id} />
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="mb-5">
            <h4 className="fw-bold text-dark mb-4">You May Also Like</h4>
            <div className="row g-4">
              {related.slice(0, 4).map((rel) => (
                <div key={rel.id} className="col-12 col-sm-6 col-lg-3">
                  <ProductCard product={rel} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED PRODUCTS (Flipkart / Amazon Style) */}
        {recentlyViewed.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-0">Recently Viewed by You</h5>
                <span className="text-muted small">Based on your recent browsing history</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => {
                  localStorage.removeItem('eshop_recently_viewed');
                  setRecentlyViewed([]);
                  showToast('Browsing history cleared', 'info');
                }}
              >
                Clear History
              </button>
            </div>

            <div className="row g-3">
              {recentlyViewed.map((rv) => (
                <div key={rv.id} className="col-6 col-md-4 col-lg-2">
                  <Link to={`/products/${rv.id}`} className="text-decoration-none">
                    <div className="card border rounded-3 p-2 h-100 hover-shadow transition-all text-center">
                      <div className="ratio ratio-1x1 bg-light rounded-2 overflow-hidden mb-2">
                        <img
                          src={rv.image || '/uploads/products/placeholder.svg'}
                          alt={rv.name}
                          className="w-100 h-100 object-fit-contain p-2"
                          onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                        />
                      </div>
                      <div className="text-truncate fw-semibold text-dark small mb-1">{rv.name}</div>
                      <div className="fw-bold text-primary small">{formatPrice(rv.price)}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM ACTION BAR (Amazon & Flipkart Signature Purchase Bar) */}
      {showStickyBar && (
        <div
          className="position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-lg py-2 px-3 transition-all"
          style={{ zIndex: 1040, animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="container d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <div style={{ width: '48px', height: '48px' }} className="rounded-3 bg-light border p-1 flex-shrink-0">
                <img
                  src={selectedImage || mainImg}
                  alt={product.name}
                  className="w-100 h-100 object-fit-contain"
                  onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                />
              </div>
              <div className="d-none d-sm-block overflow-hidden">
                <div className="fw-bold text-dark text-truncate small" style={{ maxWidth: '300px' }}>
                  {product.name}
                </div>
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  {selectedColor} • {selectedSize}
                </span>
              </div>
              <div className="ps-2">
                <span className="fs-5 fw-extrabold text-primary">
                  {formatPrice(product.final_price || product.price)}
                </span>
                {hasDiscount && (
                  <span className="badge bg-danger ms-2 small">-{Number(product.discount)}%</span>
                )}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-3 fw-bold btn-sm d-flex align-items-center gap-1"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock || addingToCart}
              >
                <i className="bi bi-cart-plus"></i>
                <span className="d-none d-md-inline">Add to Cart</span>
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 fw-bold btn-sm d-flex align-items-center gap-1 shadow-sm"
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock || addingToCart}
              >
                <i className="bi bi-lightning-charge-fill"></i>
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX & ZOOM PREVIEW MODAL (Amazon / Myntra Inspect) */}
      {lightboxOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 1060 }}
        >
          <div className="d-flex justify-content-between align-items-center text-white px-3">
            <span className="fw-bold">{product.name} — Fullscreen Inspection</span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-pill"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              >
                <i className="bi bi-zoom-in"></i> Zoom In
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-pill"
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              >
                <i className="bi bi-zoom-out"></i> Zoom Out
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-pill"
                onClick={() => setZoomLevel(1)}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-circle"
                onClick={() => {
                  setLightboxOpen(false);
                  setZoomLevel(1);
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-center flex-grow-1 overflow-auto p-4">
            <img
              src={selectedImage || mainImg}
              alt=""
              style={{
                maxHeight: '80vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out'
              }}
            />
          </div>

          <div className="d-flex justify-content-center gap-2 pb-2">
            {galleryAngles.map((angle, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(angle.url)}
                className={`btn p-1 bg-white rounded-2 border ${selectedImage === angle.url ? 'border-primary ring' : ''}`}
                style={{ width: '60px', height: '60px' }}
              >
                <img src={angle.url} alt="" className="w-100 h-100 object-fit-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SIZE CHART & FIT GUIDE (Myntra Style) */}
      {showSizeModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-rulers text-primary"></i> Standard Size &amp; Fit Guide
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSizeModal(false)}></button>
              </div>
              <div className="modal-body pt-3">
                <p className="text-muted small mb-3">
                  Measurements are in inches and centimeters. For best fit, measure yourself with a flexible tape and compare against the table below.
                </p>

                <div className="table-responsive">
                  <table className="table table-bordered table-striped text-center small mb-3">
                    <thead className="table-light">
                      <tr>
                        <th>Size</th>
                        <th>Chest (in)</th>
                        <th>Waist (in)</th>
                        <th>Shoulder (in)</th>
                        <th>Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">S</td>
                        <td>36 - 38</td>
                        <td>30 - 32</td>
                        <td>16.5</td>
                        <td>27.5</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">M</td>
                        <td>38 - 40</td>
                        <td>32 - 34</td>
                        <td>17.5</td>
                        <td>28.5</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">L</td>
                        <td>40 - 42</td>
                        <td>34 - 36</td>
                        <td>18.5</td>
                        <td>29.5</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">XL</td>
                        <td>42 - 44</td>
                        <td>36 - 38</td>
                        <td>19.5</td>
                        <td>30.5</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">XXL</td>
                        <td>44 - 46</td>
                        <td>38 - 40</td>
                        <td>20.5</td>
                        <td>31.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info py-2 px-3 small rounded-3 mb-0">
                  <i className="bi bi-info-circle me-1"></i> If you fall between two sizes, we recommend selecting the larger size for a relaxed comfortable fit.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setShowSizeModal(false)}>
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALL BANK OFFERS & TERMS (Amazon India Style) */}
      {showBankOffersModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-credit-card-2-front-fill text-primary"></i> Available Bank &amp; Partner Offers
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowBankOffersModal(false)}></button>
              </div>
              <div className="modal-body pt-3">
                <div className="d-flex flex-column gap-3 small">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-bold text-dark mb-1">Offer 1: HDFC Bank Instant Discount</div>
                    <p className="text-secondary mb-1">Flat ₹1,500 Instant Discount on HDFC Bank Credit Card EMI transactions on min spend of ₹7,500.</p>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Valid till 31 Oct • Select card at checkout</span>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-bold text-dark mb-1">Offer 2: SBI Credit Card Savings</div>
                    <p className="text-secondary mb-1">10% Instant Discount up to ₹1,000 on SBI Credit Cards on orders above ₹4,000.</p>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Valid across all categories</span>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-bold text-dark mb-1">Offer 3: No Cost EMI on Credit Cards</div>
                    <p className="text-secondary mb-1">Zero interest EMI for 3 &amp; 6 months with ICICI, Axis, HDFC &amp; Kotak Bank cards.</p>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Interest refunded as upfront bank discount</span>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <div className="fw-bold text-dark mb-1">Offer 4: Business GST Invoice Credit</div>
                    <p className="text-secondary mb-1">Get an official tax invoice with 18% GST breakdown. Save up to 28% for business use.</p>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Enter GSTIN during checkout</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setShowBankOffersModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
