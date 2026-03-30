import React, { useState } from "react";
import { Clock, MapPin, Calendar, Car, XCircle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import API from "../api/axios";

function BookingCard({ booking, services, vehicles, cancel, refresh }) {
  // Find related data
  const vehicle = vehicles.find(v => v.id === booking.vehicle);
  const bookingServices = services.filter(s => booking.services.includes(s.id));

  // Status Colors & Icons
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pending Approval', icon: Clock };
      case 'pickup_scheduled': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Pickup Scheduled', icon: MapPin };
      case 'picked_up': return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Vehicle Picked Up', icon: Car };
      case 'washing': return { color: 'text-[#f3c316]', bg: 'bg-[#f3c316]/10', border: 'border-[#f3c316]/20', label: 'Washing In Progress', icon: Clock };
      case 'coating': return { color: 'text-[#f3c316]', bg: 'bg-[#f3c316]/10', border: 'border-[#f3c316]/20', label: 'Ceramic Coating', icon: CheckCircle2 };
      case 'completed': return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Completed', icon: CheckCircle2 };
      case 'cancelled': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Cancelled', icon: XCircle };
      default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: status, icon: Clock };
    }
  };

  const [paying, setPaying] = useState(false);

  const handlePayment = async () => {
    setPaying(true);
    try {
      await API.post(`bookings/pay/${booking.id}/`, { amount: booking.total_price });
      alert("Payment successful!");
      if (refresh) refresh();
    } catch (err) {
      alert("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const statusStyle = getStatusDisplay(booking.status);
  const StatusIcon = statusStyle.icon;

  // Render variables safely
  const serviceNames = booking.service_names || (bookingServices.length > 0 ? bookingServices.map(s => s.name).join(', ') : "Unknown Service");
  const totalPrice = booking.total_price || (bookingServices.length > 0 ? bookingServices.reduce((sum, s) => sum + parseFloat(s.price), 0) : "N/A");
  const vehicleName = vehicle ? `${vehicle.car_name} ${vehicle.model}` : "Unknown Vehicle";
  const vehiclePlate = vehicle ? vehicle.number_plate : booking.vehicle_number || "N/A";

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden group hover:border-[#f3c316]/40 transition-all flex flex-col relative">
      <div className="p-6 grow space-y-4">
        {/* Header / Status Badge */}
        <div className="flex justify-between items-start mb-2">
          <div className={`px-3 py-1.5 rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
            <StatusIcon size={12} />
            {statusStyle.label}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              ID: #{booking.id}
            </span>
            {!booking.is_approved && booking.status !== 'cancelled' && (
              <span className="text-amber-500 text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Awaiting Admin Approval
              </span>
            )}
            {booking.is_approved && booking.payment_status === 'completed' && (
              <span className="text-green-500 text-[9px] font-bold uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                Paid
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{serviceNames}</h3>
          <p className="text-[#f3c316] font-bold text-lg flex items-center">
            <DollarSign size={16} />{totalPrice}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {bookingServices.map(s => (
              <span key={s.id} className="text-[8px] font-bold uppercase bg-[#000000] px-2 py-0.5 rounded border border-[#2a2a2a] text-slate-400">
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#f3c316]">
              <Car size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vehicle</p>
              <p className="font-bold">{vehicleName} <span className="text-slate-500 font-normal">({vehiclePlate})</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#f3c316]">
              <Calendar size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled Date</p>
              <p className="font-bold">{booking.booking_date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#f3c316]">
              <Clock size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Selected Services</p>
              <p className="font-bold text-white">{bookingServices.length} Items</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar Container within BookingCard */}
        {booking.status !== 'cancelled' && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] w-full">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Washing Progress</p>
              <p className="text-[10px] font-black text-[#f3c316] uppercase tracking-widest">
                {booking.status.replace('_', ' ')}
              </p>
            </div>
            <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {(() => {
                const steps = [
                  'pending', 'confirmed', 'queued', 'pre_wash', 
                  'washing', 'detailing', 'waxing', 'inspection_final', 
                  'ready', 'completed'
                ];
                let currIdx = steps.indexOf(booking.status);
                // Fallback for missing/other statuses
                if (currIdx === -1 && booking.status === 'pickup_scheduled') currIdx = 0;
                if (currIdx === -1 && booking.status === 'picked_up') currIdx = 1;
                if (currIdx === -1 && booking.status === 'coating') currIdx = 6;
                
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
              Stage { (() => {
                const steps = [
                  'pending', 'confirmed', 'queued', 'pre_wash', 'washing', 'detailing', 'waxing', 'inspection_final', 'ready', 'completed'
                ];
                let idx = steps.indexOf(booking.status);
                if (idx === -1 && booking.status === 'pickup_scheduled') idx = 0;
                if (idx === -1 && booking.status === 'picked_up') idx = 1;
                if (idx === -1 && booking.status === 'coating') idx = 6;
                return idx + 1 > 0 ? idx + 1 : 1;
              })()} of 10
            </p>
          </div>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="p-4 bg-[#000000] border-t border-[#2a2a2a] space-y-2">
          <button 
            onClick={() => cancel(booking.id)}
            className="w-full py-3 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={14} /> Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingCard;