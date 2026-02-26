import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Landing from "./pages/Landing";

// layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import CollectorLayout from "./layouts/CollectorLayout";

// admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import ManageCenters from "./pages/Admin/ManageCenters";
import SmartBins from "./pages/Admin/SmartBins";
import AdminRoutesPage from "./pages/Admin/RoutesPage";
import Reports from "./pages/Admin/Reports";
import Heatmap from "./pages/Admin/Heatmap";
import AdminAlerts from "./pages/Admin/Alerts";

// collector pages
import CollectorDashboard from "./pages/Collector/Dashboard";

// user pages
import UserDashboard from "./pages/User/Dashboard";
import UserSmartBins from "./pages/User/SmartBins";
import MapPage from "./pages/User/MapPage";
import AIDetection from "./pages/User/AIDetection";
import Pickup from "./pages/User/Pickup";
import Analytics from "./pages/User/Analytics";
import Suggestions from "./pages/User/Suggestions";
import UserAlerts from "./pages/User/Alerts";
import Profile from "./pages/User/Profile";
import Rewards from "./pages/User/Rewards";
import ImpactReport from "./pages/User/ImpactReport";
import { Navigate } from "react-router-dom";

// Standardize route protection to prevent layouts from mounting for wrong roles
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // Redirect cleanly to their proper home if they try to access another role's routes
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "collector") return <Navigate to="/collector/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-centers" element={<ManageCenters />} />
          <Route path="smart-bins" element={<SmartBins />} />
          <Route path="routes" element={<AdminRoutesPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="heatmap" element={<Heatmap />} />
          <Route path="alerts" element={<AdminAlerts />} />
        </Route>

        {/* User routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRole="user">
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="smart-bins" element={<UserSmartBins />} />
          <Route path="map" element={<MapPage />} />
          <Route path="ai-detection" element={<AIDetection />} />
          <Route path="pickup" element={<Pickup />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="alerts" element={<UserAlerts />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="profile" element={<Profile />} />
          <Route path="impact" element={<ImpactReport />} />
        </Route>

        {/* Collector routes */}
        <Route path="/collector" element={
          <ProtectedRoute allowedRole="collector">
            <CollectorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<CollectorDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
