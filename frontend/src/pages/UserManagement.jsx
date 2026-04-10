import { useState, useEffect, useRef } from "react";
import { FiUsers, FiShield, FiUnlock, FiTrash2,
         FiSearch, FiCheck } from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const ROLES = ["user", "manager", "admin"];
const PARTICLE_COUNT = 30;

const RoleBadge = ({ role }) => {
  const styles = {
    admin:   { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
    manager: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    user:    { bg: "rgba(156,163,175,0.15)", color: "#d1d5db", border: "rgba(156,163,175,0.3)" },
  };
  const current = styles[role] || styles.user;
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: current.bg, color: current.color, border: `1px solid ${current.border}` }}>
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
  const particleRef = useRef(null);

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

  // ── Particles setup ──
  useEffect(() => {
    const wrap = particleRef.current;
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const d = document.createElement("div");
      d.style.cssText = `
        position:absolute;
        width:4px;height:4px;border-radius:50%;
        background:#3b82f6;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    try {
      setUpdating(userId);
      // Use the standard, original PUT route
      await API.put(`/auth/users/${userId}`, { role: newRole });
      
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("User role updated successfully! ✅");
    } catch (error) {
      toast.error(error.message || "Failed to update role");
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

  if (loading) return (
    <div className="flex items-center justify-center py-20 min-h-screen" style={{ background:"#0a1628" }}>
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-trade-navy animate-spin" />
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
        .dark-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .dark-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
        }
        .dark-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        select.dark-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          outline: none;
          cursor: pointer;
        }
        select.dark-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
        }
        select.dark-select option {
          background: #0f172a;
          color: #fff;
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#ef4444", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
              User Management
            </h1>
            <p className="mt-1" style={{ color:"rgba(255,255,255,0.6)" }}>
              Manage users, roles and account status
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users",   value: users.length,                             bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border:"rgba(59,130,246,0.2)" },
              { label: "Admins",        value: users.filter(u=>u.role==="admin").length,   bg: "rgba(239,68,68,0.1)",  text: "#f87171", border:"rgba(239,68,68,0.2)" },
              { label: "Managers",      value: users.filter(u=>u.role==="manager").length, bg: "rgba(168,85,247,0.1)", text: "#c084fc", border:"rgba(168,85,247,0.2)" },
              { label: "Active Users",  value: users.filter(u=>u.isActive).length,       bg: "rgba(34,197,94,0.1)",  text: "#4ade80", border:"rgba(34,197,94,0.2)" },
            ].map((s) => (
              <div key={s.label}
                className="rounded-xl shadow-sm p-4 text-center"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                <p className="text-2xl font-bold rounded-lg py-1 mb-1 shadow-sm"
                   style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                  {s.value}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="rounded-xl shadow-sm p-4 mb-6"
               style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.4)" }} />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dark-input"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl shadow-sm overflow-hidden"
               style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ background:"rgba(0,0,0,0.2)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  <tr>
                    {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h}
                        className="py-3.5 px-4 font-bold text-xs uppercase tracking-wide"
                        style={{ color:"rgba(255,255,255,0.4)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  {filtered.map((u) => {
                    const isLocked  = u.lockUntil && new Date(u.lockUntil) > new Date();
                    const isUpdating = updating === u._id;
                    const isSelf     = u._id === currentUser?._id;

                    return (
                      <tr key={u._id}
                        className="transition-colors border-b"
                        style={{ borderBottomColor:"rgba(255,255,255,0.05)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>

                        {/* Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                 style={{ background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)" }}>
                              <span className="text-white text-sm font-bold">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {u.name}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] uppercase font-bold" style={{ color:"#f59e0b" }}>
                                    (You)
                                  </span>
                                )}
                              </p>
                              {isLocked && (
                                <p className="text-[10px] uppercase font-bold mt-1" style={{ color:"#f87171" }}>
                                  🔒 Locked
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 font-medium" style={{ color:"rgba(255,255,255,0.6)" }}>{u.email}</td>

                        {/* Role Dropdown */}
                        <td className="py-4 px-4">
                          {isSelf ? (
                            <RoleBadge role={u.role} />
                          ) : (
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="dark-select uppercase tracking-wider font-bold"
                            >
                              {/* Standard System Roles */}
                              {!roles.find(r => r.name === "user") && <option value="user">USER</option>}
                              {!roles.find(r => r.name === "manager") && <option value="manager">MANAGER</option>}
                              {!roles.find(r => r.name === "admin") && <option value="admin">ADMIN</option>}
                              
                              {/* Custom Created Roles */}
                              {roles.map((r) => (
                                <option key={r._id} value={r.name} className="uppercase">
                                  {r.displayName}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                                style={
                                  !u.isActive
                                    ? { background:"rgba(239,68,68,0.15)", color:"#f87171", border:"1px solid rgba(239,68,68,0.3)" }
                                    : isLocked
                                      ? { background:"rgba(249,115,22,0.15)", color:"#fb923c", border:"1px solid rgba(249,115,22,0.3)" }
                                      : { background:"rgba(34,197,94,0.15)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.3)" }
                                }>
                            {!u.isActive ? "INACTIVE" :
                             isLocked    ? "LOCKED"   : "ACTIVE"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="py-4 px-4 text-xs font-medium" style={{ color:"rgba(255,255,255,0.4)" }}>
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
                                  className="p-1.5 rounded-lg transition-colors border"
                                  style={{ background:"rgba(249,115,22,0.1)", color:"#fb923c", borderColor:"rgba(249,115,22,0.2)" }}
                                  onMouseEnter={e => e.currentTarget.style.background="rgba(249,115,22,0.2)"}
                                  onMouseLeave={e => e.currentTarget.style.background="rgba(249,115,22,0.1)"}
                                >
                                  <FiUnlock size={14} />
                                </button>
                              )}

                              {/* Activate/Deactivate */}
                              <button
                                onClick={() => handleToggleActive(u._id, u.isActive)}
                                disabled={isUpdating}
                                title={u.isActive ? "Deactivate" : "Activate"}
                                className="p-1.5 rounded-lg transition-colors border"
                                style={
                                  u.isActive
                                    ? { background:"rgba(239,68,68,0.1)", color:"#f87171", borderColor:"rgba(239,68,68,0.2)" }
                                    : { background:"rgba(34,197,94,0.1)", color:"#4ade80", borderColor:"rgba(34,197,94,0.2)" }
                                }
                                onMouseEnter={e => e.currentTarget.style.background=u.isActive?"rgba(239,68,68,0.2)":"rgba(34,197,94,0.2)"}
                                onMouseLeave={e => e.currentTarget.style.background=u.isActive?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)"}
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
                                className="p-1.5 rounded-lg transition-colors border"
                                style={{ background:"rgba(239,68,68,0.1)", color:"#f87171", borderColor:"rgba(239,68,68,0.2)" }}
                                onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.2)"}
                                onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
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
                  <FiUsers className="text-5xl mx-auto mb-3" style={{ color:"rgba(255,255,255,0.2)" }} />
                  <p className="font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;