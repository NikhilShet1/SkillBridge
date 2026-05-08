import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Clock, Star, MapPin, ArrowRight } from 'lucide-react';
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
      {/* Hero */}
      <section className="hero-bg text-white py-12 px-4 text-center">
        <p className="fade-up text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">
          Mangaluru's trusted platform
        </p>
        <h1 className="fade-up delay-1 text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
          Find Skilled Workers<br className="hidden sm:block" /> Near You — Instantly
        </h1>
        <p className="fade-up delay-2 text-green-100 text-sm sm:text-base max-w-md mx-auto">
          Book verified carpenters, electricians, plumbers, and painters in your area. Fair rates, same day.
        </p>

        {/* Search bar */}
        <div className="fade-up delay-3 mt-6 flex items-center max-w-sm mx-auto bg-white rounded-full shadow-lg overflow-hidden">
          <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search skill or area…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-3 text-gray-700 text-sm outline-none bg-transparent placeholder-gray-400"
          />
          <Link
            to="/search"
            className="btn-primary text-sm px-5 py-3 m-1 rounded-full shrink-0"
          >
            Search
          </Link>
        </div>
      </section>

      {/* Workers Section */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Available Workers</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
            {filteredWorkers.length} found nearby
          </span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker, i) => (
              <WorkerCard key={worker.service_id} worker={worker} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No workers found</h3>
            <p className="text-sm text-gray-400 mb-4">
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
      <section className="bg-white border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div className="fade-up delay-1">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-extrabold text-green-700">500+</p>
            <p className="text-xs text-gray-500 mt-0.5">Verified Workers</p>
          </div>
          <div className="fade-up delay-2">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-extrabold text-green-700">12K+</p>
            <p className="text-xs text-gray-500 mt-0.5">Jobs Completed</p>
          </div>
          <div className="fade-up delay-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-extrabold text-green-700">4.8★</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg. Rating</p>
          </div>
        </div>
      </section>

      {/* CTA for workers */}
      {!profile && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="hero-bg rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-2">Are you a skilled worker?</h2>
            <p className="text-green-100 text-sm mb-5 max-w-sm mx-auto">
              Join SkillBridge and get booked by hundreds of customers in Mangaluru.
            </p>
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Register Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
