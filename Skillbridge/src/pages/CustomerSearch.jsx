import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Search, List, Map as MapIcon, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGeoLocation } from '../hooks/useGeoLocation';
import WorkerCard from '../components/workers/WorkerCard';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 28px; height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.6);
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><div style="
      transform: rotate(45deg);
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">●</div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const categoryIcons = {
  Carpenter:   createIcon('#d97706'),
  Electrician: createIcon('#2563eb'),
  Plumbing:    createIcon('#6366f1'),
  Painter:     createIcon('#db2777'),
  Other:       createIcon('#6b7280'),
};

const categories = ['All', 'Carpenter', 'Electrician', 'Plumbing', 'Painter'];

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function CustomerSearch() {
  const [workers, setWorkers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('map');
  const [loading, setLoading] = useState(true);
  const { location } = useGeoLocation();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*');

    if (!error && data) {
      setWorkers(data);
    }
    setLoading(false);
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        w.name?.toLowerCase().includes(q) ||
        w.category?.toLowerCase().includes(q) ||
        w.area?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [workers, selectedCategory, searchQuery]);

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-lg font-bold text-white mb-3">Find Workers Near You</h1>

          {/* Search bar */}
          <div className="flex items-center glass-panel rounded-xl overflow-hidden">
            <Search className="w-4 h-4 text-white/25 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, skill, area…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2.5 text-white text-sm outline-none bg-transparent placeholder-white/25"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === cat
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent text-white/35 border-white/6 hover:text-white/55 hover:border-white/12'
                }`}
              >
                {cat === 'Carpenter' && '🪚 '}{cat === 'Electrician' && '⚡ '}
                {cat === 'Plumbing' && '🔧 '}{cat === 'Painter' && '🖌️ '}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="max-w-5xl mx-auto w-full px-4 py-2 flex items-center justify-between">
        <p className="text-xs text-white/25">
          {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/6">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'map' ? 'bg-white/10 text-white' : 'text-white/30'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pb-6">
        {viewMode === 'map' ? (
          <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: '400px' }}>
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap lat={location.lat} lng={location.lng} />

              <Circle
                center={[location.lat, location.lng]}
                radius={10000}
                pathOptions={{
                  color: '#22c55e',
                  fillColor: '#22c55e',
                  fillOpacity: 0.04,
                  weight: 1,
                  dashArray: '8 4',
                }}
              />

              {filteredWorkers
                .filter((w) => w.location_lat && w.location_lng)
                .map((worker) => (
                  <Marker
                    key={worker.service_id}
                    position={[worker.location_lat, worker.location_lng]}
                    icon={categoryIcons[worker.category] || categoryIcons.Other}
                  >
                    <Popup>
                      <div className="p-1 min-w-[180px]">
                        <h3 className="font-bold text-sm">{worker.name}</h3>
                        <p className="text-xs opacity-60 mb-1">{worker.category} • {worker.area}</p>
                        <div className="flex items-center gap-1 text-xs mb-2">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="font-medium">{worker.avg_rating > 0 ? worker.avg_rating : 'New'}</span>
                          <span className="opacity-40">({worker.review_count} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-400">₹{worker.daily_rate}/day</span>
                          <Link
                            to={`/book/${worker.id}?service=${worker.service_id}`}
                            className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-700"
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        ) : null}

        {(viewMode === 'list' || viewMode === 'map') && (
          <div className={viewMode === 'map' ? 'mt-6' : ''}>
            {viewMode === 'map' && filteredWorkers.length > 0 && (
              <h3 className="text-xs font-medium text-white/30 mb-3 uppercase tracking-wider">Workers List</h3>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorkers.map((worker, i) => (
                <WorkerCard key={worker.service_id} worker={worker} index={i} />
              ))}
            </div>

            {!loading && filteredWorkers.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white/50">No workers found</h3>
                <p className="text-sm text-white/25 mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
