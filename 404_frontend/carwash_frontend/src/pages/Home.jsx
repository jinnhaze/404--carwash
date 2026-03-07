import React from 'react';
import { ShieldCheck, Droplets, MapPin, Gauge, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#181611] text-slate-100 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20 mix-blend-overlay grayscale bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#181611] via-[#181611]/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f3c316]/10 border border-[#f3c316]/20 text-[#f3c316] text-xs font-bold uppercase tracking-widest mb-8">
            <MapPin size={14} /> Now available at all nearby airports
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f3c316] to-[#d9ae14]">Ultimate</span><br/> Clean
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto mb-10">
            Premium car care meets VIP airport parking. Drop your keys, fly out, and return to showroom perfection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/services')}
              className="px-8 py-4 bg-[#f3c316] text-[#181611] font-black uppercase tracking-widest text-sm rounded-lg hover:bg-[#d9ae14] transition-all flex items-center gap-2 shadow-lg shadow-[#f3c316]/20"
            >
              Book an Appointment <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-transparent border border-[#393528] text-slate-100 font-black uppercase tracking-widest text-sm rounded-lg hover:bg-[#27251b] transition-all"
            >
              Go to Garage
            </button>
          </div>
        </div>
      </section>

      {/* Services/Features Grid */}
      <section className="py-20 px-6 border-t border-[#393528] bg-[#27251b]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Our Premium Services</h2>
            <div className="h-1 w-20 bg-[#f3c316] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-[#181611] border border-[#393528] hover:border-[#f3c316]/50 transition-colors group">
              <Droplets className="text-[#f3c316] mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold uppercase mb-2">Eco Wash</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Waterless premium cleaning that protects your paint and the environment.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#181611] border border-[#393528] hover:border-[#f3c316]/50 transition-colors group">
              <Gauge className="text-[#f3c316] mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold uppercase mb-2">10 Min Shine</h3>
              <p className="text-sm text-slate-500 leading-relaxed">In a rush? Our express exterior detail gets you back on the road instantly.</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#181611] border border-[#393528] hover:border-[#f3c316]/50 transition-colors group">
              <ShieldCheck className="text-[#f3c316] mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold uppercase mb-2">Nano Ceramic</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Long-lasting hydrophobic protective coating for absolute showroom gloss.</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#f3c316]/10 border border-[#f3c316] hover:bg-[#f3c316]/20 transition-colors group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f3c316]/20 blur-2xl rounded-full" />
              <MapPin className="text-[#f3c316] mb-6 group-hover:scale-110 transition-transform relative z-10" size={40} />
              <h3 className="text-xl font-bold uppercase mb-2 relative z-10 text-[#f3c316]">VIP Airport Hubs</h3>
              <p className="text-sm text-[#f3c316]/80 leading-relaxed relative z-10">We now offer secure parking and detailing at all nearby major airports while you travel.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t border-[#393528] text-center">
        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest"> 2026 404 Clean • Premium Auto Care</p>
      </footer>
    </div>
  );
};

export default Home;
