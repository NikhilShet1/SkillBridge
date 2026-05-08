import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const categoryConfig = {
  Carpenter:    { emoji: '🪚', badge: 'badge-carpenter' },
  Electrician:  { emoji: '⚡', badge: 'badge-electrician' },
  Plumbing:     { emoji: '🔧', badge: 'badge-plumber' },
  Painter:      { emoji: '🖌️', badge: 'badge-painter' },
  Other:        { emoji: '🔨', badge: 'badge-other' },
};

export default function WorkerCard({ worker, index = 0 }) {
  const config = categoryConfig[worker.category] || categoryConfig.Other;
  const initial = worker.name?.charAt(0) || '?';

  return (
    <div className={`card card-shine fade-up delay-${(index % 4) + 1} flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-base font-semibold text-green-400 shrink-0">
            {initial}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">
              {worker.name}
            </h3>
            {worker.experience_years > 0 && (
              <p className="text-xs text-white/35 mt-0.5">
                {worker.experience_years} yrs experience
              </p>
            )}
          </div>
        </div>
        <span className={`badge ${config.badge} shrink-0`}>
          {config.emoji} {worker.category}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-sm">
        {worker.area && (
          <div className="flex items-center gap-2 text-white/45">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">{worker.area}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-white/45">
          <Star className="w-3.5 h-3.5 shrink-0" />
          <span className="text-yellow-400/80 font-medium text-xs">
            {worker.avg_rating > 0 ? worker.avg_rating.toFixed(1) : 'New'}
          </span>
          <span className="text-white/25 text-xs">
            ({worker.review_count || 0})
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/6">
        <div>
          <span className="text-lg font-bold text-white">₹{worker.daily_rate}</span>
          <span className="text-xs text-white/30 ml-1">/ day</span>
        </div>
        <Link
          to={`/book/${worker.id}?service=${worker.service_id}`}
          className="btn-primary text-xs px-4 py-2"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
