import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(user ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [serviceForm, setServiceForm] = useState({
    category: 'Carpenter', daily_rate: '', experience_years: '', bio: '', area: '',
  });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { signUp } = useAuthStore.getState();
      await signUp(authForm.email, authForm.password, authForm.name, 'worker', authForm.phone);
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const currentUser = useAuthStore.getState().user;
    try {
      await supabase.from('users').update({
        area: serviceForm.area,
        location_lat: 12.8714 + (Math.random() - 0.5) * 0.1,
        location_lng: 74.8431 + (Math.random() - 0.5) * 0.1,
        is_online: true,
      }).eq('id', currentUser.id);

      const { error: svcErr } = await supabase.from('services').insert({
        worker_id: currentUser.id,
        category: serviceForm.category,
        daily_rate: parseInt(serviceForm.daily_rate),
        experience_years: parseInt(serviceForm.experience_years) || 0,
        bio: serviceForm.bio,
      });
      if (svcErr) throw svcErr;

      await useAuthStore.getState().fetchProfile(currentUser.id);
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
        <div className="pop-in card p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">You're All Set!</h2>
          <p className="text-green-400/80 font-medium text-sm mb-1">Your profile is now live.</p>
          <p className="text-white/30 text-xs mb-6">Customers in your area can now find and book you.</p>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="btn-primary w-full py-3 text-center text-sm">Go to Dashboard</Link>
            <Link to="/" className="btn-secondary w-full py-3 text-center text-sm">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <p className="text-green-400/60 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Join the platform</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Register as a Worker</h1>
        <p className="text-white/35 text-sm mt-2 max-w-xs mx-auto">Get booked by hundreds of customers in Mangaluru.</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
            step >= 1 ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-white/5 text-white/30 border-white/10'
          }`}>1</div>
          <div className="w-8 h-px bg-white/10" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
            step >= 2 ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-white/5 text-white/30 border-white/10'
          }`}>2</div>
        </div>
        <p className="text-white/25 text-xs mt-2">{step === 1 ? 'Step 1: Create Account' : 'Step 2: Set Up Service'}</p>
      </div>

      {/* Form */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-8">
        <div className="card p-6 sm:p-8 fade-up">
          {step === 1 ? (
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <h2 className="text-base font-bold text-white mb-1">Your Details</h2>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="e.g. Ramakrishna Shetty" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Phone Number</label>
                <input type="tel" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="+91 9876543210" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@example.com" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Password <span className="text-red-400">*</span></label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Min. 6 characters" className="input-field" required minLength={6} />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleServiceSubmit} className="flex flex-col gap-4">
              <h2 className="text-base font-bold text-white mb-1">Your Service</h2>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Skill Type <span className="text-red-400">*</span></label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="input-field" required>
                  <option value="Carpenter">🪚 Carpenter</option>
                  <option value="Electrician">⚡ Electrician</option>
                  <option value="Plumbing">🔧 Plumber</option>
                  <option value="Painter">🖌️ Painter</option>
                  <option value="Other">🔨 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Area in Mangaluru <span className="text-red-400">*</span></label>
                <input type="text" value={serviceForm.area} onChange={(e) => setServiceForm({ ...serviceForm, area: e.target.value })} placeholder="e.g. Bejai, Hampankatta, Kadri…" className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Experience (yrs)</label>
                  <input type="number" value={serviceForm.experience_years} onChange={(e) => setServiceForm({ ...serviceForm, experience_years: e.target.value })} placeholder="e.g. 5" className="input-field" min="0" max="50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Daily Rate (₹) <span className="text-red-400">*</span></label>
                  <input type="number" value={serviceForm.daily_rate} onChange={(e) => setServiceForm({ ...serviceForm, daily_rate: e.target.value })} placeholder="e.g. 650" className="input-field" required min="100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Bio</label>
                <textarea value={serviceForm.bio} onChange={(e) => setServiceForm({ ...serviceForm, bio: e.target.value })} placeholder="Tell customers about your skills…" className="input-field min-h-[80px] resize-none" rows={3} />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Registration
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
