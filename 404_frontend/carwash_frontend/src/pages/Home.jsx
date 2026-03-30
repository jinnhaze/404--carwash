import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck, Droplets, MapPin, Gauge, ArrowRight, Star,
  Clock, CheckCircle2, Car, Zap, Award, Phone, Mail, Instagram,
  Twitter, Facebook, ChevronRight, Sparkles, Plane
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ── Animated number counter ── */
const Counter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(end / 60);
      const t = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(t); }
        else setCount(start);
      }, 25);
      obs.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const services = [
    {
      icon: Droplets,
      title: 'Diamond Eco-Mist',
      desc: 'Our proprietary waterless treatment uses bio-polymer technology to encapsulate dirt, leaving a scratch-free, high-gloss finish.',
      tag: 'Sustainable Luxury',
    },
    {
      icon: Zap,
      title: 'Rapid Velocity Detail',
      desc: 'Engineered for the time-conscious elite. A high-impact exterior revival delivered in 15 minutes without compromising precision.',
      tag: 'Performance',
    },
    {
      icon: ShieldCheck,
      title: 'Signature Ceramic Shield',
      desc: 'An aerospace-grade 9H nano-ceramic coating that bonds permanently to your paint, providing unmatched hydrophobic protection.',
      tag: 'Ultimate Protection',
    },
    {
      icon: Plane,
      title: 'Elite Airport Concierge',
      desc: 'The gold standard in travel convenience. Drop your vehicle at our airport hub; return to a showroom-fresh car upon landing.',
      tag: 'Executive Service',
      featured: true,
    },
  ];

  const steps = [
    { num: '01', icon: Car,          title: 'Strategic Registration',    desc: 'Register your vehicle in our secure fleet management system in seconds.' },
    { num: '02', icon: Clock,        title: 'Precision Scheduling',    desc: 'Select your bespoke treatment and pick a slot that aligns with your itinerary.' },
    { num: '03', icon: Droplets,     title: 'Elite Execution',  desc: 'Our certified master detailers transform your vehicle using state-of-the-art tech.' },
    { num: '04', icon: CheckCircle2, title: 'Real-Time Oversight',  desc: 'Monitor the 10-stage refinement process live from your Command Dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 z-0 bg-center bg-cover opacity-25 grayscale"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        {/* Yellow glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f3c316]/8 rounded-full blur-[120px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f3c316]/10 border border-[#f3c316]/25 text-[#f3c316] text-xs font-bold uppercase tracking-widest mb-10 backdrop-blur-sm">
            <Sparkles size={13} className="animate-pulse" />
            Redefining the standard of car care
          </div>

          {/* Headline */}
          <h1 className="text-7xl md:text-[9rem] lg:text-[12rem] font-black uppercase tracking-tighter leading-none mb-4 select-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">The </span>
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(to bottom, #f3c316, #b8960f)' }}
            >
              Elite
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Carwash.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 font-medium tracking-[0.25em] uppercase max-w-xl mx-auto mb-12">
            Where Precision Meets Passion. 
            Elite Detailing. Airport Convenience. Showroom Perfection.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/services')}
              className="group px-10 py-4 bg-[#f3c316] text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(243,195,22,0.35)]"
            >
              Explore Treatments
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-4 bg-white/5 border border-white/15 text-slate-100 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              Command Center
            </button>
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <section className="py-20 border-y border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: 5000,  suffix: '+', label: 'Cars Refined' },
            { value: 98,    suffix: '%', label: 'Client Satisfaction' },
            { value: 10,    suffix: '+', label: 'Elite Hubs' },
            { value: 9,     suffix: 'H', label: 'Ceramic Grade' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl md:text-5xl font-black text-[#f3c316] mb-1">
                <Counter end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <section id="about" className="py-28 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#f3c316]/10 rounded-3xl blur-2xl group-hover:bg-[#f3c316]/20 transition-all duration-500" />
            <div className="relative rounded-2xl overflow-hidden border border-[#2a2a2a] aspect-video">
               <img 
                 src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80" 
                 alt="Precision Detailing" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                 <div>
                   <p className="text-[#f3c316] font-black text-2xl uppercase tracking-tighter">0.01% Precision</p>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">The margin of excellence</p>
                 </div>
               </div>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#f3c316] mb-4">Our Heritage</p>
             <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">
               The <span className="text-[#f3c316]">Standard</span> of Perfection
             </h2>
             <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
               <p>
                 Founded on the philosophy that every vehicle is a masterpiece of engineering, 404 Carwash was born to provide car care that matches that ambition. We don't just wash cars; we perform automotive restoration.
               </p>
               <p>
                 Our team of certified master detailers utilizes aerospace-grade ceramic technologies and eco-conscious bio-polymer cleaning systems. We specialize in the elite treatment of supercars, luxury sedans, and high-performance SUVs, ensuring every curve and crevice meets the "404 Standard"—absolute perfection.
               </p>
               <p className="border-l-2 border-[#f3c316] pl-6 italic text-slate-300">
                 "Average is the enemy. At 404, we chase the remaining 1% of shine that others leave behind."
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <section className="py-28 px-6 border-y border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#f3c316] mb-4">Treatment Menu</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              Bespoke <span className="text-[#f3c316]">Care</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className={`p-8 rounded-2xl border transition-all group flex flex-col ${
                    svc.featured 
                      ? 'bg-gradient-to-br from-[#f3c316]/20 to-[#f3c316]/5 border-[#f3c316]/40 hover:border-[#f3c316]' 
                      : 'bg-[#0d0d0d] border-[#2a2a2a] hover:border-[#f3c316]/40'
                  }`}
                >
                  <Icon className="text-[#f3c316] mb-5 group-hover:scale-110 transition-transform" size={40} />
                  <h3 className="text-xl font-black uppercase mb-2">{svc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{svc.desc}</p>
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f3c316]">{svc.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CONTACT: ELITE CONCIERGE ─────────────────────────── */}
      <section id="contact" className="py-28 px-6 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#f3c316] mb-4">Support Hub</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">
                Elite <span className="text-[#f3c316]">Concierge</span>
              </h2>
              <p className="text-slate-400 text-sm mb-12 max-w-md">
                Have a specific requirement? Our concierge team is available 24/7 to assist with bespoke bookings, corporate fleet management, or VIP airport logistical support.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#2a2a2a] group-hover:border-[#f3c316]/50 transition-all flex items-center justify-center">
                    <Phone className="text-[#f3c316]" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Direct Line</p>
                    <p className="text-lg font-bold text-white tracking-widest">+91 98765 40404</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#2a2a2a] group-hover:border-[#f3c316]/50 transition-all flex items-center justify-center">
                    <Mail className="text-[#f3c316]" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email Access</p>
                    <p className="text-lg font-bold text-white tracking-widest">concierge@404carwash.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#2a2a2a] group-hover:border-[#f3c316]/50 transition-all flex items-center justify-center">
                    <MapPin className="text-[#f3c316]" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Elite HQ</p>
                    <p className="text-lg font-bold text-white tracking-widest">T3 Terminal Hub, KIA Airport</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#2a2a2a] p-10 rounded-3xl relative h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Sparkles size={120} className="text-[#f3c316]" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-8">Priority Access</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                     <input type="text" className="w-full bg-black border border-[#2a2a2a] p-4 rounded-xl text-sm focus:border-[#f3c316] outline-none transition-all" placeholder="John Doe" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                     <input type="email" className="w-full bg-black border border-[#2a2a2a] p-4 rounded-xl text-sm focus:border-[#f3c316] outline-none transition-all" placeholder="john@404.com" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service Required</label>
                   <select className="w-full bg-black border border-[#2a2a2a] p-4 rounded-xl text-sm focus:border-[#f3c316] outline-none transition-all appearance-none cursor-pointer">
                      <option>Ceramic Coating Inquiry</option>
                      <option>Fleet Management</option>
                      <option>Airport VIP Pickup</option>
                      <option>Other Elite Services</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detail Your Request</label>
                   <textarea rows="4" className="w-full bg-black border border-[#2a2a2a] p-4 rounded-xl text-sm focus:border-[#f3c316] outline-none transition-all resize-none" placeholder="How can we assist with your vehicle today?"></textarea>
                </div>
                <button className="w-full py-4 bg-[#f3c316] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all shadow-lg lg:mt-4">
                  Request Callback
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-black border-t border-[#2a2a2a] pt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16">
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 text-[#f3c316]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase">
                404 <span className="text-[#f3c316]">Carwash</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
              Engineered for perfection. The automotive refinement standard trusted by elite car owners worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8">Navigation</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
               <a href="/home" className="hover:text-[#f3c316] transition-colors">Home</a>
               <a href="/services" className="hover:text-[#f3c316] transition-colors">Treatments</a>
               <a href="/dashboard" className="hover:text-[#f3c316] transition-colors">Garage</a>
               <a href="#about" className="hover:text-[#f3c316] transition-colors">About</a>
               <a href="#contact" className="hover:text-[#f3c316] transition-colors">Contact</a>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col items-end">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8">Newsletter access</h4>
            <div className="flex max-w-sm w-full gap-2">
               <input type="text" className="grow bg-[#111] border border-[#2a2a2a] p-4 rounded-xl text-xs uppercase tracking-widest outline-none focus:border-[#f3c316]" placeholder="Your email address" />
               <button className="px-6 bg-[#f3c316] text-black font-black uppercase text-[10px] rounded-xl hover:bg-white transition-all">Join</button>
            </div>
            <p className="text-[9px] text-slate-600 mt-4 uppercase font-bold">Exclusive updates • Priority booking • No spam</p>
          </div>
        </div>
        
        <div className="border-t border-white/5 py-8 flex items-center justify-between px-6 max-w-7xl mx-auto">
           <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em]">© 2026 404 Carwash • Built for Excellence</p>
           <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <Icon key={i} size={14} className="text-slate-700 hover:text-[#f3c316] cursor-pointer transition-colors" />
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
