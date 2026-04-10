import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage, FiUsers, FiTag, FiUpload,
  FiMessageSquare, FiStar, FiPlus,
  FiDownload, FiEye, FiCheck, FiX,
  FiClock, FiShoppingCart, FiCreditCard,
  FiShield, FiEdit2, FiTrash2, FiSave,
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import API from "../api/axios";
import {
  fetchInquiries, updateInquiryStatus, deleteInquiry,
} from "../api/products";

import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"
];

const PARTICLE_COUNT = 30;

const StatCard = ({ icon: Icon, label, value, color, sub, to }) => {
  const content = (
    <div className="rounded-xl p-6 transition-all shadow-sm border relative overflow-hidden group"
         style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}
         onMouseEnter={e => {e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
         onMouseLeave={e => {e.currentTarget.style.transform="none"; e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full translate-x-8 -translate-y-8 opacity-10 transition-transform group-hover:scale-150"
           style={{ background: color.includes("bg-") ? color.split("-")[1] : color }} />
           
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-xl`} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid rgba(255,255,255,0.1)` }}>
          <Icon className="text-xl" style={{ color: color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-right" style={{ color:"rgba(255,255,255,0.4)" }}>
          {label}
        </span>
      </div>
      <p className="font-bold text-3xl text-white relative z-10">
        {value}
      </p>
      {sub && <p className="text-xs font-medium mt-1 relative z-10" style={{ color:"rgba(255,255,255,0.4)" }}>{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

// ── All available permissions in the system ──
const ALL_PERMISSIONS = [
  "view_products",
  "add_products",
  "edit_products",
  "delete_products",
  "manage_categories",
  "manage_orders",
  "view_orders",
  "manage_users",
  "manage_inquiries",
  "view_inquiries",
  "manage_settings",
  "export_data",
  "bulk_upload",
  "view_dashboard",
  "manage_roles",
];

// ── Default permissions that ship with core roles ──
const DEFAULT_PERMISSIONS = {
  admin:   ALL_PERMISSIONS,
  manager: [
    "view_products", "add_products", "edit_products",
    "manage_categories", "view_orders", "manage_orders",
    "view_inquiries", "manage_inquiries", "export_data",
    "bulk_upload", "view_dashboard",
  ],
  user: ["view_products", "view_orders", "view_inquiries"],
};

const RolePermissionTable = ({ roles, setRoles }) => {
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editPerms, setEditPerms]         = useState([]);
  const [saving, setSaving]               = useState(false);
  const [addPerm, setAddPerm]             = useState("");
  const [showCreate, setShowCreate]       = useState(false);

  const startEditing = (role) => {
    setEditingRoleId(role._id);
    setEditPerms([...(role.permissions || [])]);
    setAddPerm("");
  };

  const cancelEditing = () => {
    setEditingRoleId(null);
    setEditPerms([]);
    setAddPerm("");
  };

  const togglePerm = (perm) => {
    setEditPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleAddPerm = (perm) => {
    if (perm && !editPerms.includes(perm)) {
      setEditPerms((prev) => [...prev, perm]);
    }
    setAddPerm("");
  };

  const savePermissions = async (roleId) => {
    try {
      setSaving(true);
      await API.put(`/settings/roles/${roleId}`, { permissions: editPerms });
      setRoles((prev) =>
        prev.map((r) =>
          r._id === roleId ? { ...r, permissions: [...editPerms] } : r
        )
      );
      toast.success("Permissions updated ✅");
      cancelEditing();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.displayName}"?`)) return;
    try {
      await API.delete(`/settings/roles/${role._id}`);
      setRoles((prev) => prev.filter((r) => r._id !== role._id));
      toast.success("Role deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    const name = e.target.roleName.value.trim();
    const displayName = e.target.displayName.value.trim();
    if (!name || !displayName) return;
    try {
      const { data } = await API.post("/settings/roles", {
        name,
        displayName,
        permissions: ["view_products"],
      });
      setRoles((prev) => [...prev, data]);
      toast.success("Role created ✅");
      e.target.reset();
      setShowCreate(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isCore = (name) => ["admin", "manager", "user"].includes(name);

  return (
    <div className="rounded-xl shadow-sm p-6 mb-8 mt-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FiShield className="text-xl" style={{ color:"#a855f7" }} />
          <h3 className="font-bold text-xl text-white">
            Role & Permission Management
          </h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wider transition-colors border"
          style={{
            background: showCreate ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
            borderColor: showCreate ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)",
            color: showCreate ? "#f87171" : "#60a5fa"
          }}
          onMouseEnter={e => e.currentTarget.style.background=showCreate?"rgba(239,68,68,0.2)":"rgba(59,130,246,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background=showCreate?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)"}
        >
          <FiPlus size={14} />
          {showCreate ? "CANCEL" : "ADD NEW ROLE"}
        </button>
      </div>

      {/* Create Role Form */}
      {showCreate && (
        <form
          onSubmit={createRole}
          className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-xl border"
          style={{ background:"rgba(168,85,247,0.05)", borderColor:"rgba(168,85,247,0.2)" }}
        >
          <input
            name="roleName"
            placeholder="Role ID (e.g. staff)"
            className="dark-input flex-1"
            required
          />
          <input
            name="displayName"
            placeholder="Display Name (e.g. Sales Staff)"
            className="dark-input flex-1"
            required
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,#a855f7,#7e22ce)", color:"#fff", boxShadow:"0 4px 15px rgba(168,85,247,0.3)" }}
          >
             <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
            CREATE ROLE
          </button>
        </form>
      )}

      {/* Role Permission Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color:"rgba(255,255,255,0.4)" }}>
                Role
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                Type
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                Permissions
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right whitespace-nowrap" style={{ color:"rgba(255,255,255,0.4)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const isEditing = editingRoleId === role._id;
              const defaults = DEFAULT_PERMISSIONS[role.name] || [];
              const permsToShow = isEditing ? editPerms : (role.permissions || []);
              const availableToAdd = ALL_PERMISSIONS.filter(
                (p) => !permsToShow.includes(p)
              );

              return (
                <tr
                  key={role._id}
                  className="transition-colors border-b"
                  style={{
                    backgroundColor: isEditing ? "rgba(168,85,247,0.05)" : "transparent",
                    borderColor:"rgba(255,255,255,0.03)"
                  }}
                  onMouseEnter={e => {if(!isEditing) e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"}}
                  onMouseLeave={e => {if(!isEditing) e.currentTarget.style.backgroundColor="transparent"}}
                >
                  {/* Role Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm"
                        style={{
                          background: role.name === "admin"
                            ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                            : role.name === "manager"
                              ? "linear-gradient(135deg, #f59e0b, #b45309)"
                              : role.name === "user"
                                ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                                : "linear-gradient(135deg, #8b5cf6, #5b21b6)"
                        }}
                      >
                        {role.displayName?.charAt(0)?.toUpperCase() || "R"}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm tracking-wide">
                          {role.displayName}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                          {role.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={
                        isCore(role.name)
                          ? { background:"rgba(59,130,246,0.15)", color:"#60a5fa", borderColor:"rgba(59,130,246,0.3)" }
                          : { background:"rgba(168,85,247,0.15)", color:"#c084fc", borderColor:"rgba(168,85,247,0.3)" }
                      }
                    >
                      {isCore(role.name) ? "System" : "Custom"}
                    </span>
                  </td>

                  {/* Permissions */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xl">
                      {permsToShow.map((perm) => {
                        const isDefault = defaults.includes(perm);
                        return (
                          <span
                            key={perm}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${isEditing ? "cursor-pointer hover:opacity-70" : ""}`}
                            style={
                              isDefault
                                ? { background:"rgba(16,185,129,0.1)", color:"#34d399", borderColor:"rgba(16,185,129,0.2)" }
                                : { background:"rgba(245,158,11,0.1)", color:"#fbbf24", borderColor:"rgba(245,158,11,0.2)" }
                            }
                            onClick={
                              isEditing ? () => togglePerm(perm) : undefined
                            }
                            title={
                              isEditing
                                ? "Click to remove"
                                : isDefault
                                  ? "Default permission"
                                  : "Manually added"
                            }
                          >
                            {perm.replace(/_/g, " ")}
                            {isEditing && (
                              <FiX size={10} style={{ color:"#fca5a5", marginLeft:"4px" }} />
                            )}
                          </span>
                        );
                      })}

                      {/* Add Permission Dropdown (only in edit mode) */}
                      {isEditing && availableToAdd.length > 0 && (
                        <select
                          value={addPerm}
                          onChange={(e) => handleAddPerm(e.target.value)}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-dashed cursor-pointer outline-none appearance-none"
                          style={{ background:"rgba(255,255,255,0.05)", color:"#e2e8f0", borderColor:"rgba(255,255,255,0.2)" }}
                        >
                          <option value="" style={{ background:"#1e293b", color:"#e2e8f0" }}>+ ADD PERM</option>
                          {availableToAdd.map((p) => (
                            <option key={p} value={p} style={{ background:"#1e293b", color:"#e2e8f0" }}>
                              {p.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      )}

                      {permsToShow.length === 0 && (
                        <span className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.3)" }}>
                          No permissions
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => savePermissions(role._id)}
                            disabled={saving}
                            className="p-2 rounded-lg transition-colors border disabled:opacity-50"
                            style={{ background:"rgba(16,185,129,0.1)", color:"#34d399", borderColor:"rgba(16,185,129,0.3)" }}
                            onMouseEnter={e => {if(!saving) e.currentTarget.style.background="rgba(16,185,129,0.2)"}}
                            onMouseLeave={e => {if(!saving) e.currentTarget.style.background="rgba(16,185,129,0.1)"}}
                            title="Save Permissions"
                          >
                            <FiSave size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 rounded-lg transition-colors border"
                            style={{ background:"rgba(255,255,255,0.05)", color:"#cbd5e1", borderColor:"rgba(255,255,255,0.1)" }}
                            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                            title="Cancel"
                          >
                            <FiX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(role)}
                            className="p-2 rounded-lg transition-colors border"
                            style={{ color:"#fbbf24", borderColor:"transparent" }}
                            onMouseEnter={e => {e.currentTarget.style.background="rgba(245,158,11,0.1)"; e.currentTarget.style.borderColor="rgba(245,158,11,0.2)";}}
                            onMouseLeave={e => {e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent";}}
                            title="Edit Permissions"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          {!isCore(role.name) && (
                            <button
                              onClick={() => deleteRole(role)}
                              className="p-2 rounded-lg transition-colors border"
                              style={{ color:"#f87171", borderColor:"transparent" }}
                              onMouseEnter={e => {e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.2)";}}
                              onMouseLeave={e => {e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent";}}
                              title="Delete Role"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {roles.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center font-medium" style={{ color:"rgba(255,255,255,0.3)" }}>
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)" }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>Default Permission</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)" }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>Manually Added</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 rounded text-[9px] font-bold uppercase tracking-wider border" style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", borderColor:"rgba(59,130,246,0.3)" }}>System</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>Core roles (cannot delete)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 rounded text-[9px] font-bold uppercase tracking-wider border" style={{ background:"rgba(168,85,247,0.15)", color:"#c084fc", borderColor:"rgba(168,85,247,0.3)" }}>Custom</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>User-created roles</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user }                      = useAuth();
  const [products,   setProducts]     = useState([]);
  const [users,      setUsers]        = useState([]);
  const [inquiries,  setInquiries]    = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [stats,        setStats]        = useState({});

  const [roles,        setRoles]        = useState([]);
  const [orderStats,    setOrderStats]    = useState(null);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [categoryData,  setCategoryData]  = useState([]);
  const [currencyData,  setCurrencyData]  = useState([]);
  const [stockData,     setStockData]     = useState([]);
  const [priceRangeData, setPriceRangeData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, userRes, inqRes, catRes, orderRes, rolesRes] = await Promise.all([
          API.get("/products?limit=1000"),
          API.get("/auth/users"),
          fetchInquiries({ limit: 5 }),
          API.get("/categories"),
          API.get("/orders/admin/stats"),
          API.get("/settings/roles"),
        ]);

        const prods = prodRes.data.products;
        const usrs  = userRes.data;
        const inqs  = inqRes.data.inquiries;
        const cats  = catRes.data;

        setProducts(prods.slice(0, 6));
        setUsers(usrs);
        setInquiries(inqs);
        setCategories(cats);
        setOrderStats(orderRes.data);
        setRecentOrders(orderRes.data.recentOrders || []);

        setRoles(rolesRes.data);

        // ── Stats Calculation ──
        const bulk     = prods.filter((p) => p.isBulkUploaded).length;
        const featured = prods.filter((p) => p.isFeatured).length;
        setStats({
          total:      prods.length,
          bulk,
          manual:     prods.length - bulk,
          featured,
          users:      usrs.length,
          categories: cats.length,
          inquiries:  inqRes.data.total,
        });

        // ── Charts Logic ──
        const catMap = {};
        prods.forEach((p) => {
          catMap[p.category] = (catMap[p.category] || 0) + 1;
        });
        setCategoryData(
          Object.entries(catMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
        );

        const curMap = {};
        prods.forEach((p) => {
          curMap[p.currency] = (curMap[p.currency] || 0) + 1;
        });
        setCurrencyData(Object.entries(curMap).map(([name, value]) => ({ name, value })));



        // ── Stock Status Distribution ──
        const stockMap = { in_stock: 0, limited: 0, out_of_stock: 0 };
        prods.forEach((p) => {
          stockMap[p.stockStatus] = (stockMap[p.stockStatus] || 0) + 1;
        });
        setStockData([
          { name: "In Stock",     value: stockMap.in_stock,     color: "#10b981" },
          { name: "Limited",      value: stockMap.limited,      color: "#f59e0b" },
          { name: "Out of Stock", value: stockMap.out_of_stock,  color: "#ef4444" },
        ].filter((d) => d.value > 0));

        // ── Price Range Distribution ──
        const ranges = [
          { label: "₹0 – ₹500",      min: 0,     max: 500 },
          { label: "₹500 – ₹2K",     min: 500,   max: 2000 },
          { label: "₹2K – ₹10K",     min: 2000,  max: 10000 },
          { label: "₹10K – ₹50K",    min: 10000, max: 50000 },
          { label: "₹50K+",          min: 50000, max: Infinity },
        ];
        const RATE_MAP = { INR: 1, USD: 83, EUR: 90, GBP: 105, AED: 22.6, CNY: 11.5, JPY: 0.55 };
        const priceRanges = ranges.map((r) => ({
          range: r.label,
          count: prods.filter((p) => {
            const inr = Math.round(p.price * (RATE_MAP[p.currency] || 83));
            return inr >= r.min && inr < r.max;
          }).length,
        }));
        setPriceRangeData(priceRanges);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInquiryStatus = async (id, status) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries((prev) =>
        prev.map((i) => i._id === id ? { ...i, status } : i)
      );
      toast.success("Inquiry updated ✅");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      await deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      toast.success("Inquiry deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 min-h-screen" style={{ background:"#0a1628" }}>
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-trade-navy animate-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes dotRise {
          0%        { opacity:0; transform:translateY(0); }
          20%       { opacity:0.6; }
          80%       { opacity:0.3; }
          100%      { opacity:0; transform:translateY(-80px); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(32px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes btnShimmer {
          0%,100% { transform:translateX(-100%); }
          60%     { transform:translateX(100%); }
        }
        /* Custom scrollbar for dark tables */
        .dark-table-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .dark-table-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .dark-table-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .dark-table-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated Orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#10b981", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position:"absolute", width:"4px", height:"4px", borderRadius:"50%", background:"#3b82f6", opacity:0,
              left:`${Math.random()*100}%`, bottom:`${Math.random()*50}%`,
              animation:`dotRise ${5+Math.random()*5}s ease-in-out infinite`, animationDelay:`${Math.random()*8}s`
            }} />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-bold text-3xl text-white tracking-tight" style={{ fontFamily:"Poppins,sans-serif" }}>
                Dashboard
              </h1>
              <p className="mt-1 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>
                Welcome back,{" "}
                <span className="font-bold tracking-wide" style={{ color:"#60a5fa" }}>
                  {user?.name}
                </span> 👋
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/add-product"
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden"
                style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}>
                <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                <FiPlus size={16} />
                ADD PRODUCT
              </Link>
             <Link to="/users"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-colors border"
                style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)", color:"#fff" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                <FiUsers size={16} />
                MANAGE USERS
             </Link>

              <a href="/api/products/export/csv"
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border"
                style={{ background:"linear-gradient(135deg,#f59e0b,#b45309)", borderColor:"rgba(245,158,11,0.5)", boxShadow:"0 4px 15px rgba(245,158,11,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >
                <FiDownload size={16} />
                EXPORT CSV
              </a>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FiPackage}      label="Total Products"
              value={stats.total}      color="#3b82f6"
              sub={`${stats.manual} manual`} to="/" />
            <StatCard icon={FiStar}         label="Featured"
              value={stats.featured}   color="#f59e0b"
              sub="Featured products" />
            <StatCard icon={FiUsers}        label="Total Users"
              value={stats.users}      color="#10b981"
              sub="Registered users"   to="/users" />
            <StatCard icon={FiShoppingCart} label="Total Orders"
              value={orderStats?.total || 0} color="#8b5cf6"
              sub={`${orderStats?.paid || 0} paid`} to="/admin/orders" />
            <StatCard icon={FiCreditCard}   label="Total Revenue"
              value={`₹${(orderStats?.revenue || 0).toLocaleString()}`}
              color="#ef4444"      sub="Paid revenue" />
            <StatCard icon={FiMessageSquare} label="Inquiries"
              value={stats.inquiries}  color="#aebc45"
              sub="Total inquiries" />
            <StatCard icon={FiTag}          label="Categories"
              value={stats.categories} color="#ec4899"
              sub="Product categories" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Bar Chart */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider">
                Products by Category
              </h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill:"rgba(255,255,255,0.5)" }}
                      angle={-20} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill:"rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{
                      background: "rgba(10,22,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff",
                      borderRadius: "8px", fontSize: "13px",
                    }} />
                    <Bar dataKey="count" fill="url(#colorProducts)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center font-bold tracking-wider uppercase text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>
                  No data yet
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider">
                Currency Distribution
              </h3>
              {currencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={currencyData} cx="50%" cy="50%"
                      outerRadius={90} innerRadius={60} paddingAngle={4} dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke:"rgba(255,255,255,0.2)" }}
                    >
                      {currencyData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{
                      background: "rgba(10,22,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff",
                      borderRadius: "8px", fontSize: "13px",
                    }} />
                    <Legend wrapperStyle={{ color:"rgba(255,255,255,0.7)", fontSize:"12px", paddingTop:"10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center font-bold tracking-wider uppercase text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="rounded-xl shadow-sm p-6 mb-8 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-lg">
                Recent Orders
              </h3>
              <Link to="/admin/orders"
                className="text-sm font-bold tracking-wider hover:underline transition-colors uppercase"
                style={{ color:"#60a5fa" }}>
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto dark-table-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="uppercase tracking-wider font-bold" style={{ color:"rgba(255,255,255,0.4)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                    <th className="pb-3 px-2">Order</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Product</th>
                    <th className="pb-3 px-2 text-right">Amount</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="transition-colors border-b" style={{ borderColor:"rgba(255,255,255,0.03)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                      <td className="py-4 px-2 font-bold tracking-wide" style={{ color:"#93c5fd" }}>#{order.orderNumber}</td>
                      <td className="py-4 px-2">
                        <p className="font-bold tracking-wide text-white">{order.user?.name}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>{order.user?.email}</p>
                      </td>
                      <td className="py-4 px-2 max-w-[200px] truncate font-medium" style={{ color:"rgba(255,255,255,0.8)" }}>
                        {order.items[0]?.productName}
                      </td>
                      <td className="py-4 px-2 text-right font-bold tracking-wide" style={{ color:"#34d399" }}>
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
                              style={
                                order.paymentStatus === "paid"
                                  ? { background:"rgba(16,185,129,0.1)", color:"#34d399", borderColor:"rgba(16,185,129,0.3)" }
                                  : { background:"rgba(245,158,11,0.1)", color:"#fbbf24", borderColor:"rgba(245,158,11,0.3)" }
                              }>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center font-bold uppercase tracking-wider text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Charts Row — Stock Status + Price Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Stock Status Donut */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider">
                Stock Status Overview
              </h3>
              {stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stockData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke:"rgba(255,255,255,0.2)" }}
                    >
                      {stockData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "rgba(10,22,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", borderRadius: "10px", fontSize: "13px" }}
                      formatter={(value) => [`${value} products`]}
                    />
                    <Legend wrapperStyle={{ color:"rgba(255,255,255,0.7)", fontSize:"12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center font-bold uppercase tracking-wider text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>
                  No data yet
                </div>
              )}
            </div>

            {/* Price Range Distribution */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider">
                Price Range Distribution
              </h3>
              {priceRangeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priceRangeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill:"rgba(255,255,255,0.5)" }}
                      allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="range"
                      tick={{ fontSize: 11, fill:"rgba(255,255,255,0.7)" }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(10,22,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", borderRadius: "10px", fontSize: "13px" }}
                      formatter={(value) => [`${value} products`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {priceRangeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center font-bold tracking-wider text-sm uppercase" style={{ color:"rgba(255,255,255,0.3)" }}>
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Products + Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Recent Products */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-lg">
                  Recent Products
                </h3>
                <Link to="/"
                  className="text-sm font-bold tracking-wider hover:underline transition-colors uppercase"
                  style={{ color:"#60a5fa" }}>
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors border"
                    style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background:"rgba(255,255,255,0.05)" }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/48x48/1e293b/475569?text=No+Img";
                          }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-xl" style={{ color:"rgba(255,255,255,0.3)" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate tracking-wide">
                        {p.name}
                        {p.isFeatured && (
                          <FiStar className="inline ml-1 text-xs" style={{ color:"#f59e0b" }} />
                        )}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{p.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold tracking-wide" style={{ color:"#34d399" }}>
                        {p.price} {p.currency}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                        {p.views} views
                      </p>
                    </div>
                  </Link>
                ))}
                {products.length === 0 && (
                  <p className="text-center py-6 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>
                    No products yet
                  </p>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-lg">
                  Recent Inquiries
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
                      style={{ background:"rgba(245,158,11,0.1)", color:"#fbbf24", borderColor:"rgba(245,158,11,0.3)" }}>
                  {stats.inquiries} total
                </span>
              </div>
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div key={inq._id}
                    className="p-4 rounded-xl transition-colors border"
                    style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-white text-sm tracking-wide">
                          {inq.name}
                        </p>
                        <p className="text-[10px] font-bold tracking-wider mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{inq.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                            style={
                              inq.status === "new"
                                ? { background:"rgba(59,130,246,0.15)", color:"#60a5fa", borderColor:"rgba(59,130,246,0.3)" }
                                : inq.status === "read"
                                  ? { background:"rgba(255,255,255,0.1)", color:"#cbd5e1", borderColor:"rgba(255,255,255,0.2)" }
                                  : inq.status === "replied"
                                    ? { background:"rgba(16,185,129,0.1)", color:"#34d399", borderColor:"rgba(16,185,129,0.3)" }
                                    : { background:"rgba(239,68,68,0.15)", color:"#f87171", borderColor:"rgba(239,68,68,0.3)" }
                            }>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-[11px] uppercase font-bold tracking-wider truncate mb-2" style={{ color:"#fbbf24" }}>
                      📦 {inq.productName}
                    </p>
                    <p className="text-xs font-medium line-clamp-1" style={{ color:"rgba(255,255,255,0.6)" }}>
                      {inq.message}
                    </p>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                        <FiClock size={10} />
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {inq.status === "new" && (
                          <button
                            onClick={() => handleInquiryStatus(inq._id, "read")}
                            className="p-1.5 rounded-lg transition-colors border"
                            style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", borderColor:"rgba(59,130,246,0.2)" }}
                            onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.background="rgba(59,130,246,0.1)"}
                            title="Mark as Read"
                          >
                            <FiCheck size={12} />
                          </button>
                        )}
                        {inq.status === "read" && (
                          <button
                            onClick={() => handleInquiryStatus(inq._id, "replied")}
                            className="p-1.5 rounded-lg transition-colors border"
                            style={{ background:"rgba(16,185,129,0.1)", color:"#34d399", borderColor:"rgba(16,185,129,0.2)" }}
                            onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.background="rgba(16,185,129,0.1)"}
                            title="Mark as Replied"
                          >
                            <FiCheck size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(inq._id)}
                          className="p-1.5 rounded-lg transition-colors border"
                          style={{ background:"rgba(239,68,68,0.1)", color:"#f87171", borderColor:"rgba(239,68,68,0.2)" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.2)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
                          title="Delete"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-center py-6 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.3)" }}>
                    No inquiries yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="rounded-xl shadow-sm p-6 border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-lg">
                Categories Overview
              </h3>
              <Link to="/categories"
                className="text-sm font-bold tracking-wider hover:underline transition-colors uppercase"
                style={{ color:"#60a5fa" }}>
                Manage →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((cat) => (
                <div key={cat._id}
                  className="text-center p-4 rounded-xl transition-all border"
                  style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => {e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                  onMouseLeave={e => {e.currentTarget.style.transform="none"; e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                  <p className="text-3xl mb-2 drop-shadow-md">{cat.icon}</p>
                  <p className="text-xs font-bold text-white tracking-wide truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                    {cat.productCount} products
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* ── Role & Permission Management ── */}
          <RolePermissionTable roles={roles} setRoles={setRoles} />
          
        </div>
      </div>
    </>
  );
};

export default Dashboard;