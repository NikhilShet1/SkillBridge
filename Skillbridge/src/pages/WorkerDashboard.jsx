import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  ToggleLeft, ToggleRight, Clock, CheckCircle2, XCircle,
  IndianRupee, AlertCircle, Loader2, Plus, Briefcase
} from 'lucide-react';

export default function WorkerDashboard() {
  const { profile, updateProfile } = useAuthStore();
  const [gigs, setGigs] = useState([]);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    category: 'Carpenter',
    daily_rate: '',
    bio: '',
    experience_years: '',
  });
  const [savingService, setSavingService] = useState(false);

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('worker_id', profile.id)
      .limit(1);

    if (services?.length > 0) {
      setService(services[0]);
    } else {
      setShowServiceForm(true);
    }

    const { data: gigData } = await supabase
      .from('gigs')
      .select('*, customer:customer_id(name, phone, area)')
      .eq('worker_id', profile.id)
      .order('created_at', { ascending: false });

    if (gigData) setGigs(gigData);
    setLoading(false);
  };

  const toggleOnline = async () => {
    setToggling(true);
    try {
      await updateProfile({ is_online: !profile.is_online });
    } catch (err) {
      console.error(err);
    }
    setToggling(false);
  };

  const handleGigAction = async (gigId, newStatus) => {
    const { error } = await supabase
      .from('gigs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', gigId);

    if (!error) {
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, status: newStatus } : g))
      );
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSavingService(true);

    const payload = {
      worker_id: profile.id,
      category: serviceForm.category,
      daily_rate: parseInt(serviceForm.daily_rate),
      bio: serviceForm.bio,
      experience_years: parseInt(serviceForm.experience_years) || 0,
    };

    let result;
    if (service) {
      result = await supabase.from('services').update(payload).eq('id', service.id).select().single();
    } else {
      result = await supabase.from('services').insert(payload).select().single();
    }

    if (!result.error) {
      setService(result.data);
      setShowServiceForm(false);
    }
    setSavingService(false);
  };

  const pendingGigs = gigs.filter((g) => g.status === 'pending');
  const activeGigs = gigs.filter((g) => g.status === 'accepted' || g.status === 'in_progress');
  const completedGigs = gigs.filter((g) => g.status === 'completed');
  const totalEarnings = completedGigs
    .filter((g) => g.payment_status === 'paid')
    .reduce((sum, g) => sum + (g.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="py-6 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-green-400/50 text-xs font-semibold uppercase tracking-[0.15em] mb-0.5">
              Worker Dashboard
            </p>
            <h1 className="text-xl font-bold text-white">
              Hello, {profile?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
              profile?.is_online
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-white/5 text-white/40 border-white/10'
            }`}
          >
            {toggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profile?.is_online ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {profile?.is_online ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-6 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Briefcase, value: activeGigs.length, label: 'Active', color: 'text-blue-400' },
            { icon: CheckCircle2, value: completedGigs.length, label: 'Completed', color: 'text-green-400' },
            { icon: IndianRupee, value: `₹${totalEarnings.toLocaleString()}`, label: 'Earnings', color: 'text-amber-400' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="card text-center py-4">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5 opacity-70`} />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-white/25">{label}</p>
            </div>
          ))}
        </div>

        {/* Service Setup / Edit */}
        {showServiceForm ? (
          <div className="card p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              {service ? 'Edit Your Service' : 'Set Up Your Service'}
            </h2>
            <form onSubmit={handleSaveService} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Skill Category</label>
                <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} className="input-field">
                  <option value="Carpenter">🪚 Carpenter</option>
                  <option value="Electrician">⚡ Electrician</option>
                  <option value="Plumbing">🔧 Plumbing</option>
                  <option value="Painter">🖌️ Painter</option>
                  <option value="Other">🔨 Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Daily Rate (₹)</label>
                  <input type="number" value={serviceForm.daily_rate} onChange={(e) => setServiceForm({ ...serviceForm, daily_rate: e.target.value })} placeholder="e.g. 650" className="input-field" required min="100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Experience (yrs)</label>
                  <input type="number" value={serviceForm.experience_years} onChange={(e) => setServiceForm({ ...serviceForm, experience_years: e.target.value })} placeholder="e.g. 5" className="input-field" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Bio / Description</label>
                <textarea value={serviceForm.bio} onChange={(e) => setServiceForm({ ...serviceForm, bio: e.target.value })} placeholder="Tell customers about your skills…" className="input-field min-h-[80px] resize-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingService} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                  {savingService ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {service ? 'Update' : 'Create Service'}
                </button>
                {service && (
                  <button type="button" onClick={() => setShowServiceForm(false)} className="btn-secondary flex-1 py-3 text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : service ? (
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/25 uppercase tracking-wider mb-0.5">Your Service</p>
              <p className="font-bold text-white text-sm">{service.category}</p>
              <p className="text-xs text-white/35">₹{service.daily_rate}/day • {service.experience_years || 0} yrs exp</p>
            </div>
            <button onClick={() => {
              setServiceForm({
                category: service.category,
                daily_rate: service.daily_rate.toString(),
                bio: service.bio || '',
                experience_years: service.experience_years?.toString() || '',
              });
              setShowServiceForm(true);
            }} className="btn-secondary text-xs px-4 py-2">
              Edit
            </button>
          </div>
        ) : null}

        {/* Pending Requests */}
        {pendingGigs.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              New Requests ({pendingGigs.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingGigs.map((gig) => (
                <div key={gig.id} className="card p-5 border-l-2 border-l-amber-400/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{gig.customer?.name || 'Customer'}</h3>
                      <p className="text-xs text-white/30">{gig.customer?.area}</p>
                      {gig.description && <p className="text-xs text-white/45 mt-1">{gig.description}</p>}
                    </div>
                    <span className="text-base font-bold text-green-400">₹{gig.amount || service?.daily_rate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/25 mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    {gig.scheduled_date
                      ? new Date(gig.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })
                      : 'Flexible date'}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleGigAction(gig.id, 'accepted')} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => handleGigAction(gig.id, 'cancelled')} className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Gigs */}
        {activeGigs.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Active Jobs</h2>
            <div className="flex flex-col gap-3">
              {activeGigs.map((gig) => (
                <div key={gig.id} className="card p-5 border-l-2 border-l-green-400/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{gig.customer?.name || 'Customer'}</h3>
                      <p className="text-xs text-white/30">{gig.customer?.area} • {gig.customer?.phone}</p>
                    </div>
                    <span className="badge badge-online">In Progress</span>
                  </div>
                  {gig.description && <p className="text-xs text-white/40 mb-3">{gig.description}</p>}
                  <button onClick={() => handleGigAction(gig.id, 'completed')} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Completed
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {gigs.length === 0 && !showServiceForm && (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white/50">No gigs yet</h3>
            <p className="text-xs text-white/25 mt-1">
              Make sure you're <strong className="text-white/40">online</strong> so customers can find you!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
