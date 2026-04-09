import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth }        from "./context/AuthContext";
import Navbar             from "./components/Navbar";
import Footer             from "./components/Footer";
import ProductList        from "./pages/ProductList";
import ProductDetail      from "./pages/ProductDetail";
import AddProduct         from "./pages/AddProduct";
import BulkUpload         from "./pages/BulkUpload";
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import ForgotPassword     from "./pages/ForgotPassword";
import ResetPassword      from "./pages/ResetPassword";
import Dashboard          from "./pages/Dashboard";
import UserManagement     from "./pages/UserManagement";
import CategoryManagement from "./pages/CategoryManagement";
import Spinner            from "./components/Spinner";

/* ✅ ADDED IMPORTS */
import Checkout      from "./pages/Checkout";
import OrderSuccess  from "./pages/OrderSuccess";
import MyOrders      from "./pages/MyOrders";
import AdminOrders  from "./pages/AdminOrders";

// ── Protected Route ──
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Spinner text="Loading..." />;
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// ── Editor Route (Admin + Manager) ──
const EditorRoute = ({ children }) => {
  const { user, loading, canEdit } = useAuth();
  if (loading)  return <Spinner text="Loading..." />;
  if (!user)    return <Navigate to="/login"  replace />;
  if (!canEdit) return <Navigate to="/"       replace />;
  return children;
};

function App() {
  const { loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token) {
      navigate(`/reset-password/${token}`, { replace: true });
    }
  }, [navigate]);

  if (loading) return <Spinner text="Loading..." />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Editor (Admin + Manager) ── */}
          <Route path="/add-product" element={
            <EditorRoute><AddProduct /></EditorRoute>
          } />
          <Route path="/bulk-upload" element={
            <EditorRoute><BulkUpload /></EditorRoute>
          } />

          {/* ── Admin Only ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute adminOnly>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />

          {/* ✅ ADDED ROUTES */}
          <Route path="/checkout/:productId" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/order-success/:orderId" element={
            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute><MyOrders /></ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;