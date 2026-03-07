import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Car, Droplets, Calendar, Clock, MapPin, CheckCircle2, Plane } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import API from "../api/axios";

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const BookService = () => {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get("serviceId") || "";

  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    vehicle: "",
    service: initialServiceId,
    booking_date: "",
    booking_time: "",
    slot: "",
    pickup_address: "",
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    setFormData({
      ...formData,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAirportParking, setIsAirportParking] = useState(false);

  useEffect(() => {
    // Fetch options for the forms
    API.get("vehicles/my-vehicles/").then(res => setVehicles(res.data)).catch(() => {});
    API.get("services/slots/").then(res => setSlots(res.data)).catch(() => {});
    API.get("services/").then(res => setServices(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-populate booking_time based on selected slot's start_time
    if (name === "slot") {
      const selectedSlot = slots.find(s => String(s.id) === String(value));
      if (selectedSlot) {
        newFormData.booking_time = selectedSlot.start_time;
      }
    }

    setFormData(newFormData);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // If Airport Parking is selected, append the flag so the backend natively stores it in pickup_address
      const submissionData = {
        ...formData,
        pickup_address: isAirportParking 
          ? `[VIP AIRPORT PARKING] ${formData.pickup_address}`
          : formData.pickup_address
      };

      await API.post("bookings/create/", submissionData);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/my-bookings";
      }, 2000);
    } catch (err) {
      if (err.response?.data) {
        const errorMsgs = Object.values(err.response.data).flat().join(' ');
        setError(errorMsgs || "Failed to create booking.");
      } else {
        setError("Failed to create booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-[#181611] text-slate-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#181611]/80 via-[#181611]/95 to-[#181611]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center px-6 md:px-10 py-4 border-b border-[#393528]">
          <a href="/services" className="flex items-center gap-2 text-slate-400 hover:text-[#f3c316] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Services</span>
          </a>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Book <span className="text-[#f3c316]">Appointment</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px] mt-2">
              Schedule your premium wash
            </p>
          </div>

          <div className="w-full max-w-2xl bg-[#27251b]/80 backdrop-blur-md border border-[#393528] p-8 rounded-xl shadow-2xl">
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded uppercase font-bold tracking-widest text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded uppercase font-bold tracking-widest flex flex-col items-center justify-center gap-2">
                <CheckCircle2 size={32} />
                Booking Confirmed! Redirecting...
              </div>
            )}

            {!success && (
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Vehicle Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Select Vehicle</label>
                    <div className="relative group">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                      <select 
                        name="vehicle" value={formData.vehicle} onChange={handleChange} required
                        className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all text-slate-100 appearance-none"
                      >
                        <option value="" disabled>Select a vehicle</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.car_name} {v.model} ({v.number_plate})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service Type</label>
                    <div className="relative group">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                      <select 
                        name="service" value={formData.service} onChange={handleChange} required
                        className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all text-slate-100 appearance-none"
                      >
                        <option value="" disabled>Select a service package</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Booking Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                      <input 
                        type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} required
                        className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all text-slate-100 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Slot Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Time Slot</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                      <select 
                        name="slot" value={formData.slot} onChange={handleChange} required
                        className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all text-slate-100 appearance-none"
                      >
                        <option value="" disabled>Select available time</option>
                        {slots.map(s => (
                          <option key={s.id} value={s.id}>{s.start_time} - {s.end_time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="space-y-4 border-t border-[#393528] pt-6 mt-6">
                  {/* Airport Parking Toggle */}
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-[#f3c316]/30 bg-[#f3c316]/5 cursor-pointer hover:bg-[#f3c316]/10 transition-colors">
                    <div className="flex-shrink-0 relative flex items-center justify-center w-6 h-6 rounded border border-[#f3c316] bg-[#181611]">
                      <input 
                        type="checkbox" 
                        checked={isAirportParking}
                        onChange={(e) => setIsAirportParking(e.target.checked)}
                        className="peer absolute opacity-0 w-full h-full cursor-pointer"
                      />
                      <Plane 
                        size={14} 
                        className={`text-[#f3c316] transition-opacity ${isAirportParking ? 'opacity-100' : 'opacity-0'}`} 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f3c316] uppercase tracking-widest">Add Secure Airport Parking</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">We will detail your car while you fly. Provide terminal below.</p>
                    </div>
                  </label>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {isAirportParking ? "Airport Terminal / Specific Location" : "Pickup Location"}
                    </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#f3c316] transition-colors" size={18} />
                    <input 
                      type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange} required
                      placeholder={isAirportParking ? "e.g. JFK Terminal 4, Level 2" : "Enter full address or building name"}
                      className="w-full pl-12 pr-4 py-3 bg-[#181611] border border-[#393528] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c316]/50 focus:border-[#f3c316] transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-[#f3c316] hover:bg-[#d9ae14] disabled:bg-slate-700 text-[#181611] font-black py-4 rounded-lg transition-transform active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#f3c316]/20"
                >
                  {loading ? 'Processing...' : 'Confirm Appointment'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookService;