import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    specifications: '',
    price: '',
    discount: '0',
    stock: '',
    status: 1,
    image: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.getAdminCategories();
        if (catRes.success) setCategories(catRes.data);

        if (isEdit) {
          const prodRes = await api.getProduct(id);
          if (prodRes.success) {
            const p = prodRes.data;
            setForm({
              name: p.name || '',
              category_id: p.category_id || '',
              description: p.description || '',
              specifications: p.specifications || '',
              price: p.price || '',
              discount: p.discount || '0',
              stock: p.stock || '',
              status: p.status !== undefined ? p.status : 1,
              image: p.image || ''
            });
            if (p.image) setImagePreview(p.image);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      if (isEdit) formData.append('id', id);
      formData.append('name', form.name);
      formData.append('category_id', form.category_id);
      formData.append('description', form.description);
      formData.append('specifications', form.specifications);
      formData.append('price', form.price);
      formData.append('discount', form.discount);
      formData.append('stock', form.stock);
      formData.append('status', form.status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image) {
        formData.append('image', form.image);
      }

      if (isEdit) {
        await api.updateAdminProduct(formData);
      } else {
        await api.createAdminProduct(formData);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading product data..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <p className="text-muted small mb-0">
            {isEdit ? 'Update product details and stock status' : 'Fill in the information below to publish a new product'}
          </p>
        </div>
        <Link to="/admin/products" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Products
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-3">General Information</h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ultra Gaming Headset"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Category *</label>
                <select
                  className="form-select"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Detailed Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write clear, appealing product details..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Technical Specifications (Pipe '|' Separated)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="specifications"
                  value={form.specifications}
                  onChange={handleChange}
                  placeholder="e.g. Battery: 40h | Weight: 250g | Connectivity: Bluetooth 5.3"
                ></textarea>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Pricing &amp; Inventory</h5>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Regular Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-control"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-3">Product Media</h5>

              <div className="mb-3 text-center">
                <div className="ratio ratio-1x1 bg-light rounded-3 overflow-hidden border mb-2">
                  <img
                    src={imagePreview || '/uploads/products/placeholder.svg'}
                    alt="Preview"
                    className="object-fit-contain p-2"
                    onError={(e) => { e.target.src = '/uploads/products/placeholder.svg'; }}
                  />
                </div>
                <span className="text-muted small">Allowed formats: JPG, PNG, WEBP (Max 5MB)</span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Upload New Image File</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Or Enter Image URL / Path</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="image"
                  value={form.image}
                  onChange={(e) => {
                    handleChange(e);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="/uploads/products/headphones.svg"
                />
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Publishing Status</h5>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="statusSwitch"
                  name="status"
                  checked={Number(form.status) === 1}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="statusSwitch">
                  {Number(form.status) === 1 ? 'Product Active (Visible in store)' : 'Disabled / Hidden'}
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                disabled={saving}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
