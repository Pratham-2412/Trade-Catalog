import { useState, useEffect, useRef } from "react";
import {
  FiSettings, FiShield, FiTag, FiPlus,
  FiEdit2, FiTrash2, FiSave, FiX, FiCheck,
} from "react-icons/fi";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 30;

const Settings = () => {
  const [activeTab,    setActiveTab]    = useState("hsn");
  const [hsnCodes,     setHsnCodes]     = useState([]);
  const [roles,        setRoles]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const particleRef = useRef(null);
  
  // Forms
  const [hsnForm,      setHsnForm]      = useState({ code: "", description: "", gstRate: 18 });
  const [roleForm,     setRoleForm]     = useState({ name: "", displayName: "", description: "" });
  const [editingId,    setEditingId]    = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "hsn") {
        const { data } = await API.get("/settings/hsn");
        setHsnCodes(data);
      } else {
        const { data } = await API.get("/settings/roles");
        setRoles(data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  // ── HSN Handlers ──
  const handleHsnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/settings/hsn/${editingId}`, hsnForm);
        toast.success("HSN Code updated");
      } else {
        await API.post("/settings/hsn", hsnForm);
        toast.success("HSN Code created");
      }
      setHsnForm({ code: "", description: "", gstRate: 18 });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const deleteHsn = async (id) => {
    if (!window.confirm("Delete this HSN Code?")) return;
    try {
      await API.delete(`/settings/hsn/${id}`);
      toast.success("HSN Code deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ── Role Handlers ──
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/settings/roles/${editingId}`, roleForm);
        toast.success("Role updated");
      } else {
        await API.post("/settings/roles", roleForm);
        toast.success("Role created");
      }
      setRoleForm({ name: "", displayName: "", description: "" });
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const deleteRole = async (id) => {
    if (!window.confirm("Delete this Role?")) return;
    try {
      await API.delete(`/settings/roles/${id}`);
      toast.success("Role deleted");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

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
        .dark-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 100%;
          padding: 0.75rem 1rem;
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
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#f59e0b", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background:"rgba(59,130,246,0.2)", border:"1px solid rgba(59,130,246,0.3)", color:"#60a5fa" }}>
              <FiSettings size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily:"Poppins,sans-serif" }}>
                System Settings
              </h1>
              <p className="mt-1 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>Manage dynamic roles and product HSN codes</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b pb-px" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => { setActiveTab("hsn"); setEditingId(null); }}
              className="flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2"
              style={{
                borderColor: activeTab === "hsn" ? "#f59e0b" : "transparent",
                color: activeTab === "hsn" ? "#fbbf24" : "rgba(255,255,255,0.4)",
                background: activeTab === "hsn" ? "rgba(245,158,11,0.05)" : "transparent",
                borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem"
              }}
            >
              <FiTag /> HSN Codes
            </button>
            <button
              onClick={() => { setActiveTab("roles"); setEditingId(null); }}
              className="flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2"
              style={{
                borderColor: activeTab === "roles" ? "#f59e0b" : "transparent",
                color: activeTab === "roles" ? "#fbbf24" : "rgba(255,255,255,0.4)",
                background: activeTab === "roles" ? "rgba(245,158,11,0.05)" : "transparent",
                borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem"
              }}
            >
              <FiShield /> Dynamic Roles
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl shadow-sm p-6 sticky top-24"
                   style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-wide">
                  {editingId ? <FiEdit2 style={{ color:"#fbbf24" }} /> : <FiPlus style={{ color:"#60a5fa" }} />}
                  {editingId ? "EDIT" : "ADD NEW"} {activeTab === "hsn" ? "HSN CODE" : "ROLE"}
                </h3>

                {activeTab === "hsn" ? (
                  <form onSubmit={handleHsnSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        HSN Code
                      </label>
                      <input
                        type="text"
                        required
                        value={hsnForm.code}
                        onChange={(e) => setHsnForm({ ...hsnForm, code: e.target.value })}
                        className="dark-input"
                        placeholder="e.g. 1006.30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        Description
                      </label>
                      <textarea
                        value={hsnForm.description}
                        onChange={(e) => setHsnForm({ ...hsnForm, description: e.target.value })}
                        className="dark-input resize-none"
                        rows="3"
                        placeholder="Brief description..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        GST Rate (%)
                      </label>
                      <input
                        type="number"
                        value={hsnForm.gstRate}
                        onChange={(e) => setHsnForm({ ...hsnForm, gstRate: e.target.value })}
                        className="dark-input"
                      />
                    </div>
                    <button type="submit"
                            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden"
                            style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}>
                      <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                      <FiSave /> {editingId ? "Update HSN" : "Create HSN"}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setHsnForm({ code: "", description: "", gstRate: 18 }); }}
                              className="w-full py-3 mt-2 rounded-xl font-bold transition-all border"
                              style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)", color:"#fff" }}
                              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                        Cancel
                      </button>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        Role ID <span style={{ textTransform:"none" }}>(e.g. staff)</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={editingId && ["admin", "manager", "user"].includes(roleForm.name)}
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        className="dark-input disabled:opacity-50"
                        placeholder="lowercase-no-spaces"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={roleForm.displayName}
                        onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                        className="dark-input"
                        placeholder="e.g. Staff Member"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        className="dark-input"
                        placeholder="Brief description..."
                      />
                    </div>
                    <button type="submit"
                            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden"
                            style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}>
                      <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                       <FiSave /> {editingId ? "Update Role" : "Create Role"}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setRoleForm({ name: "", displayName: "", description: "" }); }}
                              className="w-full py-3 mt-2 rounded-xl font-bold transition-all border"
                              style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)", color:"#fff" }}
                              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                        Cancel
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-sm overflow-hidden"
                   style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                {loading ? (
                  <div className="py-20 flex justify-center"><Spinner /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead style={{ background:"rgba(0,0,0,0.2)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                        <tr>
                          {activeTab === "hsn" ? (
                            <>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Code</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>GST</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Description</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>ID</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Role Name</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Desc</th>
                            </>
                          )}
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color:"rgba(255,255,255,0.4)" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                        {activeTab === "hsn" ? (
                          hsnCodes.map((hsn) => (
                            <tr key={hsn._id} className="transition-colors border-b"
                                style={{ borderBottomColor:"rgba(255,255,255,0.05)" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.03)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                              <td className="px-6 py-4 font-bold text-white">{hsn.code}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider"
                                      style={{ background:"rgba(34,197,94,0.15)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.3)" }}>
                                  {hsn.gstRate}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium truncate max-w-xs" style={{ color:"rgba(255,255,255,0.5)" }}>{hsn.description}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => { setEditingId(hsn._id); setHsnForm(hsn); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 transition-colors rounded-lg" style={{ color:"#f59e0b" }} onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(245,158,11,0.1)"} onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}><FiEdit2 size={16} /></button>
                                  <button onClick={() => deleteHsn(hsn._id)} className="p-2 transition-colors rounded-lg" style={{ color:"#f87171" }} onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(239,68,68,0.1)"} onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}><FiTrash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          roles.map((role) => (
                            <tr key={role._id} className="transition-colors border-b"
                                style={{ borderBottomColor:"rgba(255,255,255,0.05)" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.03)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                              <td className="px-6 py-4 font-bold text-white">{role.name}</td>
                              <td className="px-6 py-4 text-sm font-bold uppercase tracking-wider" style={{ color:"#60a5fa" }}>{role.displayName}</td>
                              <td className="px-6 py-4 text-sm font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>{role.description}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => { setEditingId(role._id); setRoleForm(role); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 transition-colors rounded-lg" style={{ color:"#f59e0b" }} onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(245,158,11,0.1)"} onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}><FiEdit2 size={16} /></button>
                                   {!["admin", "manager", "user"].includes(role.name) && (
                                     <button onClick={() => deleteRole(role._id)} className="p-2 transition-colors rounded-lg" style={{ color:"#f87171" }} onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(239,68,68,0.1)"} onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}><FiTrash2 size={16} /></button>
                                   )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && (activeTab === "hsn" ? hsnCodes.length : roles.length) === 0 && (
                  <div className="py-20 text-center font-bold tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>NO RECORDS FOUND</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
