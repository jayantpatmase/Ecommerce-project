/**
 * Centralized API Client Service
 * E-Commerce Website - Online Shopping Management System
 */

const API_BASE = 'http://localhost/ecommerce/backend/api';

/**
 * Common HTTP request handler with cookie credentials
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Crucial for PHP session persistence
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({
      success: false,
      message: `Server returned invalid response status: ${response.status}`,
      errors: []
    }));

    if (!response.ok && result.success !== true) {
      const error = new Error(result.message || 'Request failed');
      error.status = response.status;
      error.errors = result.errors || [];
      error.data = result.data;
      throw error;
    }

    return result;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network connection failed. Please check backend server.';
    }
    throw error;
  }
}

export const api = {
  // --- AUTHENTICATION & PROFILE ---
  register: (data) => request('/auth/register.php', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login.php', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout.php', { method: 'POST' }),
  getProfile: () => request('/auth/profile.php', { method: 'GET' }),
  getUserProfile: () => request('/user/profile.php', { method: 'GET' }),
  updateProfile: (data) => request('/user/update-profile.php', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (data) => request('/user/update-address.php', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data) => request('/user/change-password.php', { method: 'POST', body: JSON.stringify(data) }),

  // --- CATEGORIES & PRODUCTS ---
  getCategories: () => request('/categories/list.php', { method: 'GET' }),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/products/list.php?${query.toString()}`, { method: 'GET' });
  },
  getProduct: (id) => request(`/products/get.php?id=${id}`, { method: 'GET' }),
  getRelatedProducts: (productId) => request(`/products/related.php?product_id=${productId}`, { method: 'GET' }),

  // --- SHOPPING CART ---
  getCart: () => request('/cart/list.php', { method: 'GET' }),
  addToCart: (productId, quantity = 1) => request('/cart/add.php', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  updateCart: (cartId, quantity) => request('/cart/update.php', { method: 'POST', body: JSON.stringify({ cart_id: cartId, quantity }) }),
  removeFromCart: (cartId) => request('/cart/delete.php', { method: 'POST', body: JSON.stringify({ cart_id: cartId }) }),

  // --- WISHLIST ---
  getWishlist: () => request('/wishlist/list.php', { method: 'GET' }),
  addToWishlist: (productId) => request('/wishlist/add.php', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
  removeFromWishlist: (wishlistId, productId) => request('/wishlist/delete.php', { method: 'POST', body: JSON.stringify({ wishlist_id: wishlistId, product_id: productId }) }),
  moveWishlistToCart: (productId) => request('/wishlist/move-to-cart.php', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),

  // --- ORDERS & CHECKOUT ---
  createOrder: (data) => request('/orders/create.php', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/orders/list.php', { method: 'GET' }),
  getOrder: (id) => request(`/orders/get.php?id=${id}`, { method: 'GET' }),
  cancelOrder: (orderId) => request('/orders/cancel.php', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),

  // --- REVIEWS & RATINGS ---
  getReviews: (productId) => request(`/reviews/list.php?product_id=${productId}`, { method: 'GET' }),
  addReview: (data) => request('/reviews/add.php', { method: 'POST', body: JSON.stringify(data) }),
  updateReview: (data) => request('/reviews/update.php', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (reviewId) => request('/reviews/delete.php', { method: 'POST', body: JSON.stringify({ review_id: reviewId }) }),

  // --- PAYMENTS ---
  createPayment: (orderId) => request('/payments/create.php', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),
  verifyPayment: (data) => request('/payments/verify.php', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentStatus: (orderId) => request(`/payments/status.php?order_id=${orderId}`, { method: 'GET' }),
  refundPayment: (orderId) => request('/payments/refund.php', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),

  // --- INVOICES ---
  generateInvoice: (orderId) => request('/invoices/generate.php', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),
  getInvoice: (orderId) => request(`/invoices/get.php?order_id=${orderId}`, { method: 'GET' }),

  // --- ADMINISTRATOR ENDPOINTS ---
  getAdminDashboard: () => request('/admin/dashboard.php', { method: 'GET' }),
  getAdminProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/products/list.php?${q}`, { method: 'GET' });
  },
  createAdminProduct: (formDataOrJson) => {
    const isForm = formDataOrJson instanceof FormData;
    return request('/admin/products/create.php', {
      method: 'POST',
      body: isForm ? formDataOrJson : JSON.stringify(formDataOrJson)
    });
  },
  updateAdminProduct: (formDataOrJson) => {
    const isForm = formDataOrJson instanceof FormData;
    return request('/admin/products/update.php', {
      method: 'POST',
      body: isForm ? formDataOrJson : JSON.stringify(formDataOrJson)
    });
  },
  deleteAdminProduct: (id) => request('/admin/products/delete.php', { method: 'POST', body: JSON.stringify({ id }) }),

  getAdminCategories: () => request('/admin/categories/list.php', { method: 'GET' }),
  createCategory: (data) => request('/admin/categories/create.php', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (data) => request('/admin/categories/update.php', { method: 'POST', body: JSON.stringify(data) }),

  getAdminCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/customers/list.php?${q}`, { method: 'GET' });
  },

  getAdminOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/orders/list.php?${q}`, { method: 'GET' });
  },
  getAdminOrder: (id) => request(`/admin/orders/get.php?id=${id}`, { method: 'GET' }),
  updateOrderStatus: (data) => request('/admin/orders/update-status.php', { method: 'POST', body: JSON.stringify(data) }),

  getInventory: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/inventory/list.php?${q}`, { method: 'GET' });
  },
  updateInventory: (data) => request('/admin/inventory/update.php', { method: 'POST', body: JSON.stringify(data) })
};
