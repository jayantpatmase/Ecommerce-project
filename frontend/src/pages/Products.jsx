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

  return (
    <div className="py-4">
      <div className="container">
        {/* Page Breadcrumb / Title */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Explore Products</h2>
            <p className="text-muted small mb-0">
              Showing {pagination.total} product{pagination.total === 1 ? '' : 's'} available in store
            </p>
          </div>

          {/* Controls: Filter toggle on mobile + Sorting Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-primary rounded-pill d-lg-none shadow-sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <i className="bi bi-funnel me-1"></i> {showMobileFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <select
              className="form-select form-select-sm shadow-sm rounded-pill"
              style={{ width: '170px' }}
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low-High</option>
              <option value="price_high">Price: High-Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Discounts</option>
              <option value="name_az">Name A-Z</option>
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
              <Loading message="Fetching products..." />
            ) : products.length === 0 ? (
              <EmptyState
                icon="bi-search"
                title="No matching products found"
                description="Try broadening your search term or adjusting price and category filters."
                actionText="Reset Filters"
                actionLink="/products"
              />
            ) : (
              <>
                <div className="row g-4">
                  {products.map((prod) => (
                    <div key={prod.id} className="col-12 col-sm-6 col-md-4">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.total_pages > 1 && (
                  <nav className="mt-5 d-flex justify-content-center">
                    <ul className="pagination shadow-sm">
                      <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateParams({ page: pagination.page - 1 })}
                          disabled={pagination.page <= 1}
                        >
                          &laquo; Previous
                        </button>
                      </li>

                      {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((pNum) => (
                        <li key={pNum} className={`page-item ${pagination.page === pNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => updateParams({ page: pNum })}
                          >
                            {pNum}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${pagination.page >= pagination.total_pages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => updateParams({ page: pagination.page + 1 })}
                          disabled={pagination.page >= pagination.total_pages}
                        >
                          Next &raquo;
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
