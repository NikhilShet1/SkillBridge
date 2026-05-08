import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-x-0 border-b-0 text-center text-xs py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Wrench className="w-4 h-4 text-green-400/60" />
          <span className="brand text-white/80 font-semibold text-sm">
            Skill<span className="text-gradient">Bridge</span>
          </span>
        </div>
        <p className="text-white/30">Connecting skilled workers with homes & businesses in Mangaluru.</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-white/25">
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
          <Link to="/search" className="hover:text-white/60 transition-colors">Find Workers</Link>
          <Link to="/register" className="hover:text-white/60 transition-colors">Register</Link>
        </div>
        <p className="mt-4 text-white/15">© 2026 SkillBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}
