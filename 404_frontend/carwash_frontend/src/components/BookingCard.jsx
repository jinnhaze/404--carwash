import React, { useState } from "react";
import { Clock, MapPin, Calendar, Car, XCircle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import API from "../api/axios";

function BookingCard({ booking, services, vehicles, cancel, refresh }) {
  // Find related data
  const service = services.find(s => s.id === booking.service);
  const vehicle = vehicles.find(v => v.id === booking.vehicle);

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
      await API.post(`bookings/pay/${booking.id}/`, { amount: servicePrice });
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
  const serviceName = service ? service.name : booking.service_name || "Unknown Service";
  const servicePrice = service ? service.price : "N/A";
  const duration = service ? service.duration : "N/A";
  const vehicleName = vehicle ? `${vehicle.car_name} ${vehicle.model}` : "Unknown Vehicle";
  const vehiclePlate = vehicle ? vehicle.number_plate : booking.vehicle_number || "N/A";

  return (
    <div className="bg-[#27251b] border border-[#393528] rounded-xl overflow-hidden group hover:border-[#f3c316]/40 transition-all flex flex-col relative">
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
          <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{serviceName}</h3>
          <p className="text-[#f3c316] font-bold text-lg flex items-center">
            <DollarSign size={16} />{servicePrice}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#393528]">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#181611] flex items-center justify-center text-[#f3c316]">
              <Car size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vehicle</p>
              <p className="font-bold">{vehicleName} <span className="text-slate-500 font-normal">({vehiclePlate})</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#181611] flex items-center justify-center text-[#f3c316]">
              <Calendar size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled Date</p>
              <p className="font-bold">{booking.booking_date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-6 h-6 rounded bg-[#181611] flex items-center justify-center text-[#f3c316]">
              <Clock size={12} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Est. Duration</p>
              <p className="font-bold text-white">{duration}</p>
            </div>
          </div>
        </div>
      </div>

      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <div className="p-4 bg-[#181611] border-t border-[#393528] space-y-2">
          {booking.is_approved && booking.payment_status !== 'completed' && (
            <button 
              onClick={handlePayment}
              disabled={paying}
              className="w-full py-3 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-black disabled:opacity-50 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Wallet size={14} /> {paying ? 'Processing...' : `Pay dummy amount (₹${servicePrice})`}
            </button>
          )}
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