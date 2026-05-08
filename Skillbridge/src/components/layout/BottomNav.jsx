import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, User, Search, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function BottomNav() {
  const { profile } = useAuthStore();
  if (!profile) return null;

  const isWorker = profile.role === 'worker';

  const navItems = isWorker
    ? [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
        { to: '/profile', icon: User, label: 'Profile' },
      ]
    : [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
        { to: '/profile', icon: User, label: 'Profile' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-panel border-t border-x-0 border-b-0">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all min-w-[56px] ${
                isActive
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-white/35 hover:text-white/60'
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
