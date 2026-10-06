import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reviews({ productId }) {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], total_reviews: 0, average_rating: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getReviews(productId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'warning', text: 'Please sign in to write a review.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      if (editingId) {
        await api.updateReview({
          review_id: editingId,
          rating,
          review: reviewText
        });
        setMessage({ type: 'success', text: 'Review updated successfully!' });
      } else {
        await api.addReview({
          product_id: productId,
          rating,
          review: reviewText
        });
        setMessage({ type: 'success', text: 'Thank you! Your review has been submitted.' });
      }

      setReviewText('');
      setEditingId(null);
      setRating(5);
      await fetchReviews();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Could not submit review.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (rev) => {
    setEditingId(rev.id);
    setRating(rev.rating);
    setReviewText(rev.review);
    window.scrollTo({ top: document.getElementById('review-form')?.offsetTop - 100, behavior: 'smooth' });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      await fetchReviews();
    } catch (err) {
      alert(err.message || 'Could not delete review');
    }
  };

  const userHasReviewed = user && data.reviews.some((r) => Number(r.user_id) === Number(user.id));

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
      <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        <i className="bi bi-chat-square-quote text-primary"></i> Customer Ratings &amp; Reviews
      </h5>

      {/* Summary Score Header */}
      <div className="row g-4 align-items-center pb-4 border-bottom mb-4">
        <div className="col-md-4 text-center border-end-md">
          <div className="display-4 fw-bold text-dark">{data.average_rating || '0.0'}</div>
          <div className="text-warning fs-5 my-1">
            {'★'.repeat(Math.round(data.average_rating || 0))}
            {'☆'.repeat(5 - Math.round(data.average_rating || 0))}
          </div>
          <div className="text-muted small">Based on {data.total_reviews} verified customer review{data.total_reviews === 1 ? '' : 's'}</div>
        </div>

        {/* Rating Bars */}
        <div className="col-md-8">
          <div className="d-flex flex-column gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.breakdown?.[stars] || 0;
              const pct = data.total_reviews > 0 ? (count / data.total_reviews) * 100 : 0;
              return (
                <div key={stars} className="d-flex align-items-center gap-2 small">
                  <span style={{ width: '50px' }} className="text-muted fw-semibold">{stars} Star</span>
                  <div className="progress flex-grow-1" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${pct}%` }}
                      aria-valuenow={pct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span style={{ width: '40px' }} className="text-muted text-end">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <div id="review-form" className="p-3 bg-light rounded-3 mb-4">
        <h6 className="fw-bold mb-3 text-dark">
          {editingId ? 'Edit Your Review' : userHasReviewed ? 'Your Submitted Review' : 'Write a Review'}
        </h6>

        {message && (
          <div className={`alert alert-${message.type} py-2 px-3 small rounded-3`}>
            {message.text}
          </div>
        )}

        {(!userHasReviewed || editingId) && user ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Your Rating:</label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`btn btn-sm ${s <= rating ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                    onClick={() => setRating(s)}
                  >
                    ★ {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Your Review:</label>
              <textarea
                className="form-control form-control-sm"
                rows="3"
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm px-4 fw-semibold" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : editingId ? 'Update Review' : 'Submit Review'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setEditingId(null); setReviewText(''); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : !user ? (
          <div className="text-muted small">
            Please <a href="/login" className="text-primary fw-semibold">log in</a> to leave a review for this product.
          </div>
        ) : null}
      </div>

      {/* Reviews List */}
      {data.reviews.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="bi bi-chat-square-text fs-2 d-block mb-2 text-secondary"></i>
          No reviews yet. Be the first customer to share your thoughts!
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {data.reviews.map((rev) => (
            <div key={rev.id} className="border-bottom pb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                  >
                    {rev.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-bold text-dark">{rev.user_name}</span>
                  <span className="text-warning small">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                  {user && (Number(user.id) === Number(rev.user_id) || user.role === 'admin') && (
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-link text-primary p-0 px-1 text-decoration-none"
                        onClick={() => handleStartEdit(rev)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-link text-danger p-0 px-1 text-decoration-none"
                        onClick={() => handleDelete(rev.id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-secondary small mb-0 mt-2 ps-4" style={{ lineHeight: '1.6' }}>
                {rev.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
