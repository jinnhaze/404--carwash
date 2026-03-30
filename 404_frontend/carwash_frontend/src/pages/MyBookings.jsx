import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, CalendarCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import BookingCard from "../components/BookingCard";

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const vehicleIdFilter = searchParams.get("vehicleId");

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayedBookings = vehicleIdFilter 
    ? bookings.filter(b => String(b.vehicle) === String(vehicleIdFilter))
    : bookings;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes, vehiclesRes] = await Promise.all([
        API.get("bookings/my-bookings/"),
        API.get("services/"),
        API.get("vehicles/my-vehicles/")
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const cancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await API.patch(`bookings/cancel/${id}/`, { status: "cancelled" });
        fetchAllData(); // Refresh list to reflect cancelled status
      } catch (err) {
        alert("Failed to cancel booking.");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-[#000000] text-slate-100">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/95 to-[#000000]" />

      <div className="relative z-10 flex flex-col grow">
        <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#2a2a2a]">
          <a href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#f3c316] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Garage</span>
          </a>
          <button 
            onClick={fetchAllData}
            title="Refresh Bookings"
            className="p-2 bg-[#111111] border border-[#2a2a2a] rounded-md hover:text-[#f3c316] transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        <main className="max-w-6xl mx-auto w-full p-6 md:p-10">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              My <span className="text-[#f3c316]">Appointments</span>
            </h1>
            <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">
              Track your vehicle's service status in real-time
            </p>
          </div>

          {loading && bookings.length === 0 ? (
            <div className="py-20 text-center text-slate-500 animate-pulse uppercase tracking-widest font-bold">
              Fetching your records...
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-[#2a2a2a] rounded-2xl text-center bg-[#111111]/30">
              <CalendarCheck className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                {vehicleIdFilter ? "No bookings found for this specific vehicle" : "No bookings found"}
              </p>
              <a href="/services" className="mt-4 inline-block bg-[#f3c316]/10 text-[#f3c316] px-6 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#f3c316] hover:text-[#000000] transition-all">
                Book a Wash
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedBookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  services={services}
                  vehicles={vehicles}
                  cancel={cancel}
                  refresh={fetchAllData}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyBookings;