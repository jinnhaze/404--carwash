import React, { useEffect, useState } from 'react';
import { Car, Plus, Settings, Calendar, ShieldCheck, Clock, Trash2 } from 'lucide-react';
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

  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle from your garage?")) {
      try {
        await API.delete(`vehicles/delete/${id}/`);
        // Refresh data
        fetchDashboardData();
      } catch (error) {
        alert("Failed to delete vehicle. It might have active bookings.");
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans">


      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Your Garage</h1>
            <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">Manage your fleet and bookings</p>
          </div>
          <a href="/add-vehicle" className="flex items-center gap-2 bg-[#f3c316] text-[#000000] px-6 py-3 rounded-lg font-black uppercase text-sm hover:bg-[#d9ae14] transition-all">
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
                const vehicleBookings = bookings.filter(b => b.vehicle === vehicle.id && b.status !== 'cancelled');
                const activeBookings = vehicleBookings.filter(b => b.status !== 'completed');
                
                if (activeBookings.length > 0) {
                  activeBookings.forEach(booking => {
                    vehicleCards.push({ vehicle, activeBooking: booking });
                  });
                } else {
                  // If no active booking, show the most recent completed booking
                  const completedBookings = vehicleBookings.filter(b => b.status === 'completed');
                  if (completedBookings.length > 0) {
                    const mostRecentCompleted = completedBookings.reduce((latest, current) => 
                      new Date(current.created_at || 0) > new Date(latest.created_at || 0) ? current : latest
                    );
                    vehicleCards.push({ vehicle, activeBooking: mostRecentCompleted });
                  } else {
                    vehicleCards.push({ vehicle, activeBooking: null });
                  }
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
                <div key={`${vehicle.id}-${activeBooking ? activeBooking.id : 'none'}-${idx}`} className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden group hover:border-[#f3c316]/50 transition-all flex flex-col">
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-[#000000] rounded-lg text-[#f3c316] overflow-hidden flex items-center justify-center">
                        {vehicle.image ? (
                          <img src={vehicle.image} alt="Vehicle" className="w-full h-full object-cover" />
                        ) : (
                          <Car size={24} />
                        )}
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
                      <div className="mt-4 mb-6">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Washing Progress</p>
                          <p className="text-[10px] font-black text-[#f3c316] uppercase tracking-widest">
                            {activeBooking.status.replace('_', ' ')}
                          </p>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden flex gap-0.5 p-0.5">
                          {(() => {
                            const steps = [
                              'pending', 'confirmed', 'queued', 'pre_wash', 
                              'washing', 'detailing', 'waxing', 'inspection_final', 
                              'ready', 'completed'
                            ];
                            const currIdx = steps.indexOf(activeBooking.status);
                            
                            return steps.map((s, idx) => (
                              <div 
                                key={s} 
                                className={`h-full flex-1 rounded-full transition-all duration-700
                                  ${idx <= currIdx 
                                    ? 'bg-[#f3c316] shadow-[0_0_10px_rgba(243,195,22,0.4)]' 
                                    : 'bg-[#2a2a2a]'}`}
                              />
                            ));
                          })()}
                        </div>
                        
                        <p className="text-[9px] text-slate-600 mt-2 uppercase font-bold text-center">
                          Stage {['pending', 'confirmed', 'queued', 'pre_wash', 'washing', 'detailing', 'waxing', 'inspection_final', 'ready', 'completed'].indexOf(activeBooking.status) + 1} of 10
                        </p>
                      </div>
                    )}
                    
                    {activeBooking && (
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">
                        Refinement: <span className="text-[#f3c316]">{activeBooking.service_names || "N/A"}</span>
                      </p>
                    )}
                    
                    <div className="space-y-3 mt-auto pt-4">
                      <a href={`/my-bookings?vehicleId=${vehicle.id}`} className="block w-full text-center py-3 border border-[#2a2a2a] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors">
                        View History & Status
                      </a>
                      <a href={`/bookservices?vehicleId=${vehicle.id}`} className="block w-full text-center py-3 bg-[#f3c316]/10 text-[#f3c316] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#f3c316] hover:text-[#000000] transition-all">
                        Book Services
                      </a>
                      {(!activeBooking || activeBooking.status === 'completed') && (
                        <button 
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="block w-full text-center py-2 text-red-500/60 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={12} /> Remove Vehicle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )});
            })()
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-[#2a2a2a] rounded-2xl text-center">
              <Car className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No vehicles found in your garage</p>
            </div>
          )}
        </div>

        {/* Quick Stats / Footer Accents */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[#2a2a2a]">
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