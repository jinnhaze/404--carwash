import React, { useState } from 'react';
import { UserPlus, Shield, Lock, Activity } from 'lucide-react';
import API from '../api/axios';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('users/admin-login/', {
        username: formData.username,
        password: formData.password
      });

      if (response.data.access || response.data.token) {
        localStorage.setItem('adminToken', response.data.access || response.data.token);
        window.location.href = '/admin-dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-[#0c0c0c] text-slate-100">
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-overlay grayscale bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550523091-bf96fe082855?auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0c0c0c]/80 via-[#110505]/95 to-[#0c0c0c]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#300505]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#dc2626]">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-100">
              404 <span className="text-[#dc2626]">HQ</span>
            </h2>
          </div>
          <div className="flex items-center justify-center rounded-md px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/30 text-[#dc2626] font-bold text-xs uppercase tracking-widest">
            Restricted Access
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-12 text-center">
            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#dc2626] to-[#dc2626]/40 select-none">
              PORTAL
            </h1>
            <p className="text-[#dc2626]/80 font-medium tracking-[0.3em] uppercase mt-2">
              Staff Authentication
            </p>
          </div>

          <div className="w-full max-w-md bg-[#130606]/80 backdrop-blur-md border border-[#300505] p-8 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.1)]">
            <div className="mb-8">
              <h3 className="text-2xl font-bold">Admin Login</h3>
              <p className="text-slate-500 text-sm mt-1">Authenticate to access fleet controls</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded uppercase font-bold tracking-widest">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin ID</label>
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#dc2626] transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="hq_staff_id"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-[#260f0f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Passcode</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#dc2626] transition-colors" size={18} />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-[#260f0f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                {loading ? 'Verifying...' : 'Authorize Login'}
              </button>
            </form>
          </div>
          
          <div className="mt-12 text-[#dc2626]/40 flex gap-2 items-center text-xs uppercase font-bold tracking-widest">
            <Activity size={14} className="animate-pulse" /> Highly Classified 
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;
