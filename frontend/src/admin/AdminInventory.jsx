import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track stock edits locally { [productId]: number }
  const [stockEdits, setStockEdits] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getInventory({ status: statusFilter, search, limit: 50 });
      if (res.success) {
        setInventory(res.data.inventory);
        // Initialize stock edits
        const edits = {};
        res.data.inventory.forEach((i) => {
          edits[i.id] = i.stock;
        });
        setStockEdits(edits);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleStockChange = (id, val) => {
    const num = parseInt(val, 10);
    setStockEdits((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleSaveStock = async (id) => {
    const val = stockEdits[id];
    if (val === undefined || val < 0) {
      alert('Stock quantity must be zero or a positive integer.');
      return;
    }

    try {
      setUpdatingId(id);
      const res = await api.updateInventory({ product_id: id, stock: val });
      if (res.success) {
        await fetchInventory();
      }
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Inventory Management</h3>
          <p className="text-muted small mb-0">Monitor warehouse product inventory, safety thresholds and restock items</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Stock Levels</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
              <option value="low_stock">Low Stock (1–5 units)</option>
              <option value="in_stock">In Stock (6+ units)</option>
            </select>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInventory} />}

      {loading ? (
        <Loading message="Loading inventory items..." />
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle table-hover small">
              <thead className="table-light text-uppercase">
                <tr>
                  <th className="ps-3">Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-3" style={{ minWidth: '180px' }}>Adjust Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '40px', height: '40px' }} className="rounded bg-light overflow-hidden border">
                          <img
                            src={item.image || '/uploads/products/placeholder.svg'}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                          />
                        </div>
                        <div>
                          <strong className="text-dark d-block">{item.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>ID: #{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.category_name}</td>
                    <td className="fw-semibold">${Number(item.price).toFixed(2)}</td>
                    <td className="fw-bold fs-6">{item.stock}</td>
                    <td>
                      <span className={`badge bg-${item.stock_badge}-subtle text-${item.stock_badge} fw-semibold px-2 py-1`}>
                        {item.stock_status}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex align-items-center gap-2">
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          style={{ width: '80px' }}
                          min="0"
                          value={stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                        />
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={updatingId === item.id || stockEdits[item.id] === item.stock}
                          onClick={() => handleSaveStock(item.id)}
                        >
                          {updatingId === item.id ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No inventory records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
