import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Wrench, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-t-0 border-x-0">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            <Wrench className="w-4.5 h-4.5 text-green-400" />
          </div>
          <span className="brand text-white text-lg font-bold tracking-tight">
            Skill<span className="text-gradient">Bridge</span>
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          {profile ? (
            <>
              <Link
                to={profile.role === 'worker' ? '/dashboard' : '/search'}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {profile.role === 'worker' ? 'Dashboard' : 'Find Workers'}
              </Link>
              <Link
                to="/bookings"
                className="text-white/60 text-sm font-medium hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Bookings
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-all border border-white/10"
              >
                <User className="w-3.5 h-3.5 text-green-400" />
                {profile.name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/60 text-sm font-medium hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-xs px-4 py-2"
              >
                + Register as Worker
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden glass-panel border-t px-4 py-3 flex flex-col gap-1">
          {profile ? (
            <>
              <Link
                to={profile.role === 'worker' ? '/dashboard' : '/search'}
                className="text-white/60 text-sm py-2.5 px-3 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {profile.role === 'worker' ? 'Dashboard' : 'Find Workers'}
              </Link>
              <Link
                to="/bookings"
                className="text-white/60 text-sm py-2.5 px-3 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Bookings
              </Link>
              <Link
                to="/profile"
                className="text-white/60 text-sm py-2.5 px-3 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-red-400/70 text-sm py-2.5 px-3 text-left rounded-lg hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/60 text-sm py-2.5 px-3 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-white/60 text-sm py-2.5 px-3 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Register as Worker
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
