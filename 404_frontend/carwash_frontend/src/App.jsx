import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import MyBookings from "./pages/MyBookings";
import BookServices from "./pages/BookServices";
import Services from "./pages/Services";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";

// Create a layout component that wraps routes with the Navbar
const AuthenticatedLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-1">{children}</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* User Authenticated Routes with Navbar */}
        <Route path="/home" element={<AuthenticatedLayout><Home /></AuthenticatedLayout>} />
        <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
        <Route path="/vehicles" element={<AuthenticatedLayout><Vehicles /></AuthenticatedLayout>} />
        <Route path="/add-vehicle" element={<AuthenticatedLayout><AddVehicle /></AuthenticatedLayout>} />
        <Route path="/my-bookings" element={<AuthenticatedLayout><MyBookings /></AuthenticatedLayout>} />
        <Route path="/bookservices" element={<AuthenticatedLayout><BookServices/></AuthenticatedLayout>} />
        <Route path="/services" element={<AuthenticatedLayout><Services /></AuthenticatedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;