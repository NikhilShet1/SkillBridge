import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { User, Phone, MapPin, Mail, Save, LogOut, Star, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', area: '' });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '', area: profile.area || '' });
      if (profile.role === 'worker') fetchReviews();
    }
  }, [profile]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, customer:customer_id(name)')
      .eq('worker_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setReviews(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone, area: form.area });
      setEditing(false);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) return null;

  const initial = profile.name?.charAt(0) || '?';

  return (
    <div className="has-bottom-nav min-h-[calc(100vh-64px)]">
      <div className="py-10 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white/8 flex items-center justify-center text-2xl font-bold text-green-400 mx-auto mb-3 border-2 border-white/10">
          {initial}
        </div>
        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <p className="text-white/30 text-sm capitalize">{profile.role}</p>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-6 flex flex-col gap-5">
        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Profile Details</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-ghost text-green-400 text-xs font-semibold">Edit</button>
            ) : (
              <button onClick={() => setEditing(false)} className="btn-ghost text-white/30 text-xs">Cancel</button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-white/30 mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Name</label>
              {editing ? <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /> : <p className="text-sm font-medium text-white/80">{profile.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-white/30 mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
              <p className="text-sm font-medium text-white/80">{profile.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-white/30 mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</label>
              {editing ? <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 9876543210" /> : <p className="text-sm font-medium text-white/80">{profile.phone || '—'}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-white/30 mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Area</label>
              {editing ? <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" placeholder="e.g. Bejai, Mangaluru" /> : <p className="text-sm font-medium text-white/80">{profile.area || '—'}</p>}
            </div>
            {editing && (
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        {profile.role === 'worker' && reviews.length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-bold text-white mb-4">Reviews</h2>
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-white/6 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-white/70">{r.customer?.name}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-white/40">{r.comment}</p>}
                  <p className="text-xs text-white/15 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button onClick={handleSignOut} className="btn-secondary w-full py-3 text-red-400 border-red-500/15 hover:bg-red-500/8 flex items-center justify-center gap-2 text-sm">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </main>
    </div>
  );
}
