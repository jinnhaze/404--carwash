import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, Car, Droplets, Calendar, Clock,
  MapPin, CheckCircle2, CreditCard, ShieldCheck, XCircle,
  ParkingSquare, SkipForward, Plane
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";

// ── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Vehicle"  },
  { id: 2, label: "Services" },
  { id: 3, label: "Schedule" },
  { id: 4, label: "Parking"  },
  { id: 5, label: "Confirm"  },
];

const BookService = () => {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get("serviceId") || "";
  const initialVehicleId = searchParams.get("vehicleId") || "";

  const [step,     setStep]     = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [slots,    setSlots]    = useState([]);
  const [services, setServices] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);

  const [formData, setFormData] = useState({
    vehicle:        initialVehicleId,
    services:       initialServiceId ? [initialServiceId] : [],
    booking_date:   "",
    booking_time:   "",
    slot:           "",
    pickup_address: "Garage Collection", // Default since we removed tab
    latitude:       20.5937,
    longitude:      78.9629,
    parking_slot:   null,   // null = skip
  });

  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");
  const [success,          setSuccess]          = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess,   setPaymentSuccess]   = useState(false);

  useEffect(() => {
    API.get("vehicles/my-vehicles/").then(r => setVehicles(r.data)).catch(() => {});
    API.get("services/slots/").then(r => setSlots(r.data)).catch(() => {});
    API.get("services/").then(r => setServices(r.data)).catch(() => {});
    API.get("bookings/parking-slots/").then(r => setParkingSlots(r.data)).catch(() => {});
    API.get("bookings/my-bookings/").then(r => setActiveBookings(r.data.filter(b => b.status !== 'completed' && b.status !== 'cancelled'))).catch(() => {});
  }, []);

  const existingBooking = activeBookings.find(b => String(b.vehicle) === String(formData.vehicle));
  const preExistingServices = existingBooking ? existingBooking.services.map(String) : [];
  const additionalServices = formData.services.filter(id => !preExistingServices.includes(String(id)));

  const selectedParking = parkingSlots.find(p => String(p.id) === String(formData.parking_slot));
  
  const totalPrice = services
    .filter(s => additionalServices.includes(String(s.id)))
    .reduce((acc, s) => acc + parseFloat(s.price), 0) + (!existingBooking && selectedParking ? parseFloat(selectedParking.price_per_hour) : 0);

  const handleChange = e => {
    const { name, value } = e.target;
    let next = { ...formData, [name]: value };
    if (name === "slot") {
      const sel = slots.find(s => String(s.id) === String(value));
      if (sel) next.booking_time = sel.start_time;
    }
    setFormData(next);
  };

  const toggleService = id => {
    const sid = String(id);
    if (preExistingServices.includes(sid)) return; // prevent unchecking existing services

    const list = formData.services.includes(sid)
      ? formData.services.filter(x => x !== sid)
      : [...formData.services, sid];
    setFormData({ ...formData, services: list });
  };

  const activeSteps = existingBooking ? [1, 2, 5] : [1, 2, 3, 4, 5];

  // Validation per step
  const canProceed = () => {
    if (step === 1) return !!formData.vehicle;
    if (step === 2) return existingBooking ? additionalServices.length > 0 : formData.services.length > 0;
    if (step === 3 && !existingBooking) return !!formData.booking_date && !!formData.slot;
    return true; // Parking & Confirm are always ok
  };

  const next = () => { 
    setError(""); 
    const idx = activeSteps.indexOf(step);
    if (idx < activeSteps.length - 1) setStep(activeSteps[idx + 1]);
  };
  const back = () => { 
    setError(""); 
    const idx = activeSteps.indexOf(step);
    if (idx > 0) setStep(activeSteps[idx - 1]);
  };

  const initPayment = () => {
    if (existingBooking && additionalServices.length === 0) { setError("Please add at least one new service."); return; }
    if (!existingBooking && formData.services.length === 0) { setError("Please select at least one service."); return; }
    setShowPaymentModal(true);
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError("");
    try {
      let bookingId;
      
      if (existingBooking) {
        bookingId = existingBooking.id;
      } else {
        // 1. Create the booking payload
        const payload = { ...formData };
        if (!payload.parking_slot) delete payload.parking_slot;

        // 2. Create booking first to get ID
        const bookingRes = await API.post("bookings/create/", payload);
        bookingId = bookingRes.data.id;
      }

      // 3. Create Razorpay Order
      const orderRes = await API.post(`bookings/pay/razorpay/create/${bookingId}/`, {
        amount: totalPrice
      });

      const { order_id, amount, currency, key_id } = orderRes.data;

      // 4. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "404 Clean Premium",
        description: existingBooking ? `Add-on Services #${bookingId}` : `Booking #${bookingId}`,
        order_id: order_id,
        handler: async (response) => {
          try {
            // 5. Verify payment on backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            if (existingBooking) {
              verifyPayload.new_services = additionalServices;
            }

            await API.post("bookings/pay/razorpay/verify/", verifyPayload);
            
            setPaymentSuccess(true);
            setSuccess(true);
            setTimeout(() => {
              setShowPaymentModal(false);
              window.location.href = "/my-bookings";
            }, 2000);
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
        },
        theme: {
          color: "#f3c316",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      if (err.response?.data) {
        setError(Object.values(err.response.data).flat().join(" ") || "Failed to initiate payment.");
      } else {
        setError("Payment initialization failed.");
      }
      setLoading(false);
    }
  };

  // Group parking slots by zone
  const grouped = parkingSlots.reduce((acc, s) => {
    if (!acc[s.zone]) acc[s.zone] = [];
    acc[s.zone].push(s);
    return acc;
  }, {});


  // Selected vehicle + service names for confirm step
  const selectedVehicle = vehicles.find(v => String(v.id) === String(formData.vehicle));
  const selectedServices = services.filter(s => formData.services.includes(String(s.id)));
  const selectedSlot     = slots.find(s => String(s.id) === String(formData.slot));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-24">

      {/* Back link */}
      <div className="px-6 pt-6">
        <a href="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#f3c316] transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Services
        </a>
      </div>

      {/* Page header */}
      <div className="px-6 pt-6 pb-8 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Book <span className="text-[#f3c316]">Appointment</span>
        </h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-2">
          Schedule your premium wash in {STEPS.length} easy steps
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl p-2 gap-1 overflow-x-auto scrollbar-hide">
          {STEPS.filter(s => activeSteps.includes(s.id)).map((s, i, arr) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => {
                   const sIdx = activeSteps.indexOf(s.id);
                   const curIdx = activeSteps.indexOf(step);
                   if (curIdx > sIdx) setStep(s.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-1 justify-center
                  ${step === s.id
                    ? 'bg-[#f3c316] text-black shadow-md'
                    : activeSteps.indexOf(step) > activeSteps.indexOf(s.id)
                      ? 'text-[#f3c316] cursor-pointer hover:bg-[#f3c316]/10'
                      : 'text-slate-600 cursor-default'
                  }`}
              >
                {activeSteps.indexOf(step) > activeSteps.indexOf(s.id)
                  ? <CheckCircle2 size={13} />
                  : <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border
                      ${step === s.id ? 'border-black bg-black text-[#f3c316]' : 'border-slate-700 text-slate-700'}`}>
                      {s.id !== 5 ? activeSteps.indexOf(s.id) + 1 : 5 }
                    </span>
                }
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < arr.length - 1 && (
                <div className={`w-px h-4 flex-shrink-0 ${activeSteps.indexOf(step) > activeSteps.indexOf(s.id) ? 'bg-[#f3c316]/30' : 'bg-[#2a2a2a]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="max-w-3xl mx-auto px-4">
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded-xl uppercase font-bold tracking-widest text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-6 bg-green-500/10 border border-green-500/40 text-green-400 text-sm rounded-xl uppercase font-bold tracking-widest flex flex-col items-center gap-2">
            <CheckCircle2 size={36} /> Booking Confirmed! Redirecting...
          </div>
        )}

        {!success && (
            <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl p-6 md:p-8">

            {/* ── STEP 1: Vehicle ── */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-tight mb-6">Select Your Vehicle</h2>
                {vehicles.length === 0
                  ? <p className="text-slate-500 text-sm text-center py-10">No vehicles found. <a href="/add-vehicle" className="text-[#f3c316] underline">Add one first.</a></p>
                  : vehicles.map(v => {
                     const isBooked = activeBookings.some(b => String(b.vehicle) === String(v.id));
                     return (
                      <button
                        key={v.id}
                        onClick={() => {
                          const actv = activeBookings.find(b => String(b.vehicle) === String(v.id));
                          setFormData({ 
                            ...formData, 
                            vehicle: String(v.id),
                            services: actv ? actv.services.map(String) : (initialServiceId ? [initialServiceId] : [])
                          });
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                          ${String(formData.vehicle) === String(v.id)
                            ? 'border-[#f3c316] bg-[#f3c316]/5'
                            : 'border-[#2a2a2a] hover:border-[#f3c316]/30'}`}
                      >
                        <div className="w-14 h-14 rounded-lg bg-black border border-[#2a2a2a] overflow-hidden flex items-center justify-center shrink-0">
                          {v.image
                            ? <img src={v.image} alt={v.car_name} className="w-full h-full object-cover" />
                            : <Car size={24} className="text-[#f3c316]" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-black uppercase">{v.car_name} {v.model}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-500 text-[10px] uppercase font-bold">{v.color}</p>
                            {isBooked && (
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Active Booking</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-[#f3c316]/10 text-[#f3c316] border border-[#f3c316]/20 px-2 py-1 rounded uppercase">
                          {v.number_plate}
                        </span>
                        {String(formData.vehicle) === String(v.id) && (
                          <CheckCircle2 size={20} className="text-[#f3c316] shrink-0" />
                        )}
                      </button>
                     );
                  })
                }
              </div>
            )}

            {/* ── STEP 2: Bespoke Treatment Menu ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Bespoke Treatment Menu</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Select the level of care your vehicle deserves</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Refinement</p>
                    <p className="text-2xl font-black text-[#f3c316]">₹{totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {services.map(s => {
                    const isPreExisting = preExistingServices.includes(String(s.id));
                    const selected = formData.services.includes(String(s.id));
                    
                    // Map service icons based on name keywords
                    const getIcon = (name) => {
                      const n = name.toLowerCase();
                      if (n.includes('eco') || n.includes('mist')) return <Droplets size={24} />;
                      if (n.includes('rapid') || n.includes('velocity') || n.includes('express')) return <Plane size={24} />;
                      if (n.includes('ceramic') || n.includes('shield') || n.includes('coat')) return <ShieldCheck size={24} />;
                      if (n.includes('interior') || n.includes('valet') || n.includes('deep')) return <Car size={24} />;
                      return <Droplets size={24} />;
                    };

                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        disabled={isPreExisting}
                        className={`group relative flex items-start gap-6 p-6 rounded-2xl border transition-all text-left overflow-hidden
                          ${selected
                            ? (isPreExisting ? 'bg-black border-[#2a2a2a] opacity-60' : 'bg-[#f3c316]/10 border-[#f3c316] shadow-[0_0_30px_rgba(243,195,22,0.1)]')
                            : 'bg-black border-[#2a2a2a] hover:border-[#f3c316]/50 hover:bg-[#111]'}`}
                      >
                        {selected && !isPreExisting && (
                          <div className="absolute top-0 right-0 p-3">
                             <CheckCircle2 size={18} className="text-[#f3c316]" />
                          </div>
                        )}
                        <div className={`mt-1 p-3 rounded-xl transition-colors shrink-0
                          ${selected ? 'bg-[#f3c316] text-black' : 'bg-[#111] text-slate-500 group-hover:text-[#f3c316]'}`}>
                          {getIcon(s.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-sm font-black uppercase tracking-tight ${selected ? 'text-[#f3c316]' : 'text-slate-100'}`}>
                              {s.name}
                            </h3>
                            <span className="text-sm font-black text-white">₹{s.price}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-3 pr-4">
                            {s.description || 'Our signature refinement process tailored for maximum results.'}
                          </p>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5">
                               <Clock size={11} className="text-slate-600" />
                               <span className="text-[10px] font-bold text-slate-600 uppercase">{s.duration}</span>
                             </div>
                             {isPreExisting && (
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 border-l border-[#2a2a2a]">
                                 Already Active
                               </span>
                             )}
                             {selected && !isPreExisting && (
                               <span className="text-[9px] font-black text-[#f3c316] uppercase tracking-widest animate-pulse pl-2 border-l border-[#f3c316]/30">
                                 Added to Itinerary
                               </span>
                             )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 3: Schedule ── */}
            {step === 3 && (() => {
                const now = new Date();
                const today = now.toISOString().split("T")[0];
                const isPast6PM = now.getHours() >= 18;
                const minDate = isPast6PM ? new Date(now.getTime() + 86400000).toISOString().split("T")[0] : today;

                const filteredSlots = slots.filter(s => {
                  if (formData.booking_date !== today) return true;
                  const [h, m] = s.start_time.split(":").map(Number);
                  const slotTime = new Date(now);
                  slotTime.setHours(h, m, 0, 0);
                  
                  // Hide slots that are less than 15 minutes away from current time
                  const fifteenMinsBuffer = new Date(now.getTime() + 15 * 60000);
                  return slotTime > fifteenMinsBuffer;
                });

                return (
                  <div className="space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-6">Pick a Date & Time</h2>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Booking Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                        <input
                          type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} required
                          min={minDate}
                          className="w-full pl-12 pr-4 py-3 bg-black border border-[#2a2a2a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f3c316]/40 focus:border-[#f3c316] transition-all text-slate-100 [color-scheme:dark]"
                        />
                      </div>
                      {isPast6PM && <p className="text-[9px] text-[#f3c316] font-bold uppercase mt-1">Note: It's past 6 PM, please select a slot starting from tomorrow.</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Time Slot (6 AM - 6 PM)</label>
                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {filteredSlots.length === 0 ? (
                            <div className="col-span-full py-10 text-center border border-dashed border-[#2a2a2a] rounded-xl">
                              <p className="text-xs text-slate-600 font-bold uppercase">No slots available for this date.</p>
                            </div>
                          ) : (
                            filteredSlots.map(s => (
                              <button
                                key={s.id}
                                onClick={() => setFormData({ ...formData, slot: String(s.id), booking_time: s.start_time.slice(0, 5) })}
                                className={`p-2 rounded-lg border text-[10px] font-black transition-all flex flex-col items-center gap-1
                                  ${String(formData.slot) === String(s.id)
                                    ? 'border-[#f3c316] bg-[#f3c316]/10 text-[#f3c316]'
                                    : 'border-[#2a2a2a] text-slate-400 hover:border-[#f3c316]/30'}`}
                              >
                                <Clock size={12} />
                                {s.start_time.slice(0, 5)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* ── STEP 4: Parking ── */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black uppercase tracking-tight">Choose a Parking Slot</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold -mt-2">
                  Optional — skip if you don't need parking
                </p>

                {/* Skip option */}
                <button
                  onClick={() => setFormData({ ...formData, parking_slot: null })}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all
                    ${formData.parking_slot === null
                      ? 'border-[#f3c316] bg-[#f3c316]/5 text-[#f3c316]'
                      : 'border-[#2a2a2a] text-slate-500 hover:border-[#2a2a2a]'}`}
                >
                  <SkipForward size={18} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest">Skip Parking</p>
                    <p className="text-[10px] text-slate-500">No parking needed</p>
                  </div>
                  {formData.parking_slot === null && <CheckCircle2 size={16} className="ml-auto" />}
                </button>

                {/* Available slots grouped by zone */}
                {Object.keys(grouped).sort().map(zone => (
                  <div key={zone}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">
                      {zone}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {grouped[zone].map(slot => {
                        const isSelected = String(formData.parking_slot) === String(slot.id);
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setFormData({ ...formData, parking_slot: slot.id })}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left
                              ${isSelected
                                ? 'border-[#f3c316] bg-[#f3c316]/8'
                                : 'border-[#2a2a2a] hover:border-[#f3c316]/30'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border
                                  ${zone === 'VIP'
                                    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                                    : 'text-slate-400 border-[#2a2a2a]'}`}>
                                  {zone}
                                </span>
                                <span className="text-xs font-black">{slot.slot_number}</span>
                                {isSelected && <CheckCircle2 size={13} className="text-[#f3c316]" />}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Floor {slot.floor} &nbsp;•&nbsp;
                                <span className="text-green-400 font-bold">Available</span>
                              </p>
                            </div>
                            <p className="text-sm font-black text-[#f3c316]">₹{slot.price_per_hour}/hr</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {parkingSlots.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-10">No parking slots available right now.</p>
                )}
              </div>
            )}

            {/* ── STEP 5: Confirm ── */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">Confirm Booking</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold -mt-2">Review your details before paying</p>

                {/* Summary cards */}
                <div className="space-y-3">
                  {[
                    {
                      label: "Vehicle",
                      value: selectedVehicle
                        ? `${selectedVehicle.car_name} ${selectedVehicle.model} (${selectedVehicle.number_plate})`
                        : "—",
                    },
                    {
                      label: "Services",
                      value: existingBooking 
                             ? `${selectedServices.filter(s => additionalServices.includes(String(s.id))).map(s => s.name).join(", ")} (Add-on)`
                             : `${selectedServices.map(s => s.name).join(", ")}`,
                    },
                    {
                      label: "Date & Slot",
                      value: existingBooking
                        ? `On-going (Skip Scheduling)`
                        : (formData.booking_date
                             ? `${formData.booking_date} — ${selectedSlot ? `${selectedSlot.start_time} – ${selectedSlot.end_time}` : ""}`
                             : "—"),
                    },
                    {
                      label: "Parking",
                      value: selectedParking
                        ? `${selectedParking.zone} • ${selectedParking.slot_number} (Floor ${selectedParking.floor}) — ₹${selectedParking.price_per_hour}/hr`
                        : "No parking",
                    },
                  ].map(row => (
                    <div key={row.label} className="flex gap-4 p-4 rounded-xl bg-black border border-[#2a2a2a]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 w-20 shrink-0 mt-0.5">{row.label}</p>
                      <p className="text-sm font-bold text-slate-200">{row.value}</p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-5 rounded-xl border border-[#f3c316]/25 bg-[#f3c316]/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Grand Total</p>
                    <p className="text-3xl font-black text-[#f3c316]">₹{totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{existingBooking ? additionalServices.length : formData.services.length} Services</p>
                    {selectedParking && !existingBooking && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">+ Parking Fee</p>}
                    <p className="text-[9px] text-slate-500 uppercase">Incl. Eco-Tax & GST</p>
                  </div>
                </div>

                <button
                  onClick={initPayment}
                  disabled={loading}
                  className="w-full bg-[#f3c316] hover:bg-white disabled:bg-slate-700 text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest text-sm shadow-lg shadow-[#f3c316]/20"
                >
                  {loading ? "Processing..." : `Pay ₹${totalPrice.toLocaleString()} & Confirm`}
                </button>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            {!success && (
              <div className={`flex mt-8 gap-3 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                {step > 1 && (
                  <button
                    onClick={back}
                    className="flex items-center gap-2 px-6 py-3 border border-[#2a2a2a] rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-[#f3c316]/40 hover:text-[#f3c316] transition-all"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                {step < 5 && (
                  <button
                    onClick={next}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-6 py-3 bg-[#f3c316] disabled:bg-[#2a2a2a] disabled:text-slate-600 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all ml-auto"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="bg-[#111] p-5 border-b border-[#2a2a2a] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f3c316] rounded-lg">
                  <CreditCard className="text-black" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Checkout</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Transaction Secured</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-8 text-center">
              {paymentSuccess ? (
                <div className="space-y-4 py-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle2 className="text-green-400" size={32} />
                  </div>
                  <h4 className="text-xl font-black uppercase">Payment Successful!</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">
                    Ref: RZP_{Math.random().toString(36).substr(2,9).toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-black rounded-xl border border-[#2a2a2a]">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Paying To</p>
                      <p className="text-xs font-black uppercase">404 Clean Premium</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Amount</p>
                      <p className="text-2xl font-black text-[#f3c316]">₹{totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2a2a2a] bg-black text-left">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <ShieldCheck size={15} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Test Payment Mode</p>
                      <p className="text-[10px] text-slate-300">Simulated sandbox environment</p>
                    </div>
                  </div>

                  <button
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    className="w-full bg-[#f3c316] text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processing...</>
                      : "Pay Securely Now"
                    }
                  </button>
                  <p className="text-[8px] text-slate-600 uppercase tracking-tighter">
                    By proceeding you agree to our Terms & Privacy Policy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;