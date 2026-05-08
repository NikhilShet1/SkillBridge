import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Clock, Star, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import WorkerCard from '../components/workers/WorkerCard';

export default function HomePage() {
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('is_online', true)
      .limit(6);

    if (!error && data) {
      setWorkers(data);
    }
    setLoading(false);
  };

  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name?.toLowerCase().includes(q) ||
      w.category?.toLowerCase().includes(q) ||
      w.area?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="has-bottom-nav">
      {/* Hero — vertically centered with prominent search */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="fade-up text-green-400/70 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          Mangaluru's trusted platform
        </p>
        <h1 className="fade-up delay-1 text-3xl sm:text-5xl font-extrabold leading-tight mb-4 text-white">
          Find Skilled Workers<br className="hidden sm:block" /> Near You
        </h1>
        <p className="fade-up delay-2 text-white/40 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-10">
          Book verified carpenters, electricians, plumbers, and painters in your area.
        </p>

        {/* Search bar — wide and centered */}
        <div className="fade-up delay-3 w-full max-w-xl flex items-center glass-panel rounded-full overflow-hidden shadow-lg shadow-black/20">
          <Search className="w-5 h-5 text-white/30 ml-5 shrink-0" />
          <input
            type="text"
            placeholder="Search by skill, name, or area…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-4 text-white text-sm outline-none bg-transparent placeholder-white/30"
          />
          <Link
            to="/search"
            className="btn-primary text-sm px-7 py-3 m-1.5 rounded-full shrink-0 font-semibold"
          >
            Search
          </Link>
        </div>
      </section>

      {/* Workers Section */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Available Workers</h2>
          <span className="text-xs text-white/25 bg-white/5 rounded-full px-3 py-1 border border-white/8">
            {filteredWorkers.length} found
          </span>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-white/5" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded w-full mb-2" />
                <div className="h-2.5 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker, i) => (
              <WorkerCard key={worker.service_id} worker={worker} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/8">
              <Search className="w-6 h-6 text-white/20" />
            </div>
            <h3 className="text-base font-semibold text-white/60 mb-1">No workers found</h3>
            <p className="text-sm text-white/25 mb-5">
              {searchQuery ? 'Try a different search term.' : 'No workers are online right now.'}
            </p>
            <Link to="/search" className="btn-primary inline-flex items-center gap-2">
              Explore Map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {filteredWorkers.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to="/search"
              className="btn-secondary inline-flex items-center gap-2"
            >
              View All on Map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* Trust Strip */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, value: '500+', label: 'Verified Workers', delay: 'delay-1' },
            { icon: Clock, value: '12K+', label: 'Jobs Completed', delay: 'delay-2' },
            { icon: Star, value: '4.8★', label: 'Avg. Rating', delay: 'delay-3' },
          ].map(({ icon: Icon, value, label, delay }) => (
            <div key={label} className={`fade-up ${delay}`}>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2 border border-green-500/15">
                <Icon className="w-4.5 h-4.5 text-green-400" />
              </div>
              <p className="text-xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-white/30 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating CTA for workers */}
      {!profile && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 text-center pointer-events-auto max-w-md w-full fade-up delay-4 shadow-lg shadow-black/20">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1.5">Are you a skilled worker?</h2>
            <p className="text-white/35 text-xs mb-4 max-w-xs mx-auto">
              Join SkillBridge and get booked by customers in Mangaluru.
            </p>
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5"
            >
              Register Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
