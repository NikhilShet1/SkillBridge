import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Clock, CheckCircle2, IndianRupee, Loader2, Star, Calendar, MessageSquare, MessageCircle } from 'lucide-react';
import MessagePanel from '../components/booking/MessagePanel';

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
  const [messageModal, setMessageModal] = useState(null);
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
      key: 'rzp_test_SmrUzTyeNywvFz',
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
        setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, payment_status: 'paid' } : g));
        setReviewModal(gig);
      },
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      theme: { color: '#22c55e' },
      method: { upi: true, card: true, netbanking: true },
    };
    new window.Razorpay(options).open();
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    await supabase.from('reviews').insert({
      gig_id: reviewModal.id, worker_id: reviewModal.worker_id,
      customer_id: profile.id, rating: reviewForm.rating, comment: reviewForm.comment,
    });
    setReviewModal(null);
    setReviewForm({ rating: 5, comment: '' });
    setSubmittingReview(false);
  };

  const activeGigs = gigs.filter(g => ['pending', 'accepted', 'in_progress'].includes(g.status));
  const completedGigs = gigs.filter(g => ['completed', 'cancelled'].includes(g.status));
  const displayGigs = tab === 'active' ? activeGigs : completedGigs;

  const statusStyle = (status) => {
    const map = {
      pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      accepted: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      in_progress: 'bg-green-500/15 text-green-400 border-green-500/20',
      completed: 'bg-green-500/15 text-green-400 border-green-500/20',
      cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
    };
    return `badge border ${map[status] || 'bg-white/5 text-white/40 border-white/10'}`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-green-400 animate-spin" /></div>;

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)]">
      <div className="py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-bold text-white">My Bookings</h1>
          <p className="text-white/25 text-xs mt-0.5">{gigs.length} total</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-6">
        <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/6">
          <button onClick={() => setTab('active')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === 'active' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
            Active ({activeGigs.length})
          </button>
          <button onClick={() => setTab('completed')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === 'completed' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
            Completed ({completedGigs.length})
          </button>
        </div>

        {displayGigs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white/50">No {tab} bookings</h3>
            <p className="text-xs text-white/25 mt-1">{tab === 'active' ? 'Book a worker to get started!' : 'Completed bookings appear here.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayGigs.map((gig) => (
              <div key={gig.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{gig.other?.name || 'User'}</h3>
                    <p className="text-xs text-white/30">{gig.service?.category} • {gig.other?.area}</p>
                  </div>
                  <span className={statusStyle(gig.status)}>{gig.status.replace('_', ' ')}</span>
                </div>
                {gig.description && <p className="text-xs text-white/40 mb-2">{gig.description}</p>}
                <div className="flex items-center gap-4 text-xs text-white/25 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{gig.scheduled_date ? new Date(gig.scheduled_date).toLocaleDateString('en-IN') : 'Flexible'}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{gig.amount || '—'}</span>
                  {gig.payment_status === 'paid' && <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-3 h-3" />Paid</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  {profile.role === 'customer' && gig.status === 'completed' && gig.payment_status !== 'paid' && (
                    <button onClick={() => handlePayment(gig)} className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5" /> Pay Now
                    </button>
                  )}
                  {profile.role === 'customer' && gig.payment_status === 'paid' && (
                    <button onClick={() => setReviewModal(gig)} className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5">
                      <Star className="w-3.5 h-3.5" /> Review
                    </button>
                  )}
                  <button 
                    onClick={() => setMessageModal(gig)} 
                    className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => setReviewModal(null)}>
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-400" /> Rate Your Experience</h2>
            <form onSubmit={handleReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${n <= reviewForm.rating ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-white/5 text-white/20 border border-white/6'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="How was your experience?" className="input-field min-h-[80px] resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submittingReview} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit
                </button>
                <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {messageModal && (
        <MessagePanel gig={messageModal} onClose={() => setMessageModal(null)} />
      )}
    </div>
  );
}
