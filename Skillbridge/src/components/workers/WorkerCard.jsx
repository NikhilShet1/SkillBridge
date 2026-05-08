import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const categoryConfig = {
  Carpenter:    { emoji: '🪚', badge: 'badge-carpenter' },
  Electrician:  { emoji: '⚡', badge: 'badge-electrician' },
  Plumbing:     { emoji: '🔧', badge: 'badge-plumber' },
  Painter:      { emoji: '🖌️', badge: 'badge-painter' },
  Other:        { emoji: '🔨', badge: 'badge-other' },
};

const avatarColors = [
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

export default function WorkerCard({ worker, index = 0 }) {
  const config = categoryConfig[worker.category] || categoryConfig.Other;
  const colorClass = avatarColors[index % avatarColors.length];
  const initial = worker.name?.charAt(0) || '?';

  return (
    <div className={`card card-shine fade-up delay-${(index % 4) + 1} flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-lg font-bold shrink-0`}>
            {initial}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {worker.name}
            </h3>
            {worker.experience_years > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
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
      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
        {worker.area && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            {worker.area}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-yellow-500 font-medium">
            {worker.avg_rating > 0 ? worker.avg_rating.toFixed(1) : 'New'}
          </span>
          <span className="text-gray-400">
            ({worker.review_count || 0} reviews)
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div>
          <span className="text-xl font-bold text-gray-900">₹{worker.daily_rate}</span>
          <span className="text-xs text-gray-400"> / day</span>
        </div>
        <Link
          to={`/book/${worker.id}?service=${worker.service_id}`}
          className="btn-primary text-sm px-5 py-2"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
