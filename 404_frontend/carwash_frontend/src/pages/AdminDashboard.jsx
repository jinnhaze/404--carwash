import React, { useEffect, useState } from 'react';
import { LogOut, Shield, Database, CheckCircle2, Play, ParkingSquare } from 'lucide-react';
import API from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, completedBookings: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalBookings = async () => {
    try {
      const response = await API.get('bookings/admin/all/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = response.data;
      setBookings(data);
      setStats({
        totalBookings:     data.length,
        activeBookings:    data.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length,
        completedBookings: data.filter(b => b.status === 'completed').length
      });
    } catch (err) {
      if (err.response?.status === 401) window.location.href = '/admin-login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { window.location.href = '/admin-login'; return; }
    fetchGlobalBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.patch(`bookings/admin/update/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchGlobalBookings();
    } catch { alert("Failed to update status"); }
  };

  const approveBooking = async (id) => {
    try {
      await API.patch(`bookings/admin/update/${id}/`,
        { is_approved: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchGlobalBookings();
    } catch { alert("Failed to approve booking"); }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-slate-100 font-sans">

      {/* Admin Nav */}
      <nav className="border-b border-[#300505] bg-[#110505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="text-[#dc2626]" size={24} />
            <h2 className="text-xl font-black italic uppercase tracking-tighter">
              HQ <span className="text-[#dc2626]">Command</span>
            </h2>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 hover:text-[#dc2626] transition-colors text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="hidden sm:inline">Terminate Session</span>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-10 text-center md:text-left border-b border-[#300505] pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#dc2626]">Global Operations</h1>
          <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">Manage Orders & Fleet Deployments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#110505] border border-[#300505] p-6 rounded-xl flex items-center gap-6">
            <div className="p-4 bg-[#dc2626]/10 rounded-lg text-[#dc2626]"><Database size={32} /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bookings</p>
              <p className="text-3xl font-black text-slate-100">{stats.totalBookings}</p>
            </div>
          </div>
          <div className="bg-[#110505] border border-[#300505] p-6 rounded-xl flex items-center gap-6">
            <div className="p-4 bg-[#dc2626]/10 rounded-lg text-amber-500"><Play size={32} /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Active Queue</p>
              <p className="text-3xl font-black text-slate-100">{stats.activeBookings}</p>
            </div>
          </div>
          <div className="bg-[#110505] border border-[#300505] p-6 rounded-xl flex items-center gap-6">
            <div className="p-4 bg-green-500/10 rounded-lg text-green-500"><CheckCircle2 size={32} /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Completed</p>
              <p className="text-3xl font-black text-slate-100">{stats.completedBookings}</p>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-[#110505] border border-[#300505] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#300505] bg-[#1a0808]">
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-100">Live Deployments</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
              Syncing global databases...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
              No active deployments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#300505] text-[10px] uppercase tracking-widest text-[#dc2626]">
                    <th className="p-4">Client</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Services & Location</th>
                    <th className="p-4">Parking Slot</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#300505]">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-[#1a0808]/50 transition-colors">

                      {/* Client */}
                      <td className="p-4">
                        <p className="font-bold text-sm">{b.user_name || `User #${b.user}`}</p>
                        <p className="text-xs text-slate-500">{b.user_email || 'N/A'}</p>
                        <p className="text-[10px] text-slate-600">{b.user_phone || ''}</p>
                      </td>

                      {/* Vehicle — photo + plate + name + model + color */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg border border-[#300505] overflow-hidden flex-shrink-0 bg-[#0c0c0c] flex items-center justify-center">
                            {b.vehicle_image
                              ? <img src={b.vehicle_image} alt="Vehicle" className="w-full h-full object-cover" />
                              : <span className="text-slate-700 text-[9px] font-bold">NO IMG</span>
                            }
                          </div>
                          <div>
                            <span className="inline-block text-[10px] font-black bg-[#f3c316]/10 text-[#f3c316] border border-[#f3c316]/20 px-2 py-0.5 rounded mb-1">
                              {b.vehicle_plate || 'N/A'}
                            </span>
                            <p className="text-xs font-bold text-slate-200">{b.vehicle_name || ''} {b.vehicle_model || ''}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{b.vehicle_color || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Service + address */}
                      <td className="p-4 max-w-[200px]">
                        <p className="font-bold text-sm">{b.service_names || 'Unknown'}</p>
                        <p className="text-[10px] uppercase tracking-tighter text-slate-500 mt-1 truncate">
                          {b.pickup_address || 'No Address'}
                        </p>
                      </td>

                      {/* Parking Slot */}
                      <td className="p-4">
                        {b.parking_slot_detail ? (
                          <div className="space-y-1">
                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {b.parking_slot_detail.zone}
                            </span>
                            <p className="text-xs font-black">{b.parking_slot_detail.slot_number}</p>
                            <p className="text-[10px] text-slate-500">
                              Floor {b.parking_slot_detail.floor} • ₹{b.parking_slot_detail.price_per_hour}/hr
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-700">
                            <ParkingSquare size={14} />
                            <span className="text-[10px] font-bold uppercase">No Parking</span>
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border
                            ${b.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              b.status === 'cancelled' ? 'bg-slate-800 text-slate-500 border-slate-700' :
                              b.status === 'pending'   ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-[#f3c316]/10 text-[#f3c316] border-[#f3c316]/20'}`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                          {!b.is_approved && b.status !== 'cancelled' && (
                            <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500 animate-pulse">
                              Awaiting Approval
                            </span>
                          )}
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mt-1">
                            Funds: {b.payment_status === 'completed'
                              ? <span className="text-emerald-500">Secured</span>
                              : <span className="text-red-500">Pending</span>}
                          </div>
                        </div>
                      </td>

                      {/* Actions: Precision Deployment Control */}
                      <td className="p-4 text-right">
                        <div className="flex flex-col gap-2 items-end">
                          {!b.is_approved && (
                            <button onClick={() => approveBooking(b.id)}
                              className="px-4 py-1.5 bg-[#f3c316] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all shadow-lg shadow-[#f3c316]/10">
                              Approve Mission
                            </button>
                          )}
                          
                          {b.is_approved && b.status !== 'completed' && b.status !== 'cancelled' && (
                            <div className="relative">
                              <select 
                                onChange={(e) => updateStatus(b.id, e.target.value)}
                                value={b.status}
                                className="bg-[#1a0808] border border-[#300505] text-[#dc2626] text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 focus:border-[#f3c316] outline-none appearance-none cursor-pointer pr-8"
                              >
                                <option value="pending">Awaiting Approval</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="queued">In Queue</option>
                                <option value="pre_wash">Pre-Wash Inspection</option>
                                <option value="washing">Deep Cleaning</option>
                                <option value="detailing">Precision Detailing</option>
                                <option value="waxing">Wax & Polish</option>
                                <option value="inspection_final">Final Quality Check</option>
                                <option value="ready">Ready for Handover</option>
                                <option value="completed">Service Completed</option>
                                <option value="cancelled">Cancel Operation</option>
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#dc2626]">
                                 <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            </div>
                          )}

                          {b.status === 'completed' && (
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Deployment Concluded</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
