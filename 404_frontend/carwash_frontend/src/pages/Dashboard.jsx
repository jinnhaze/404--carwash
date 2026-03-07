import React, { useEffect, useState } from 'react';
import { Car, Plus, LogOut, Settings, Calendar, ShieldCheck, Clock } from 'lucide-react';
import API from '../api/axios';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    lastWash: "None on record",
    activeBookings: 0,
    nextWash: "N/A"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vehiclesRes, bookingsRes] = await Promise.all([
          API.get('vehicles/my-vehicles/'),
          API.get('bookings/my-bookings/')
        ]);
        
        setVehicles(vehiclesRes.data);
        
        // Calculate Stats
        const allBookings = bookingsRes.data;
        setBookings(allBookings);
        
        const active = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
        const completed = allBookings.filter(b => b.status === 'completed');

        // Sort to find latest completed
        let lastObj = completed.sort((a,b) => new Date(b.booking_date) - new Date(a.booking_date))[0];
        let nextObj = active.sort((a,b) => new Date(a.booking_date) - new Date(b.booking_date))[0];

        setStats({
          lastWash: lastObj ? lastObj.booking_date : "None on record",
          activeBookings: active.length,
          nextWash: nextObj ? nextObj.booking_date : "N/A"
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        if (err.response?.status === 401) window.location.href = '/';
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#181611] text-slate-100 font-sans">
      {/* Sidebar / Nav */}
      <nav className="border-b border-[#393528] bg-[#27251b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-700 mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            404 <span className="text-[#f3c316]">Clean</span>
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="p-2 hover:text-[#f3c316] transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Your Garage</h1>
            <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">Manage your fleet and bookings</p>
          </div>
          <a href="/add-vehicle" className="flex items-center gap-2 bg-[#f3c316] text-[#181611] px-6 py-3 rounded-lg font-black uppercase text-sm hover:bg-[#d9ae14] transition-all">
            <Plus size={18} /> Add New Vehicle
          </a>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 animate-pulse">Loading your vehicles...</div>
          ) : vehicles.length > 0 ? (
            (() => {
              const vehicleCards = [];
              vehicles.forEach((vehicle) => {
                const activeBookings = bookings.filter(b => b.vehicle === vehicle.id && b.status !== 'completed' && b.status !== 'cancelled');
                if (activeBookings.length > 0) {
                  activeBookings.forEach(booking => {
                    vehicleCards.push({ vehicle, activeBooking: booking });
                  });
                } else {
                  vehicleCards.push({ vehicle, activeBooking: null });
                }
              });

              return vehicleCards.map((card, idx) => {
                const { vehicle, activeBooking } = card;
                const statusColors = {
                  pending: "text-amber-500 bg-amber-500/10 border-amber-500/50",
                  pickup_scheduled: "text-blue-500 bg-blue-500/10 border-blue-500/50",
                  picked_up: "text-indigo-500 bg-indigo-500/10 border-indigo-500/50",
                  washing: "text-cyan-500 bg-cyan-500/10 border-cyan-500/50",
                  coating: "text-purple-500 bg-purple-500/10 border-purple-500/50",
                };

                return (
                <div key={`${vehicle.id}-${activeBooking ? activeBooking.id : 'none'}-${idx}`} className="bg-[#27251b] border border-[#393528] rounded-xl overflow-hidden group hover:border-[#f3c316]/50 transition-all flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-[#181611] rounded-lg text-[#f3c316]">
                        <Car size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold bg-[#f3c316]/10 text-[#f3c316] px-2 py-1 rounded uppercase tracking-tighter">
                          {vehicle.number_plate || 'No Plate'}
                        </span>
                        {activeBooking && (
                          <span className={`text-[10px] font-bold px-2 py-1 border rounded uppercase tracking-tighter ${statusColors[activeBooking.status] || "text-slate-500 bg-slate-500/10 border-slate-500/50"}`}>
                            {activeBooking.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{vehicle.car_name || vehicle.make} {vehicle.model}</h3>
                    <p className="text-slate-500 text-sm mb-2">{vehicle.color}</p>
                    {activeBooking && (
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                        Service: <span className="text-[#f3c316]">{activeBooking.service_name || `ID #${activeBooking.service}`}</span>
                      </p>
                    )}
                    
                    <div className="space-y-3 mt-auto pt-4">
                      <a href={`/my-bookings?vehicleId=${vehicle.id}`} className="block w-full text-center py-3 border border-[#393528] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#393528] transition-colors">
                        View History & Status
                      </a>
                      <a href={`/services`} className="block w-full text-center py-3 bg-[#f3c316]/10 text-[#f3c316] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#f3c316] hover:text-[#181611] transition-all">
                        Book Another Wash
                      </a>
                    </div>
                  </div>
                </div>
              )});
            })()
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-[#393528] rounded-2xl text-center">
              <Car className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No vehicles found in your garage</p>
            </div>
          )}
        </div>

        {/* Quick Stats / Footer Accents */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[#393528]">
          <div className="flex items-center gap-4">
            <Calendar className="text-[#f3c316]" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Last Wash</p>
              <p className="font-bold">{stats.lastWash}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-[#f3c316]" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Active Appointments</p>
              <p className="font-bold">{stats.activeBookings} Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="text-[#f3c316]" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Next Appointment</p>
              <p className="font-bold text-[#f3c316]">{stats.nextWash}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;