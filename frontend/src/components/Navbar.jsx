import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu, FiX, FiPackage, FiUser,
  FiLogOut, FiChevronDown, FiGrid,
  FiShoppingBag, FiUsers, FiTag,
  FiBarChart2, FiPlusCircle, FiUpload,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RoleBadge = ({ role }) => {
  const styles = {
    admin:   "bg-red-500/20 text-red-300 border border-red-500/20",
    manager: "bg-blue-400/20 text-blue-300 border border-blue-400/20",
    user:    "bg-gray-500/20 text-gray-300 border border-gray-500/20",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize tracking-wide ${styles[role] || styles.user}`}>
      {role}
    </span>
  );
};

const ADMIN_ITEMS = [
  { path: "/dashboard",    label: "Dashboard",  Icon: FiBarChart2   },
  { path: "/admin/orders", label: "Orders",     Icon: FiShoppingBag },
  { path: "/users",        label: "Users",      Icon: FiUsers       },
  { path: "/categories",   label: "Categories", Icon: FiTag         },
];

const Navbar = () => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const dropRef   = useRef(null);
  const { user, logout, isAdmin, canEdit } = useAuth();

  const isActive = (path) => location.pathname === path;

  // close dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setAdminOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close on route change
  useEffect(() => { setIsOpen(false); setAdminOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <style>{`
        @keyframes navIn    { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes dropIn   { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mobileIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%,100%{transform:translateX(-100%)} 60%{transform:translateX(100%)} }
        .btn-shimmer { position:relative; overflow:hidden; }
        .btn-shimmer::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%);
          animation:shimmer 3.5s ease-in-out infinite;
        }
        .nav-link-underline { position:relative; }
        .nav-link-underline::after {
          content:''; position:absolute; bottom:4px; left:16px; right:16px; height:2px;
          border-radius:2px; background:rgba(245,158,11,0.6);
          transform:scaleX(0); transform-origin:left; transition:transform 0.2s ease;
        }
        .nav-link-underline:hover::after { transform:scaleX(1); }
      `}</style>

      <nav
        style={{
          background: "linear-gradient(135deg,#0f2540 0%,#1a3c5e 60%,#0f2540 100%)",
          animation: "navIn 0.45s cubic-bezier(0.22,1,0.36,1) both",
          boxShadow: scrolled
            ? "0 4px 30px rgba(0,0,0,0.4),0 1px 0 rgba(245,158,11,0.2)"
            : "0 1px 0 rgba(255,255,255,0.06)",
          transition: "box-shadow 0.3s",
        }}
        className="sticky top-0 z-50"
      >
        {/* Gold top accent line */}
        <div style={{ height: 2, background: "linear-gradient(to right,transparent,#f59e0b,#d97706,transparent)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="btn-shimmer p-2 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  boxShadow: "0 0 16px rgba(245,158,11,0.4)",
                  transition: "box-shadow 0.3s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 26px rgba(245,158,11,0.65)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(245,158,11,0.4)"}
              >
                <FiPackage className="text-white text-xl" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none font-display">
                  Trade<span style={{ color: "#f59e0b" }}>Catalog</span>
                </span>
                <p className="text-blue-300/60 text-[10px] leading-none mt-0.5 tracking-widest uppercase">
                  Import · Export
                </p>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5">

              {/* Products */}
              <Link
                to="/products"
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-underline
                  ${isActive("/products") ? "text-white" : "text-blue-200 hover:text-white"}`}
                style={isActive("/products") ? {
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                } : {}}
              >
                Products
              </Link>

              {user && (
                <Link
                  to="/my-orders"
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-underline
                    ${isActive("/my-orders") ? "text-white" : "text-blue-200 hover:text-white"}`}
                  style={isActive("/my-orders") ? {
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                  } : {}}
                >
                  My Orders
                </Link>
              )}

              {canEdit && (
                <>
                  <Link
                    to="/add-product"
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-underline
                      ${isActive("/add-product") ? "text-white" : "text-blue-200 hover:text-white"}`}
                    style={isActive("/add-product") ? {
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                    } : {}}
                  >
                    Add Product
                  </Link>
                  <Link
                    to="/bulk-upload"
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-underline
                      ${isActive("/bulk-upload") ? "text-white" : "text-blue-200 hover:text-white"}`}
                    style={isActive("/bulk-upload") ? {
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                    } : {}}
                  >
                    Bulk Upload
                  </Link>
                </>
              )}

              {/* Admin Dropdown */}
              {isAdmin && (
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${ADMIN_ITEMS.some(i => isActive(i.path)) ? "text-white" : "text-blue-200 hover:text-white"}`}
                    style={ADMIN_ITEMS.some(i => isActive(i.path)) ? {
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                    } : {}}
                  >
                    <FiGrid size={13} />
                    Admin
                    <FiChevronDown
                      size={13}
                      style={{
                        transition: "transform 0.2s",
                        transform: adminOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {adminOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 w-52 overflow-hidden"
                      style={{
                        background: "linear-gradient(145deg,#0d2137,#1a3c5e)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 14,
                        boxShadow: "0 20px 50px rgba(0,0,0,0.5),0 0 0 1px rgba(245,158,11,0.1)",
                        animation: "dropIn 0.2s cubic-bezier(0.22,1,0.36,1) both",
                      }}
                    >
                      <div style={{ height: 1, background: "linear-gradient(to right,transparent,rgba(245,158,11,0.5),transparent)" }} />
                      <div className="p-1.5">
                        {ADMIN_ITEMS.map(({ path, label, Icon }) => (
                          <Link
                            key={path}
                            to={path}
                            onClick={() => setAdminOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                            style={isActive(path)
                              ? { color: "#fff", fontWeight: 600, background: "rgba(245,158,11,0.18)", boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.25)" }
                              : { color: "rgba(147,197,253,0.85)" }
                            }
                            onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.background = "transparent"; }}
                          >
                            <Icon size={14} style={{ color: isActive(path) ? "#f59e0b" : "inherit" }} />
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2" style={{ animation: "fadeIn 0.4s ease both" }}>
              {user ? (
                <>
                  <div
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
                    >
                      <FiUser className="text-white" size={13} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-none mb-0.5">
                        {user.name.split(" ")[0]}
                      </p>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "rgba(252,165,165,0.9)", border: "1px solid rgba(239,68,68,0.15)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200"
                    style={{ color: "rgba(147,197,253,0.9)" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "rgba(147,197,253,0.9)"}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-shimmer px-4 py-2 text-white rounded-xl text-sm font-semibold font-display"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                      transition: "transform 0.15s,box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(245,158,11,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.35)"; }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl transition-all duration-200"
              style={{
                color: "#fff",
                background: isOpen ? "rgba(255,255,255,0.1)" : "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ transition: "transform 0.3s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2 space-y-1"
            style={{
              background: "linear-gradient(180deg,#0d2137,#112a47)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              animation: "mobileIn 0.25s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {[
              { to: "/products",   label: "Products",    Icon: FiPackage,    show: true      },
              { to: "/my-orders",  label: "My Orders",   Icon: FiShoppingBag,show: !!user    },
              { to: "/add-product",label: "Add Product", Icon: FiPlusCircle, show: !!canEdit },
              { to: "/bulk-upload",label: "Bulk Upload", Icon: FiUpload,     show: !!canEdit },
            ].filter(i => i.show).map(({ to, label, Icon }) => (
              <Link
                key={to} to={to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={isActive(to)
                  ? { color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)" }
                  : { color: "rgba(147,197,253,0.85)" }
                }
              >
                <Icon size={15} /> {label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] text-blue-400/50 px-4 mb-1.5 font-bold uppercase tracking-widest">Admin</p>
                </div>
                {ADMIN_ITEMS.map(({ path, label, Icon }) => (
                  <Link
                    key={path} to={path}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={isActive(path)
                      ? { color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)" }
                      : { color: "rgba(147,197,253,0.85)" }
                    }
                  >
                    <Icon size={15} /> {label}
                  </Link>
                ))}
              </>
            )}

            <div className="pt-3 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                      <FiUser size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{user.name}</p>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: "rgba(252,165,165,0.9)" }}
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-center" style={{ color: "rgba(147,197,253,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;