import React, { useEffect, useState } from 'react';
import { LogOut, Users, Shield, Database, ShieldCheck, CheckCircle2, Play, Check } from 'lucide-react';
import API from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0
  });
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
        totalBookings: data.length,
        activeBookings: data.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length,
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
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }
    fetchGlobalBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    window.location.href = '/admin-login';
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.patch(`bookings/admin/update/${id}/`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchGlobalBookings();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const approveBooking = async (id) => {
    try {
      await API.patch(`bookings/admin/update/${id}/`, 
        { is_approved: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchGlobalBookings();
    } catch (error) {
      alert("Failed to approve booking");
    }
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

        {/* Global Stats Grid */}
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

        {/* Global Orders Table */}
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
                    <th className="p-4">Service</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#300505]">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-[#1a0808]/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm">{b.user_name || `User ID: ${b.user}`}</p>
                        <p className="text-xs text-slate-500">{b.user_email || "N/A"}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-[#f3c316]">{b.vehicle_plate || "N/A"}</p>
                        <p className="text-xs text-slate-500">{b.vehicle_name || ""}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{b.service_name || "Unknown"}</p>
                        <p className="text-[10px] uppercase tracking-tighter text-slate-500 mt-1 truncate max-w-[200px]">
                          {b.pickup_address || "No Address"}
                        </p>
                      </td>
                      <td className="p-4 text-center space-y-2">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest 
                            ${b.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                              b.status === 'cancelled' ? 'bg-slate-800 text-slate-400' : 
                              b.status === 'pending' ? 'bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/20' : 
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                            {b.status.replace('_', ' ')}
                          </span>
                          {!b.is_approved && b.status !== 'cancelled' && (
                            <span className="inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Needs Approval
                            </span>
                          )}
                          {b.is_approved && (
                            <span className="inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Approved
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Payment: {b.payment_status === 'completed' ? <span className="text-green-500">Paid</span> : <span className="text-red-500">Unpaid</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {!b.is_approved && b.status === 'pending' && (
                          <button onClick={() => approveBooking(b.id)} className="px-3 py-1 bg-[#1a0808] border border-[#dc2626]/50 text-[#dc2626] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#dc2626] hover:text-white transition-colors ml-2">
                            Approve
                          </button>
                        )}
                        {b.is_approved && b.status === 'pending' && (
                          <button onClick={() => updateStatus(b.id, 'washing')} className="px-3 py-1 bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#b91c1c] transition-colors ml-2">
                            Start Wash
                          </button>
                        )}
                        {(b.status === 'washing' || b.status === 'picked_up' || b.status === 'pickup_scheduled') && (
                          <button onClick={() => updateStatus(b.id, 'completed')} className="px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/50 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-green-500 hover:text-black transition-colors ml-2">
                            Complete
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-3 py-1 text-slate-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ml-2 mt-2">
                            Cancel
                          </button>
                        )}
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
