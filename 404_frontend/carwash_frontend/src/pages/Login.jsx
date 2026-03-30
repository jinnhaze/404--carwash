import React, { useState } from 'react';
import { User, Lock, Droplets, Gauge, ShieldCheck } from 'lucide-react';
import API from '../api/axios';
import SpinnerOverlay from '../components/SpinnerOverlay';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '', // Changed from email to username
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
      // Sending username to match your RegisterSerializer fields
      const response = await API.post('users/login/', {
        username: formData.username, 
        password: formData.password
      });

      if (response.data.access || response.data.token) {
        localStorage.setItem('token', response.data.access || response.data.token);
        localStorage.setItem('username', formData.username);
        
        setTimeout(() => {
          window.location.href = '/home/';
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <>
    <SpinnerOverlay isVisible={loading} />
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-black text-slate-100">
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay grayscale bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/95 to-black" />

      <div className="relative z-10 flex flex-col grow">

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-12 text-center">
            <h1 className="text-8xl md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#f3c316] to-[#f3c316]/40 select-none">
              404
            </h1>
            <p className="text-slate-400 font-medium tracking-[0.3em] uppercase -mt-4">
              The ultimate clean
            </p>
          </div>

          <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-md border border-[#2a2a2a] p-8 rounded-xl shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold">Welcome Back</h3>
              <p className="text-slate-400 text-sm mt-1">Sign in to manage your wash passes</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded uppercase font-bold tracking-widest">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                  <a href="#" className="text-[10px] font-bold text-[#f3c316] hover:underline uppercase tracking-widest">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#f3c316] hover:bg-[#d9ae14] disabled:bg-slate-700 text-[#181611] font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm shadow-lg shadow-[#f3c316]/20"
              >
                {loading ? 'Authenticating...' : 'Sign In to Account'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#2a2a2a] text-center">
              <p className="text-slate-400 text-sm">
                New to 404? 
                <a href="/register" className="text-[#f3c316] font-bold hover:underline ml-1">Create an account</a>
              </p>
            </div>
          </div>
          
          <div className="mt-12 flex gap-10">
            <div className="flex flex-col items-center gap-2">
              <Droplets className="text-[#f3c316]" size={20} />
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Eco Wash</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Gauge className="text-[#f3c316]" size={20} />
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">10 Min Shine</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="text-[#f3c316]" size={20} />
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Nano Ceramic</span>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default Login;