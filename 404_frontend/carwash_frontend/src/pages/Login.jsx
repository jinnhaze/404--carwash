import React, { useState } from 'react';
import { User, Lock, Menu, Droplets, Gauge, ShieldCheck } from 'lucide-react';
import API from '../api/axios'; //

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
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-[#181611] text-slate-100">
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay grayscale bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#181611]/80 via-[#181611]/95 to-[#181611]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#393528]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#f3c316]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">
              404 <span className="text-[#f3c316]">Car Wash</span>
            </h2>
          </div>
          <button className="flex items-center justify-center rounded-md h-10 w-10 bg-[#27251b] border border-[#393528]">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-12 text-center">
            <h1 className="text-8xl md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#f3c316] to-[#f3c316]/40 select-none">
              404
            </h1>
            <p className="text-slate-400 font-medium tracking-[0.3em] uppercase -mt-4">
              The ultimate clean
            </p>
          </div>

          <div className="w-full max-w-md bg-[#27251b]/80 backdrop-blur-md border border-[#393528] p-8 rounded-xl shadow-2xl">
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
                    placeholder="your_username"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
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
                    className="w-full pl-12 pr-4 py-4 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
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

            <div className="mt-8 pt-8 border-t border-[#393528] text-center">
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
  );
};

export default Login;