import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import SalonList from "../pages/SalonList";
import SalonDetail from "../pages/SalonDetail";
import Appointment from "../pages/Appointment";
import PreviewNail from "../pages/PreviewNail";
import AdminDashboard from "../pages/AdminDashboard";
import SuperAdminPanel from "../pages/SuperAdminPanel";
import Profile from "../pages/Profile";
import Navbar from "../components/Navbar";
import { AdminRoute, PrivateRoute, SuperAdminRoute } from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/salons" element={<SalonList />} />
        <Route path="/salons/:id" element={<SalonDetail />} />
        <Route
          path="/appointment/:salonId"
          element={
            <PrivateRoute>
              <Appointment />
            </PrivateRoute>
          }
        />
        <Route path="/preview" element={<PreviewNail />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdminPanel />
            </SuperAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}