import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu, FiX, FiPackage, FiUser,
  FiLogOut, FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RoleBadge = ({ role }) => {
  const styles = {
    admin:   "bg-red-500/20 text-red-300",
    manager: "bg-blue-500/20 text-blue-300",
    user:    "bg-gray-500/20 text-gray-300",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      capitalize ${styles[role]}`}>
      {role}
    </span>
  );
};

const Navbar = () => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [adminOpen,  setAdminOpen]  = useState(false);
  const location                    = useLocation();
  const navigate                    = useNavigate();
  const { user, logout, isAdmin, canEdit } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
    setAdminOpen(false);
  };

  return (
    <nav className="bg-trade-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-trade-gold p-1.5 rounded-lg">
              <FiPackage className="text-white text-xl" />
            </div>
            <div>
              <span className="text-white font-display font-bold
                               text-lg leading-none">
                Trade<span className="text-trade-gold">Catalog</span>
              </span>
              <p className="text-blue-300 text-xs leading-none mt-0.5">
                Import · Export
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium
                          transition-all ${
                isActive("/")
                  ? "bg-trade-gold text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}>
              Products
            </Link>

            {/* ✅ ADDED: My Orders */}
            {user && (
              <Link to="/my-orders"
                className={`px-4 py-2 rounded-lg text-sm font-medium
                            transition-all ${
                  isActive("/my-orders")
                    ? "bg-trade-gold text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}>
                My Orders
              </Link>
            )}

            {canEdit && (
              <>
                <Link to="/add-product"
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                              transition-all ${
                    isActive("/add-product")
                      ? "bg-trade-gold text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}>
                  Add Product
                </Link>
                <Link to="/bulk-upload"
                  className={`px-4 py-2 rounded-lg text-sm font-medium
                              transition-all ${
                    isActive("/bulk-upload")
                      ? "bg-trade-gold text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}>
                  Bulk Upload
                </Link>
              </>
            )}

            {/* Admin Dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className={`flex items-center gap-1 px-4 py-2
                              rounded-lg text-sm font-medium transition-all ${
                    ["/dashboard","/users","/categories"].includes(
                      location.pathname
                    )
                      ? "bg-trade-gold text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  Admin
                  <FiChevronDown size={14} className={`transition-transform
                    ${adminOpen ? "rotate-180" : ""}`} />
                </button>

                {adminOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48
                                  bg-white rounded-xl shadow-lg border
                                  border-gray-100 overflow-hidden z-50">
                    {[
                      { path: "/dashboard",   label: "📊 Dashboard"  },
                      { path: "/admin/orders", label: "📦 Orders"     },
                      { path: "/users",       label: "👥 Users"      },
                      { path: "/categories",  label: "🏷️ Categories" },
                    ].map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setAdminOpen(false)}
                        className={`block px-4 py-2.5 text-sm
                                    transition-colors ${
                          isActive(item.path)
                            ? "bg-trade-light text-trade-navy font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-blue-800
                                px-3 py-1.5 rounded-lg">
                  <div className="bg-trade-gold p-1 rounded-full">
                    <FiUser className="text-white text-xs" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium
                                  leading-none">
                      {user.name.split(" ")[0]}
                    </p>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5
                             rounded-lg text-red-300 hover:bg-red-900/30
                             text-sm transition-colors font-medium"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-blue-200 hover:text-white
                             text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-4 py-2 bg-trade-gold text-white
                             rounded-lg text-sm font-medium
                             hover:bg-amber-600 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg
                       hover:bg-blue-800 transition-colors"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 border-t border-blue-700
                        px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setIsOpen(false)}
            className={`block px-4 py-2.5 rounded-lg text-sm
                        font-medium transition-all ${
              isActive("/")
                ? "bg-trade-gold text-white"
                : "text-blue-200 hover:bg-blue-800 hover:text-white"
            }`}>
            Products
          </Link>

          {canEdit && (
            <>
              <Link to="/add-product" onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm
                            font-medium transition-all ${
                  isActive("/add-product")
                    ? "bg-trade-gold text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}>
                Add Product
              </Link>
              <Link to="/bulk-upload" onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm
                            font-medium transition-all ${
                  isActive("/bulk-upload")
                    ? "bg-trade-gold text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}>
                Bulk Upload
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="border-t border-blue-700 pt-2 mt-2">
                <p className="text-xs text-blue-400 px-4 mb-1 font-medium
                               uppercase tracking-wide">
                  Admin
                </p>
              </div>
              {[
                { path: "/dashboard",  label: "📊 Dashboard"  },
                { path: "/admin/orders", label: "📦 Orders"    },
                { path: "/users",      label: "👥 Users"      },
                { path: "/categories", label: "🏷️ Categories" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm
                              font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-trade-gold text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {/* Mobile Auth */}
          <div className="pt-2 border-t border-blue-700 mt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <FiUser className="text-blue-300" />
                  <div>
                    <p className="text-white text-sm">{user.name}</p>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg
                             text-sm font-medium text-red-300
                             hover:bg-red-900/30 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm
                             font-medium text-blue-200
                             hover:bg-blue-800 hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm
                             font-medium bg-trade-gold text-white mt-1">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;