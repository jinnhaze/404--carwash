import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Menu, Droplets, Gauge, ShieldCheck, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import SpinnerOverlay from '../components/SpinnerOverlay';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Clear any stale tokens so the JWT middleware doesn't intercept the registration request
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
  }, []);

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
      await API.post('users/register/', formData);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      if (err.response?.data) {
        // extract all error arrays into a clean string, e.g. {"email": ["Taken"], "phone": ["Taken"]}
        const errorData = err.response.data;
        let errorMsgs = [];
        
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            errorMsgs.push(...errorData[key].map(e => typeof e === 'object' ? e.message || JSON.stringify(e) : e));
          } else if (typeof errorData[key] === 'string') {
            errorMsgs.push(errorData[key]);
          } else if (typeof errorData[key] === 'object' && errorData[key] !== null) {
             errorMsgs.push(errorData[key].message || JSON.stringify(errorData[key]));
          }
        }
        
        setError(errorMsgs.length > 0 ? errorMsgs.join(' | ') : 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <>
    <SpinnerOverlay isVisible={loading} />
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-[#000000] text-slate-100">
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay grayscale bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/95 to-[#000000]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#f3c316]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">
              404 <span className="text-[#f3c316]">Carwash</span>
            </h2>
          </div>
          <button className="flex items-center justify-center rounded-md h-10 w-10 bg-[#111111] border border-[#2a2a2a]">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-8 text-center mt-4">
            <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tighter uppercase mb-2">
              Join the <span className="text-[#f3c316]">Club</span>
            </h1>
            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">
              Premium care for your vehicle
            </p>
          </div>

          <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-md border border-[#2a2a2a] p-8 rounded-xl shadow-2xl mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Create Account</h3>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded uppercase font-bold tracking-widest">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-500 text-xs rounded uppercase font-bold tracking-widest">Account created! Redirecting to login...</div>}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="text" name="username" value={formData.username} onChange={handleChange} required
                    placeholder="johndoe123"
                    className="w-full pl-12 pr-4 py-3 bg-[#000000] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#000000] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-4 py-3 bg-[#000000] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-[#000000] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || success}
                className="w-full mt-2 bg-[#f3c316] hover:bg-[#d9ae14] disabled:bg-slate-700 text-[#000000] font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm shadow-lg shadow-[#f3c316]/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : success ? 'Success!' : <>Register <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
              <p className="text-slate-400 text-sm">
                Already have an account? 
                <a href="/" className="text-[#f3c316] font-bold hover:underline ml-1">Sign In</a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default Register;