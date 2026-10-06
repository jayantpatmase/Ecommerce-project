import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-box2"
          title="Sign in to view your orders"
          description="Log in to check past purchases, shipping progress, and download invoices."
          actionText="Log In"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading) return <Loading message="Loading your order history..." />;

  return (
    <div className="py-5 bg-light flex-grow-1">
      <div className="container">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">My Orders</h2>
          <p className="text-muted small mb-0">Track and manage your order history and invoices</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

        {orders.length === 0 ? (
          <EmptyState
            icon="bi-bag-x"
            title="No orders placed yet"
            description="You have not placed any orders yet. Discover high quality products in our catalog."
            actionText="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
