import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import { formatPrice } from '../utils/format';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderId = searchParams.get('order_id') || location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [paySuccess, setPaySuccess] = useState(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getOrder(orderId);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Handle Online Payment simulation & server verification
  const handleSimulatedPayment = async (simulateDecline = false) => {
    try {
      setPaying(true);
      setPayError(null);
      setPaySuccess(null);

      // 1. Create payment intent
      const createRes = await api.createPayment(order.id);
      if (!createRes.success) throw new Error(createRes.message);

      const txnId = createRes.data.transaction_id;

      // 2. Server-side verification
      const verifyRes = await api.verifyPayment({
        order_id: order.id,
        transaction_id: txnId,
        simulate_failure: simulateDecline
      });

      if (verifyRes.success) {
        setPaySuccess('Payment verified successfully! Order is now confirmed.');
        await fetchOrder();
      }
    } catch (err) {
      setPayError(err.message || 'Payment verification was declined or failed.');
      await fetchOrder();
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loading message="Loading order confirmation..." />;

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold">Order Confirmed</h3>
        <p className="text-muted">Thank you for your purchase.</p>
        <Link to="/orders" className="btn btn-primary mt-2">View Your Orders</Link>
      </div>
    );
  }

  const isPendingOnlinePay = order.payment_method !== 'Cash on Delivery' && order.payment_status === 'pending';

  return (
    <div className="py-5 bg-light flex-grow-1 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow rounded-4 p-4 p-sm-5 bg-white text-center">
              {/* Header Icon */}
              <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mx-auto mb-3">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>

              <h2 className="fw-bold text-dark mb-2">Thank You For Your Order!</h2>
              <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                Your order has been recorded in our system. A confirmation email has been dispatched to <strong>{order.customer_email}</strong>.
              </p>

              {/* Order Info Badge Box */}
              <div className="bg-light p-4 rounded-4 my-4 text-start">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Order Number</span>
                    <strong className="fs-5 text-dark">#{order.id}</strong>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Total Amount</span>
                    <strong className="fs-5 text-primary">{formatPrice(order.total_amount)}</strong>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block mb-1">Order Status</span>
                    <OrderStatusBadge status={order.order_status} />
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted small d-block mb-1">Payment Status</span>
                    <OrderStatusBadge status={order.payment_status} />
                  </div>

                  <div className="col-12 border-top pt-2">
                    <span className="text-muted small d-block">Delivery Address</span>
                    <span className="text-dark small">{order.shipping_address}</span>
                  </div>
                </div>
              </div>

              {/* Online Payment Action Box */}
              {isPendingOnlinePay && (
                <div className="card border-primary bg-primary-subtle p-4 rounded-4 text-start mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-credit-card text-primary fs-4"></i>
                    <h5 className="fw-bold text-dark mb-0">Online Payment Required</h5>
                  </div>
                  <p className="small text-muted mb-3">
                    Your order total is <strong>{formatPrice(order.total_amount)}</strong>. Complete your payment using our secure gateway simulation to immediately confirm this order.
                  </p>

                  {payError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i> {payError}
                    </div>
                  )}

                  {paySuccess && (
                    <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
                      <i className="bi bi-check-circle-fill me-1"></i> {paySuccess}
                    </div>
                  )}

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-primary rounded-pill fw-bold px-4"
                      onClick={() => handleSimulatedPayment(false)}
                      disabled={paying}
                    >
                      {paying ? 'Verifying with Gateway...' : `Pay Online Now (${formatPrice(order.total_amount)})`}
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      onClick={() => handleSimulatedPayment(true)}
                      disabled={paying}
                      title="Test payment failure handling and retry flow"
                    >
                      Simulate Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Options */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to={`/orders/${order.id}`} className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm">
                  <i className="bi bi-receipt me-1"></i> View Order Details &amp; Invoice
                </Link>
                <Link to="/products" className="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
