import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, DollarSign, CheckCircle2, Droplets } from "lucide-react";
import API from "../api/axios";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("services/")
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching services", err);
        setLoading(false);
      });
  }, []);

  const bookService = (id) => {
    window.location.href = `/bookservices?serviceId=${id}`;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-[#181611] text-slate-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#181611]/80 via-[#181611]/95 to-[#181611]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center px-6 md:px-10 py-4 border-b border-[#393528]">
          <a href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#f3c316] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Garage</span>
          </a>
        </header>

        <main className="max-w-6xl mx-auto w-full p-6 md:p-10">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Premium <span className="text-[#f3c316]">Services</span>
            </h1>
            <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">
              Select a wash package for your vehicle
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse uppercase tracking-widest font-bold">
              Loading our packages...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-[#27251b] border border-[#393528] rounded-xl overflow-hidden group hover:border-[#f3c316]/50 transition-all flex flex-col">
                  <div className="p-8 grow">
                    <div className="w-12 h-12 rounded-lg bg-[#181611] text-[#f3c316] flex items-center justify-center mb-6">
                      <Droplets size={24} />
                    </div>
                    
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{service.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 min-h-[60px]">{service.description}</p>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                          <Clock size={14} className="text-[#f3c316]" /> Duration
                        </span>
                        <span className="font-bold">{service.duration}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                          <DollarSign size={14} className="text-[#f3c316]" /> Price
                        </span>
                        <span className="font-bold text-[#f3c316] text-lg">₹{service.price}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-[#393528]">
                      {(service.features || ["Interior Vacuum", "Exterior Wash", "Tire Shine"]).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle2 size={16} className="text-[#f3c316] flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto">
                    <button 
                      onClick={() => bookService(service.id)}
                      className="w-full bg-[#f3c316] hover:bg-[#d9ae14] text-[#181611] font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm shadow-lg shadow-[#f3c316]/20"
                    >
                      Select Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Services;