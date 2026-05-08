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
    <nav className="hero-bg shadow-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="brand text-white text-xl font-bold tracking-tight">
            Skill<span className="text-green-300">Bridge</span>
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3">
          {profile ? (
            <>
              <Link
                to={profile.role === 'worker' ? '/dashboard' : '/search'}
                className="text-green-200 text-sm font-medium hover:text-white transition-colors"
              >
                {profile.role === 'worker' ? 'Dashboard' : 'Find Workers'}
              </Link>
              <Link
                to="/bookings"
                className="text-green-200 text-sm font-medium hover:text-white transition-colors"
              >
                Bookings
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <User className="w-4 h-4" />
                {profile.name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-green-300 hover:text-white transition-colors p-1.5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-green-200 text-sm font-medium hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-sm px-4 py-2"
              >
                + Register as Worker
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#0d3d2b] border-t border-white/10 px-4 py-3 flex flex-col gap-2">
          {profile ? (
            <>
              <Link
                to={profile.role === 'worker' ? '/dashboard' : '/search'}
                className="text-green-200 text-sm py-2 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {profile.role === 'worker' ? 'Dashboard' : 'Find Workers'}
              </Link>
              <Link
                to="/bookings"
                className="text-green-200 text-sm py-2 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Bookings
              </Link>
              <Link
                to="/profile"
                className="text-green-200 text-sm py-2 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-red-300 text-sm py-2 text-left hover:text-red-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-green-200 text-sm py-2 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-green-200 text-sm py-2 hover:text-white"
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
