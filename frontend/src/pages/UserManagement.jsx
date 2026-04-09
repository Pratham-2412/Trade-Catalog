import { useState, useEffect } from "react";
import { FiUsers, FiShield, FiUnlock, FiTrash2,
         FiSearch, FiCheck } from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const ROLES = ["user", "manager", "admin"];

const RoleBadge = ({ role }) => {
  const colors = {
    admin:   "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    user:    "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`badge ${colors[role] || "bg-gray-100 text-gray-600"} capitalize px-3 py-1`}>
      {role}
    </span>
  );
};

const UserManagement = () => {
  const { user: currentUser }   = useAuth();
  const [users,   setUsers]     = useState([]);
  const [roles,   setRoles]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchUsersAndRoles = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        API.get("/auth/users"),
        API.get("/settings/roles")
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsersAndRoles(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      await API.put(`/direct-role-update/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, role: newRole } : u)
      );
      toast.success("Role updated successfully! ✅");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      setUpdating(userId);
      await API.put(`/auth/users/${userId}`, { isActive: !isActive });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !isActive } : u
        )
      );
      toast.success(`Account ${!isActive ? "activated" : "deactivated"}! ✅`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleUnlock = async (userId) => {
    try {
      setUpdating(userId);
      await API.put(`/auth/users/${userId}/unlock`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, loginAttempts: 0, lockUntil: null }
            : u
        )
      );
      toast.success("Account unlocked successfully! ✅");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setUpdating(userId);
      await API.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully! ✅");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner text="Loading users..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-trade-navy">
          User Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage users, roles and account status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users",   value: users.length,
            color: "bg-trade-navy" },
          { label: "Admins",        value: users.filter(u=>u.role==="admin").length,
            color: "bg-red-500"    },
          { label: "Managers",      value: users.filter(u=>u.role==="manager").length,
            color: "bg-blue-500"   },
          { label: "Active Users",  value: users.filter(u=>u.isActive).length,
            color: "bg-green-500"  },
        ].map((s) => (
          <div key={s.label}
            className="bg-white rounded-xl border border-gray-100
                       shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold text-white ${s.color}
                           rounded-lg py-1 mb-1`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h}
                    className="text-left py-3.5 px-4 text-gray-500
                               font-medium text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const isLocked  = u.lockUntil && new Date(u.lockUntil) > new Date();
                const isUpdating = updating === u._id;
                const isSelf     = u._id === currentUser?._id;

                return (
                  <tr key={u._id}
                    className="hover:bg-gray-50 transition-colors">

                    {/* Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-trade-navy
                                        flex items-center justify-center
                                        flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-trade-gold">
                                (You)
                              </span>
                            )}
                          </p>
                          {isLocked && (
                            <p className="text-xs text-red-500 mt-0.5">
                              🔒 Locked
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-gray-500">{u.email}</td>

                    {/* Role Dropdown */}
                    <td className="py-4 px-4">
                      {isSelf ? (
                        <RoleBadge role={u.role} />
                      ) : (
                        <select
                          value={u.role}
                          disabled={isUpdating}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg
                                     px-2 py-1.5 focus:outline-none
                                     focus:ring-2 focus:ring-trade-navy
                                     bg-white cursor-pointer"
                        >
                          {/* Standard System Roles */}
                          {!roles.find(r => r.name === "user") && <option value="user">User</option>}
                          {!roles.find(r => r.name === "manager") && <option value="manager">Manager</option>}
                          {!roles.find(r => r.name === "admin") && <option value="admin">Admin</option>}
                          
                          {/* Custom Created Roles */}
                          {roles.map((r) => (
                            <option key={r._id} value={r.name} className="capitalize">
                              {r.displayName}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`badge ${
                        !u.isActive
                          ? "bg-red-100 text-red-600"
                          : isLocked
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-600"
                      }`}>
                        {!u.isActive ? "Inactive" :
                         isLocked    ? "Locked"   : "Active"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="py-4 px-4 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      {!isSelf && (
                        <div className="flex items-center gap-2">
                          {/* Unlock */}
                          {isLocked && (
                            <button
                              onClick={() => handleUnlock(u._id)}
                              disabled={isUpdating}
                              title="Unlock Account"
                              className="p-1.5 rounded-lg bg-orange-50
                                         text-orange-600 hover:bg-orange-100
                                         transition-colors"
                            >
                              <FiUnlock size={14} />
                            </button>
                          )}

                          {/* Activate/Deactivate */}
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            disabled={isUpdating}
                            title={u.isActive ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {u.isActive
                              ? <FiShield size={14} />
                              : <FiCheck  size={14} />
                            }
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={isUpdating}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500
                                       hover:bg-red-100 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="text-gray-200 text-5xl mx-auto mb-3" />
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;