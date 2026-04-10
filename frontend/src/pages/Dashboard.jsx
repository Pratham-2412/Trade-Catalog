import { useState, useEffect } from "react";
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
  "#1a3c5e","#f59e0b","#3b82f6",
  "#10b981","#ef4444","#8b5cf6","#06b6d4",
];

const StatCard = ({ icon: Icon, label, value, color, sub, to }) => {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-100
                     shadow-sm p-6 hover:shadow-md transition-shadow
                     ${to ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
        <span className="text-xs text-gray-400 font-medium
                         uppercase tracking-wide text-right">
          {label}
        </span>
      </div>
      <p className="font-display font-bold text-3xl text-gray-900">
        {value}
      </p>
      {sub && <p className="text-gray-400 text-sm mt-1">{sub}</p>}
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FiShield className="text-indigo-500 text-xl" />
          <h3 className="font-display font-semibold text-xl text-gray-900">
            Role & Permission Management
          </h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 bg-trade-navy text-white
                     px-4 py-2 rounded-xl text-sm font-medium
                     hover:bg-blue-800 transition-colors"
        >
          <FiPlus size={14} />
          {showCreate ? "Cancel" : "Add New Role"}
        </button>
      </div>

      {/* Create Role Form */}
      {showCreate && (
        <form
          onSubmit={createRole}
          className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-indigo-50
                     rounded-xl border border-indigo-100"
        >
          <input
            name="roleName"
            placeholder="Role ID (e.g. staff)"
            className="input-field flex-1"
            required
          />
          <input
            name="displayName"
            placeholder="Display Name (e.g. Sales Staff)"
            className="input-field flex-1"
            required
          />
          <button
            type="submit"
            className="btn-primary px-6 py-2.5 whitespace-nowrap"
          >
            Create Role
          </button>
        </form>
      )}

      {/* Role Permission Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
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
                  className={`transition-colors ${
                    isEditing
                      ? "bg-indigo-50/40"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  {/* Role Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                          role.name === "admin"
                            ? "bg-rose-500"
                            : role.name === "manager"
                              ? "bg-amber-500"
                              : role.name === "user"
                                ? "bg-blue-500"
                                : "bg-indigo-500"
                        }`}
                      >
                        {role.displayName?.charAt(0)?.toUpperCase() || "R"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {role.displayName}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {role.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span
                      className={`badge text-[10px] font-bold uppercase tracking-wider ${
                        isCore(role.name)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
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
                            className={`inline-flex items-center gap-1 px-2 py-0.5
                                        rounded-md text-[10px] font-semibold
                                        transition-all ${
                              isDefault
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                            } ${isEditing ? "cursor-pointer hover:opacity-70" : ""}`}
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
                              <FiX size={10} className="ml-0.5 text-red-400" />
                            )}
                          </span>
                        );
                      })}

                      {/* Add Permission Dropdown (only in edit mode) */}
                      {isEditing && availableToAdd.length > 0 && (
                        <select
                          value={addPerm}
                          onChange={(e) => handleAddPerm(e.target.value)}
                          className="text-[10px] font-semibold px-2 py-0.5
                                     rounded-md border border-dashed border-indigo-300
                                     bg-indigo-50 text-indigo-600 cursor-pointer
                                     focus:ring-1 focus:ring-indigo-400
                                     focus:outline-none appearance-none"
                        >
                          <option value="">+ Add permission</option>
                          {availableToAdd.map((p) => (
                            <option key={p} value={p}>
                              {p.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      )}

                      {permsToShow.length === 0 && (
                        <span className="text-xs text-gray-300 italic">
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
                            className="p-2 bg-green-100 text-green-700
                                       rounded-lg hover:bg-green-200
                                       transition-colors disabled:opacity-50"
                            title="Save Permissions"
                          >
                            <FiSave size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 bg-gray-100 text-gray-500
                                       rounded-lg hover:bg-gray-200
                                       transition-colors"
                            title="Cancel"
                          >
                            <FiX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(role)}
                            className="p-2 text-gray-400 hover:text-trade-navy
                                       hover:bg-gray-100 rounded-lg
                                       transition-colors"
                            title="Edit Permissions"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          {!isCore(role.name) && (
                            <button
                              onClick={() => deleteRole(role)}
                              className="p-2 text-gray-400 hover:text-red-500
                                         hover:bg-red-50 rounded-lg
                                         transition-colors"
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
                <td colSpan="4" className="py-8 text-center text-gray-300">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-medium">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span className="text-xs text-gray-500">Default Permission</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          <span className="text-xs text-gray-500">Manually Added</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0">System</span>
          <span className="text-xs text-gray-500">Core roles (cannot delete)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0">Custom</span>
          <span className="text-xs text-gray-500">User-created roles</span>
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
  const [timelineData,  setTimelineData]  = useState([]);

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

        const monthMap = {};
        prods.forEach((p) => {
          const m = new Date(p.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
          monthMap[m] = (monthMap[m] || 0) + 1;
        });
        setTimelineData(Object.entries(monthMap).map(([month, count]) => ({ month, count })));

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

  if (loading) return <Spinner text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-trade-navy">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-medium text-trade-navy">
              {user?.name}
            </span> 👋
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/add-product"
            className="flex items-center gap-2 bg-trade-navy text-white
                       px-4 py-2.5 rounded-xl text-sm font-medium
                       hover:bg-blue-800 transition-colors">
            <FiPlus size={16} />
            Add Product
          </Link>
         <Link to="/users"
  className="flex items-center gap-2 border border-gray-200
             text-gray-600 px-4 py-2.5 rounded-xl text-sm
             font-medium hover:border-trade-navy transition-colors">
  <FiUsers size={16} />
  Manage Users
</Link>

  <a href="/api/products/export/csv"
    className="flex items-center gap-2 bg-trade-gold text-white
               px-4 py-2.5 rounded-xl text-sm font-medium
               hover:bg-amber-600 transition-colors"
  >
    <FiDownload size={16} />
    Export CSV
  </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                      gap-4 mb-8">
        <StatCard icon={FiPackage}      label="Total Products"
          value={stats.total}      color="bg-trade-navy"
          sub={`${stats.manual} manual`} to="/" />
        <StatCard icon={FiStar}         label="Featured"
          value={stats.featured}   color="bg-trade-gold"
          sub="Featured products" />
        <StatCard icon={FiUsers}        label="Total Users"
          value={stats.users}      color="bg-blue-500"
          sub="Registered users"   to="/users" />
        <StatCard icon={FiShoppingCart} label="Total Orders"
          value={orderStats?.total || 0} color="bg-indigo-500"
          sub={`${orderStats?.paid || 0} paid orders`} to="/admin/orders" />
        <StatCard icon={FiCreditCard}   label="Total Revenue"
          value={`₹${(orderStats?.revenue || 0).toLocaleString()}`}
          color="bg-rose-500"      sub="Paid revenue" />
        <StatCard icon={FiMessageSquare} label="Inquiries"
          value={stats.inquiries}  color="bg-emerald-500"
          sub="Total inquiries" />
        <StatCard icon={FiTag}          label="Categories"
          value={stats.categories} color="bg-purple-500"
          sub="Product categories" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100
                        shadow-sm p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-6">
            Products by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }}
                  angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{
                  borderRadius: "8px", fontSize: "13px",
                }} />
                <Bar dataKey="count" fill="#1a3c5e"
                  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center
                            text-gray-300">
              No data yet
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-100
                        shadow-sm p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-6">
            Currency Distribution
          </h3>
          {currencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={currencyData} cx="50%" cy="50%"
                  outerRadius={90} dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {currencyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center
                            text-gray-300">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-gray-900">
            Recent Orders
          </h3>
          <Link to="/admin/orders"
            className="text-sm text-trade-navy font-medium
                       hover:text-trade-gold transition-colors">
            View All Orders →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Product</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50">
                  <td className="py-4 font-bold text-trade-navy">#{order.orderNumber}</td>
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="py-4 max-w-[200px] truncate">
                    {order.items[0]?.productName}
                  </td>
                  <td className="py-4 text-right font-bold text-gray-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`badge text-[10px] px-2 py-0.5 ${
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-300">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-6 mb-6">
        <h3 className="font-display font-semibold text-gray-900 mb-6">
          Products Added Over Time
        </h3>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{
                borderRadius: "8px", fontSize: "13px",
              }} />
              <Line type="monotone" dataKey="count"
                stroke="#f59e0b" strokeWidth={2.5}
                dot={{ fill: "#f59e0b", r: 5 }}
                activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center
                          text-gray-300">
            No data yet
          </div>
        )}
      </div>

      {/* Recent Products + Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-gray-100
                        shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">
              Recent Products
            </h3>
            <Link to="/"
              className="text-sm text-trade-navy font-medium
                         hover:text-trade-gold transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {products.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="flex items-center gap-3 p-2 rounded-xl
                           hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden
                                flex-shrink-0 bg-gray-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/48x48";
                      }} />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center">
                      <FiPackage className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm
                                truncate">
                    {p.name}
                    {p.isFeatured && (
                      <FiStar className="inline ml-1 text-trade-gold
                                         text-xs" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-trade-navy">
                    {p.price} {p.currency}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.views} views
                  </p>
                </div>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="text-center text-gray-300 py-6 text-sm">
                No products yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-100
                        shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">
              Recent Inquiries
            </h3>
            <span className="badge bg-trade-gold/10 text-amber-700">
              {stats.inquiries} total
            </span>
          </div>
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq._id}
                className="p-3 rounded-xl border border-gray-100
                           hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {inq.name}
                    </p>
                    <p className="text-xs text-gray-400">{inq.email}</p>
                  </div>
                  <span className={`badge text-xs ${
                    inq.status === "new"
                      ? "bg-blue-100 text-blue-600"
                      : inq.status === "read"
                        ? "bg-gray-100 text-gray-600"
                        : inq.status === "replied"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                  }`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">
                  📦 {inq.productName}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {inq.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs
                                   text-gray-400">
                    <FiClock size={10} />
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {inq.status === "new" && (
                      <button
                        onClick={() =>
                          handleInquiryStatus(inq._id, "read")
                        }
                        className="p-1 bg-blue-50 text-blue-600
                                   rounded-lg hover:bg-blue-100
                                   transition-colors"
                        title="Mark as Read"
                      >
                        <FiCheck size={12} />
                      </button>
                    )}
                    {inq.status === "read" && (
                      <button
                        onClick={() =>
                          handleInquiryStatus(inq._id, "replied")
                        }
                        className="p-1 bg-green-50 text-green-600
                                   rounded-lg hover:bg-green-100
                                   transition-colors"
                        title="Mark as Replied"
                      >
                        <FiCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInquiry(inq._id)}
                      className="p-1 bg-red-50 text-red-500 rounded-lg
                                 hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-center text-gray-300 py-6 text-sm">
                No inquiries yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-900">
            Categories Overview
          </h3>
          <Link to="/categories"
            className="text-sm text-trade-navy font-medium
                       hover:text-trade-gold transition-colors">
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3
                        lg:grid-cols-5 gap-3">
          {categories.slice(0, 10).map((cat) => (
            <div key={cat._id}
              className="text-center p-3 rounded-xl bg-gray-50
                         hover:bg-trade-light transition-colors">
              <p className="text-2xl mb-1">{cat.icon}</p>
              <p className="text-xs font-medium text-gray-700
                            truncate">
                {cat.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {cat.productCount} products
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* ── Role & Permission Management ── */}
      <RolePermissionTable roles={roles} setRoles={setRoles} />
      
    </div>
  );
};

export default Dashboard;