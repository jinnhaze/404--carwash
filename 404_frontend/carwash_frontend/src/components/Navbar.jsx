import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Car, Droplets, CalendarCheck, User, ChevronDown, LayoutDashboard, Info, Mail } from 'lucide-react';
import SpinnerOverlay from './SpinnerOverlay';
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Get username from localStorage
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUsername(savedUser);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/');
      setIsLoggingOut(false);
    }, 1500);
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Garage', path: '/dashboard', icon: Car },
    { name: 'Services', path: '/services', icon: Droplets },
    { name: 'About', path: '/home#about', icon: Info },
    { name: 'Contact', path: '/home#contact', icon: Mail },
  ];

  const isHome = location.pathname === '/home';

  return (
    <>
      <SpinnerOverlay isVisible={isLoggingOut} />
      {/* Desktop Top Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? 'bg-black/95 backdrop-blur-xl border-b border-[#2a2a2a] shadow-lg shadow-black/40'
            : 'bg-transparent border-b border-transparent py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/home')}>
              <div className="w-8 h-8 text-[#f3c316] group-hover:scale-110 transition-transform">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
                404 <span className="text-[#f3c316]">Carwash</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isHashLink = item.path.includes('#');
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:text-[#f3c316] ${
                        isActive && !isHashLink
                          ? 'text-[#f3c316] bg-[#f3c316]/10'
                          : 'text-slate-400'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                );
              })}

              {/* Profile Dropdown */}
              <div className="relative ml-4 pl-4 border-l border-[#2a2a2a]">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#111] border border-[#2a2a2a] hover:border-[#f3c316]/50 transition-all text-slate-300"
                >
                  <div className="w-7 h-7 rounded-full bg-[#f3c316]/20 flex items-center justify-center border border-[#f3c316]/30">
                    <User size={14} className="text-[#f3c316]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{username || 'User'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-[#2a2a2a] bg-[#111]/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{username}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { navigate('/dashboard'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-[#f3c316]/10 hover:text-[#f3c316] transition-all"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button
                          onClick={() => { navigate('/my-bookings'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-[#f3c316]/10 hover:text-[#f3c316] transition-all"
                        >
                          <CalendarCheck size={16} /> My Appointments
                        </button>
                        <div className="my-1 border-t border-[#2a2a2a]" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* spacer for fixed top nav on desktop */}
      <div className={`h-20 hidden md:block ${!isHome ? 'block' : 'hidden'}`} />

      {/* Mobile Navigation (Bottom Bar Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-[#2a2a2a] z-50 px-4">
        <div className="flex justify-around items-center py-2 h-16 max-w-lg mx-auto">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center p-2 transition-colors ${
                    isActive ? 'text-[#f3c316]' : 'text-slate-500'
                  }`
                }
              >
                <Icon size={22} className="mb-1" />
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{item.name}</span>
              </NavLink>
            );
          })}
          
          {/* User section for mobile */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center p-2 text-slate-500"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-1">
              <User size={14} className="text-slate-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Me</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-2 text-red-900/50"
          >
            <LogOut size={22} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Exit</span>
          </button>
        </div>
      </div>

      {/* spacer for fixed bottom nav on mobile */}
      <div className="h-16 md:hidden block" />
    </>
  );
};

export default Navbar;