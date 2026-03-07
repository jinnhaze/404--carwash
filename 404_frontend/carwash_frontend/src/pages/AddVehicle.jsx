import React, { useState } from 'react';
import { Car, Hash, Palette, ArrowLeft, Save } from 'lucide-react';
import API from '../api/axios';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    car_name: '',
    model: '',
    color: '',
    number_plate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('vehicles/add/', formData);
      window.location.href = '/dashboard';
    } catch (err) {
      if (err.response?.data) {
        const errorMsgs = Object.values(err.response.data).flat().join(' ');
        setError(errorMsgs || 'Failed to add vehicle.');
      } else {
        setError('Failed to add vehicle. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans bg-[#181611] text-slate-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#181611]/80 via-[#181611]/95 to-[#181611]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center px-6 md:px-10 py-4 border-b border-[#393528]">
          <a href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#f3c316] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Garage</span>
          </a>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Add <span className="text-[#f3c316]">Vehicle</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px] mt-2">
              Register a new car and set its base location
            </p>
          </div>

          <div className="w-full max-w-2xl bg-[#27251b]/80 backdrop-blur-md border border-[#393528] p-8 rounded-xl shadow-2xl">
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded uppercase font-bold tracking-widest text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Make / Brand</label>
                  <div className="relative group">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                    <input 
                      type="text" name="car_name" required value={formData.car_name} onChange={handleChange}
                      placeholder="e.g. BMW"
                      className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Model</label>
                  <div className="relative">
                    <input 
                      type="text" name="model" required value={formData.model} onChange={handleChange}
                      placeholder="e.g. M4"
                      className="w-full px-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Color</label>
                  <div className="relative group">
                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                    <input 
                      type="text" name="color" required value={formData.color} onChange={handleChange}
                      placeholder="e.g. Matte Black"
                      className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">License Plate</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                    <input 
                      type="text" name="number_plate" required value={formData.number_plate} onChange={handleChange}
                      placeholder="KL-01-AB-1234"
                      className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-700 uppercase"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#f3c316] hover:bg-[#d9ae14] disabled:bg-slate-700 text-[#181611] font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#f3c316]/20"
              >
                {loading ? 'Adding to Garage...' : <><Save size={18} /> Save Vehicle Information</>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddVehicle;