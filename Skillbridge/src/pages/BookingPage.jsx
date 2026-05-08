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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
  if (!worker) return <div className="text-center py-16"><h2 className="text-xl font-bold text-gray-700">Worker not found</h2><Link to="/search" className="btn-primary inline-block mt-4">Back to Search</Link></div>;

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)] flex flex-col">
      <div className="hero-bg text-white py-8 px-4 text-center">
        <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">{booked ? 'Booking Confirmed' : 'Almost done'}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{booked ? '🎉 Success!' : 'Confirm Your Booking'}</h1>
        <p className="text-green-100 text-sm mt-1">{booked ? 'Your request has been sent.' : 'Review details below.'}</p>
      </div>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-5">
        {!booked ? (
          <>
            <div className="card p-6 fade-up">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">{worker.name?.charAt(0)}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{worker.name}</h2>
                  {service && <span className="inline-block mt-1 badge badge-electrician">{service.category}</span>}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs font-bold text-amber-700">New</span>
                </div>
              </div>
              <div className="divider mb-5" />
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4 text-gray-400" />Location</div><span className="font-medium text-gray-800">{worker.area || 'Mangaluru'}</span></div>
                {service && <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-gray-500"><FileText className="w-4 h-4 text-gray-400" />Skill</div><span className="font-medium text-gray-800">{service.category}</span></div>}
                <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-gray-500"><Calendar className="w-4 h-4 text-gray-400" />Date</div><input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none" /></div>
                <div className="divider" />
                <div className="flex justify-between items-center"><span className="text-gray-500">Daily Rate</span><span className="text-2xl font-extrabold text-green-700">₹{service?.daily_rate || '—'}<span className="text-sm font-normal text-gray-400"> / day</span></span></div>
              </div>
            </div>
            <div className="card p-5 fade-up delay-1"><label className="block text-sm font-medium text-gray-700 mb-1.5">Describe your requirement (optional)</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="e.g. Need to fix kitchen tap leakage…" className="input-field min-h-[80px] resize-none" rows={3} /></div>
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 fade-up delay-2"><Info className="w-4 h-4 mt-0.5 shrink-0" /><p>Payment via UPI after job completion. No advance required.</p></div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
            <button onClick={handleBook} disabled={booking} className="btn-primary w-full py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 fade-up delay-3">{booking ? <><Loader2 className="w-5 h-5 animate-spin" />Booking…</> : <>✅ Confirm Booking</>}</button>
          </>
        ) : (
          <div className="pop-in card p-8 text-center border-green-200">
            <div className="pulse-ring w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-green-700 font-semibold mb-1">{worker.name} will respond shortly.</p>
            <p className="text-gray-500 text-sm mb-6">Track your booking in the Bookings tab.</p>
            <div className="flex flex-col gap-3">
              <Link to="/bookings" className="btn-primary w-full py-3 text-center">View My Bookings</Link>
              <Link to="/" className="btn-secondary w-full py-3 text-center flex items-center justify-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
