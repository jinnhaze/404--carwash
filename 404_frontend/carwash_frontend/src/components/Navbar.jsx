import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, Car, Droplets, CalendarCheck } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Garage', path: '/dashboard', icon: Car },
    { name: 'Book a Wash', path: '/services', icon: Droplets },
    { name: 'Appointments', path: '/my-bookings', icon: CalendarCheck },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#181611]/80 backdrop-blur-md border-b border-[#393528]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-6 h-6 text-[#f3c316]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-black italic tracking-tighter uppercase text-slate-100">
                404 <span className="text-[#f3c316]">Clean</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-colors ${
                        isActive
                          ? 'bg-[#f3c316]/10 text-[#f3c316]'
                          : 'text-slate-400 hover:bg-[#27251b] hover:text-[#f3c316]'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>

            {/* Logout */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <span className="hidden md:inline">Logout</span>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* spacer for fixed top nav on desktop */}
      <div className="h-16 hidden md:block" />

      {/* Mobile Navigation (Bottom Bar Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181611]/95 backdrop-blur-md border-t border-[#393528] z-50">
        <div className="flex justify-around items-center py-2 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                    isActive ? 'text-[#f3c316]' : 'text-slate-500 hover:text-slate-300'
                  }`
                }
              >
                <Icon size={20} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-tighter leading-none">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* spacer for fixed bottom nav on mobile */}
      <div className="h-16 md:hidden block" />
    </>
  );
};

export default Navbar;