import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Send, Pencil } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../config';
import { useAuth } from '../contexts/AuthContext';

const StarRating = ({ value, onChange, readonly = false, size = 24 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      </button>
    ))}
  </div>
);

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-3 text-right">{star}</span>
      <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right">{count}</span>
    </div>
  );
};

const FeedbackSection = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hovered, setHovered] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.FEEDBACK_BY_PRODUCT(productId));
      if (res.ok) setReviews(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [productId]);

  const fetchMyReview = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(API_ENDPOINTS.MY_FEEDBACK(productId), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMyReview(data);
      }
    } catch { /* silent */ }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    fetchReviews();
    fetchMyReview();
  }, [fetchReviews, fetchMyReview]);

  const startEdit = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(API_ENDPOINTS.SUBMIT_FEEDBACK(productId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment, userName: user?.name || user?.email }),
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.');
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit');
      }
      setSuccess('Review submitted!');
      setEditing(false);
      await fetchReviews();
      await fetchMyReview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await fetch(API_ENDPOINTS.SUBMIT_FEEDBACK(productId), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setMyReview(null);
      setEditing(false);
      setSuccess('');
      await fetchReviews();
    } catch { /* silent */ }
  };

  // Stats
  const total = reviews.length;
  const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0.0';
  const dist = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: reviews.filter((r) => r.rating === s).length }));

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 bg-gray-50 rounded-2xl p-5">
        <div className="flex flex-col items-center justify-center min-w-[100px]">
          <span className="text-5xl font-extrabold text-gray-900">{avg}</span>
          <StarRating value={Math.round(Number(avg))} readonly size={18} />
          <span className="text-xs text-gray-500 mt-1">{total} review{total !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Write / Edit review */}
      {isAuthenticated && (
        <div className="mb-8">
          {!editing ? (
            <div className="flex items-center gap-3">
              {myReview ? (
                <>
                  <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-gray-700">
                    Your review: <StarRating value={myReview.rating} readonly size={14} /> "{myReview.comment}"
                  </div>
                  <button onClick={startEdit} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  <Star size={16} /> Write a Review
                </button>
              )}
              {success && <span className="text-green-600 text-sm">{success}</span>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-semibold text-gray-900">{myReview ? 'Edit your review' : 'Write a review'}</h3>

              {/* Star picker */}
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={(hovered || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
                {(hovered || rating) > 0 && (
                  <p className="text-sm text-orange-600 font-medium mt-1">{LABELS[hovered || rating]}</p>
                )}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 transition-colors"
                >
                  <Send size={14} />
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-gray-500 mb-6">
          <a href="/login" className="text-orange-600 font-medium hover:underline">Login</a> to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm flex-shrink-0">
                    {(r.userName || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.userName || 'Anonymous'}</p>
                    <StarRating value={r.rating} readonly size={14} />
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
