import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Clock, CheckCircle2, XCircle, IndianRupee, Loader2, Star, Calendar, MessageSquare } from 'lucide-react';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingsListPage() {
  const { profile } = useAuthStore();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { if (profile) fetchGigs(); }, [profile]);

  const fetchGigs = async () => {
    const col = profile.role === 'customer' ? 'customer_id' : 'worker_id';
    const otherRole = profile.role === 'customer' ? 'worker_id' : 'customer_id';
    const { data } = await supabase
      .from('gigs')
      .select(`*, other:${otherRole}(name, phone, area), service:service_id(category, daily_rate)`)
      .eq(col, profile.id)
      .order('created_at', { ascending: false });
    if (data) setGigs(data);
    setLoading(false);
  };

  const handlePayment = async (gig) => {
    const loaded = await loadRazorpay();
    if (!loaded) { alert('Razorpay failed to load'); return; }
    const options = {
      key: 'rzp_test_XXXXXXXXXXXX', // Replace with your Razorpay test key
      amount: (gig.amount || 500) * 100,
      currency: 'INR',
      name: 'SkillBridge',
      description: `Payment to ${gig.other?.name}`,
      handler: async (response) => {
        await supabase.from('gigs').update({
          payment_status: 'paid',
          razorpay_payment_id: response.razorpay_payment_id,
          updated_at: new Date().toISOString(),
        }).eq('id', gig.id);
        setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, payment_status: 'paid', razorpay_payment_id: response.razorpay_payment_id } : g));
        setReviewModal(gig);
      },
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      theme: { color: '#16a34a' },
      method: { upi: true, card: true, netbanking: true },
    };
    new window.Razorpay(options).open();
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    await supabase.from('reviews').insert({
      gig_id: reviewModal.id,
      worker_id: reviewModal.worker_id,
      customer_id: profile.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    setReviewModal(null);
    setReviewForm({ rating: 5, comment: '' });
    setSubmittingReview(false);
  };

  const activeGigs = gigs.filter(g => ['pending', 'accepted', 'in_progress'].includes(g.status));
  const completedGigs = gigs.filter(g => ['completed', 'cancelled'].includes(g.status));
  const displayGigs = tab === 'active' ? activeGigs : completedGigs;

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-700',
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return `badge ${map[status] || 'bg-gray-100 text-gray-600'}`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)]">
      <div className="hero-bg text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold">My Bookings</h1>
          <p className="text-green-200 text-sm mt-0.5">{gigs.length} total bookings</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button onClick={() => setTab('active')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'active' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
            Active ({activeGigs.length})
          </button>
          <button onClick={() => setTab('completed')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'completed' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
            Completed ({completedGigs.length})
          </button>
        </div>

        {displayGigs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No {tab} bookings</h3>
            <p className="text-sm text-gray-400 mt-1">{tab === 'active' ? 'Book a worker to get started!' : 'Completed bookings will appear here.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayGigs.map((gig) => (
              <div key={gig.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{gig.other?.name || 'User'}</h3>
                    <p className="text-xs text-gray-500">{gig.service?.category} • {gig.other?.area}</p>
                  </div>
                  <span className={statusBadge(gig.status)}>{gig.status.replace('_', ' ')}</span>
                </div>
                {gig.description && <p className="text-sm text-gray-600 mb-2">{gig.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{gig.scheduled_date ? new Date(gig.scheduled_date).toLocaleDateString('en-IN') : 'Flexible'}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />₹{gig.amount || '—'}</span>
                  {gig.payment_status === 'paid' && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Paid</span>}
                </div>
                {/* Actions */}
                {profile.role === 'customer' && gig.status === 'completed' && gig.payment_status !== 'paid' && (
                  <button onClick={() => handlePayment(gig)} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> Pay Now (UPI)
                  </button>
                )}
                {profile.role === 'customer' && gig.payment_status === 'paid' && (
                  <button onClick={() => setReviewModal(gig)} className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-1.5">
                    <Star className="w-4 h-4" /> Leave a Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Rate Your Experience</h2>
            <form onSubmit={handleReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${n <= reviewForm.rating ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="How was your experience?" className="input-field min-h-[80px] resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submittingReview} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Review
                </button>
                <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1 py-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
