import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { MapPin, Star, Calendar, FileText, CheckCircle2, ArrowLeft, Loader2, Info } from 'lucide-react';

export default function BookingPage() {
  const { workerId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [worker, setWorker] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scheduled_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => { fetchWorkerDetails(); }, [workerId]);

  const fetchWorkerDetails = async () => {
    const { data: userData } = await supabase.from('users').select('*').eq('id', workerId).single();
    if (userData) setWorker(userData);
    if (serviceId) {
      const { data: sd } = await supabase.from('services').select('*').eq('id', serviceId).single();
      if (sd) setService(sd);
    } else {
      const { data: svcs } = await supabase.from('services').select('*').eq('worker_id', workerId).limit(1);
      if (svcs?.length) setService(svcs[0]);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!profile) { navigate('/login'); return; }
    setBooking(true); setError('');
    try {
      const { error: e } = await supabase.from('gigs').insert({
        customer_id: profile.id, worker_id: workerId, service_id: service?.id,
        status: 'pending', scheduled_date: formData.scheduled_date,
        description: formData.description, amount: service?.daily_rate,
      });
      if (e) throw e;
      setBooked(true);
    } catch (err) { setError(err.message); }
    finally { setBooking(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-green-400 animate-spin" /></div>;
  if (!worker) return <div className="text-center py-16"><h2 className="text-lg font-bold text-white/60">Worker not found</h2><Link to="/search" className="btn-primary inline-block mt-4 text-sm">Back to Search</Link></div>;

  if (booked) {
    return (
      <div className="has-bottom-nav min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
        <div className="pop-in card p-8 text-center max-w-sm w-full">
          <div className="pulse-ring w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-green-400/80 font-medium text-sm mb-1">{worker.name} will respond shortly.</p>
          <p className="text-white/30 text-xs mb-6">Track your booking in the Bookings tab.</p>
          <div className="flex flex-col gap-3">
            <Link to="/bookings" className="btn-primary w-full py-3 text-center text-sm">View My Bookings</Link>
            <Link to="/" className="btn-secondary w-full py-3 text-center text-sm flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)] flex flex-col">
      <div className="py-8 px-4 text-center">
        <p className="text-green-400/60 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Almost done</p>
        <h1 className="text-2xl font-extrabold text-white">Confirm Your Booking</h1>
      </div>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-8 flex flex-col gap-4">
        <div className="card p-6 fade-up">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-green-400 text-xl font-bold shrink-0">
              {worker.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{worker.name}</h2>
              {service && <span className="badge badge-online mt-1">{service.category}</span>}
            </div>
          </div>
          <div className="divider mb-5" />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><span className="text-white/40 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Location</span><span className="text-white/80">{worker.area || 'Mangaluru'}</span></div>
            <div className="flex justify-between"><span className="text-white/40 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Date</span><input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="text-sm text-white/80 bg-transparent outline-none" /></div>
            <div className="divider" />
            <div className="flex justify-between items-center"><span className="text-white/40">Rate</span><span className="text-2xl font-extrabold text-green-400">₹{service?.daily_rate || '—'}<span className="text-xs text-white/25 ml-1">/ day</span></span></div>
          </div>
        </div>
        <div className="card p-5 fade-up delay-1">
          <label className="block text-xs font-medium text-white/50 mb-1.5">Describe your requirement (optional)</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="e.g. Need to fix kitchen tap…" className="input-field min-h-[80px] resize-none" rows={3} />
        </div>
        <div className="flex items-start gap-3 bg-blue-500/8 border border-blue-500/12 rounded-xl px-4 py-3 text-xs text-blue-300/80 fade-up delay-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-60" /><p>Payment via UPI after job completion.</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
        <button onClick={handleBook} disabled={booking} className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 fade-up delay-3">
          {booking ? <><Loader2 className="w-4 h-4 animate-spin" />Booking…</> : '✅ Confirm Booking'}
        </button>
      </main>
    </div>
  );
}
