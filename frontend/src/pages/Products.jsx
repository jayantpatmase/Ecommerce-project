import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' (Amazon/Flipkart style)

  // Filter States from URL or defaults
  const search           = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minPrice         = searchParams.get('min_price') || '';
  const maxPrice         = searchParams.get('max_price') || '';
  const inStockOnly      = searchParams.get('availability') === 'in_stock';
  const minRating        = searchParams.get('rating') || '';
  const minDiscount      = searchParams.get('discount') || '';
  const sort             = searchParams.get('sort') || 'newest';
  const page             = parseInt(searchParams.get('page') || '1', 10);

  // Load Categories once
  useEffect(() => {
    api.getCategories()
      .then((res) => { if (res.success) setCategories(res.data); })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Products whenever searchParams change
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        category: selectedCategory,
        min_price: minPrice,
        max_price: maxPrice,
        availability: inStockOnly ? 'in_stock' : '',
        rating: minRating,
        discount: minDiscount,
        sort,
        page,
        limit: 12
      };

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // Update URL helper
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: newParams.page || 1 };
    
    // Remove empty values
    Object.keys(merged).forEach((k) => {
      if (merged[k] === '' || merged[k] === null || merged[k] === undefined) {
        delete merged[k];
      }
    });

    setSearchParams(merged);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const activeCategoryObj = categories.find((c) => String(c.id) === String(selectedCategory));
  const hasActiveFilters = Boolean(
    search || selectedCategory || minPrice || maxPrice || inStockOnly || minRating || minDiscount
  );

  return (
    <div className="py-4 bg-light flex-grow-1">
      <div className="container">
        {/* Page Breadcrumb / Title & View Mode Toggle */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <h2 className="fw-extrabold text-dark mb-1">
              {activeCategoryObj ? activeCategoryObj.name : 'Explore All Products'}
            </h2>
            <p className="text-muted small mb-0">
              Showing {pagination.total} verified product{pagination.total === 1 ? '' : 's'} with Pan-India express delivery
            </p>
          </div>

          {/* Controls: View Mode + Sorting Dropdown */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Grid vs List View Switcher (Amazon / Flipkart Style) */}
            <div className="btn-group btn-group-sm bg-white border rounded-pill p-1 shadow-sm" role="group">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${viewMode === 'grid' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <i className="bi bi-grid-fill me-1"></i> Grid
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${viewMode === 'list' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'}`}
                onClick={() => setViewMode('list')}
                title="Detailed List View"
              >
                <i className="bi bi-list-ul me-1"></i> List
              </button>
            </div>

            <button
              className="btn btn-sm btn-outline-primary rounded-pill d-lg-none shadow-sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <i className="bi bi-funnel me-1"></i> {showMobileFilters ? 'Hide Filters' : 'Filters'}
            </button>

            <select
              className="form-select form-select-sm shadow-sm rounded-pill bg-white"
              style={{ width: '175px' }}
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
            >
              <option value="newest">Featured / Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discounts</option>
              <option value="name_az">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Top Search Bar */}
        <div className="mb-3">
          <SearchBar
            value={search}
            onChange={(val) => updateParams({ search: val })}
            onSearch={fetchProducts}
          />
        </div>

        {/* ACTIVE FILTER PILLS (Flipkart / Myntra Style) */}
        {hasActiveFilters && (
          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="small text-muted fw-semibold">Active Filters:</span>
            {search && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                Search: "{search}"
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ search: '' })}></i>
              </span>
            )}
            {selectedCategory && activeCategoryObj && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                Category: {activeCategoryObj.name}
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ category: '' })}></i>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ min_price: '', max_price: '' })}></i>
              </span>
            )}
            {inStockOnly && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                In Stock Only
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ availability: '' })}></i>
              </span>
            )}
            {minRating && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                {minRating}★ &amp; Above
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ rating: '' })}></i>
              </span>
            )}
            {minDiscount && (
              <span className="badge bg-white text-dark border rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-1">
                {minDiscount}% or more
                <i className="bi bi-x-circle-fill text-muted ms-1" style={{ cursor: 'pointer' }} onClick={() => updateParams({ discount: '' })}></i>
              </span>
            )}
            <button
              type="button"
              className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-2 fw-semibold"
              onClick={handleResetFilters}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Grid: Filters Sidebar + Products Grid */}
        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className={`col-lg-3 ${showMobileFilters ? 'd-block' : 'd-none d-lg-block'}`}>
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(catId) => updateParams({ category: catId })}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => updateParams({ min_price: min, max_price: max })}
              inStockOnly={inStockOnly}
              onStockToggle={(checked) => updateParams({ availability: checked ? 'in_stock' : '' })}
              minRating={minRating}
              onRatingChange={(r) => updateParams({ rating: r })}
              minDiscount={minDiscount}
              onDiscountChange={(d) => updateParams({ discount: d })}
              onReset={handleResetFilters}
            />
          </div>

          {/* Products List Area */}
          <div className="col-lg-9">
            {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

            {loading ? (
              <Loading message="Fetching verified products..." />
            ) : products.length === 0 ? (
              <EmptyState
                icon="bi-search"
                title="No matching products found"
                description="Try broadening your search term or adjusting price, rating, and category filters."
                actionText="Reset Filters"
                actionLink="/products"
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="row g-3">
                    {products.map((prod) => (
                      <div key={prod.id} className="col-12 col-sm-6 col-md-4">
                        <ProductCard product={prod} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {products.map((prod) => (
                      <ProductCard key={prod.id} product={prod} viewMode="list" />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {pagination.total_pages > 1 && (
                  <nav className="mt-5 d-flex justify-content-center">
                    <ul className="pagination shadow-sm rounded-pill overflow-hidden">
                      <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateParams({ page: pagination.page - 1 })}
                          disabled={pagination.page <= 1}
                        >
                          <i className="bi bi-chevron-left me-1"></i> Prev
                        </button>
                      </li>
                      {[...Array(pagination.total_pages)].map((_, i) => (
                        <li
                          key={i + 1}
                          className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => updateParams({ page: i + 1 })}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.page >= pagination.total_pages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateParams({ page: pagination.page + 1 })}
                          disabled={pagination.page >= pagination.total_pages}
                        >
                          Next <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
