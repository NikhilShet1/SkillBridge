import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Wrench, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim()) throw new Error('Name is required');
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUp(formData.email, formData.password, formData.name, formData.role, formData.phone);
        navigate(formData.role === 'worker' ? '/dashboard' : '/search');
      } else {
        await signIn(formData.email, formData.password);
        setTimeout(() => {
          const profile = useAuthStore.getState().profile;
          if (profile?.role === 'worker') {
            navigate('/dashboard');
          } else {
            navigate('/search');
          }
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center border border-white/10 shadow-lg shadow-black/20">
              <Wrench className="w-6 h-6 text-green-400" />
            </div>
          </div>
        <p className="text-green-400/60 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
          {isSignUp ? 'Join the platform' : 'Welcome back'}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-white/35 text-sm mt-2 max-w-xs mx-auto">
          {isSignUp
            ? 'Join SkillBridge and connect with your local community.'
            : 'Access your SkillBridge account.'}
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8 fade-up shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramakrishna Shetty"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    I am a <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'customer' })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                        formData.role === 'customer'
                          ? 'border-green-500/50 bg-green-500/10 text-green-400'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:bg-white/3'
                      }`}
                    >
                      🏠 Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'worker' })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                        formData.role === 'worker'
                          ? 'border-green-500/50 bg-green-500/10 text-green-400'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:bg-white/3'
                      }`}
                    >
                      🔧 Worker
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSignUp ? 'Creating Account…' : 'Signing In…'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-5 pt-4 border-t border-white/6">
            <p className="text-sm text-white/30">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-green-400 font-semibold hover:text-green-300 transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
