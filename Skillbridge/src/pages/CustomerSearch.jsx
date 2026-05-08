import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Search, Filter, List, Map as MapIcon, Star, MapPin } from 'lucide-react';
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

// Custom colored markers
function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px; height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><div style="
      transform: rotate(45deg);
      color: white;
      font-size: 14px;
      font-weight: bold;
    ">●</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const categoryIcons = {
  Carpenter:   createIcon('#d97706'),
  Electrician: createIcon('#2563eb'),
  Plumbing:    createIcon('#4f46e5'),
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
      <div className="hero-bg text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold mb-3">Find Workers Near You</h1>

          {/* Search bar */}
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-md">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, skill, area…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2.5 text-gray-700 text-sm outline-none bg-transparent"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-green-800 shadow-md'
                    : 'bg-white/15 text-green-100 hover:bg-white/25'
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
      <div className="max-w-5xl mx-auto w-full px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'map' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pb-6">
        {viewMode === 'map' ? (
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200" style={{ height: '400px' }}>
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

              {/* 10km radius circle */}
              <Circle
                center={[location.lat, location.lng]}
                radius={10000}
                pathOptions={{
                  color: '#16a34a',
                  fillColor: '#16a34a',
                  fillOpacity: 0.05,
                  weight: 1.5,
                  dashArray: '8 4',
                }}
              />

              {/* Worker markers */}
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
                        <h3 className="font-bold text-sm text-gray-900">{worker.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">{worker.category} • {worker.area}</p>
                        <div className="flex items-center gap-1 text-xs mb-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">{worker.avg_rating > 0 ? worker.avg_rating : 'New'}</span>
                          <span className="text-gray-400">({worker.review_count} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-700">₹{worker.daily_rate}/day</span>
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

        {/* List view (or below map) */}
        {(viewMode === 'list' || viewMode === 'map') && (
          <div className={viewMode === 'map' ? 'mt-6' : ''}>
            {viewMode === 'map' && filteredWorkers.length > 0 && (
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Workers List</h3>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorkers.map((worker, i) => (
                <WorkerCard key={worker.service_id} worker={worker} index={i} />
              ))}
            </div>

            {!loading && filteredWorkers.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600">No workers found</h3>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
