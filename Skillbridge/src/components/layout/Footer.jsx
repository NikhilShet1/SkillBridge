import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="hero-bg text-green-200 text-center text-xs py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wrench className="w-4 h-4 text-green-300" />
          <span className="brand text-white font-semibold text-sm">
            Skill<span className="text-green-300">Bridge</span>
          </span>
        </div>
        <p>Connecting skilled workers with homes & businesses in Mangaluru.</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-green-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/search" className="hover:text-white transition-colors">Find Workers</Link>
          <Link to="/register" className="hover:text-white transition-colors">Register</Link>
        </div>
        <p className="mt-3 text-green-400">© 2026 SkillBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}
