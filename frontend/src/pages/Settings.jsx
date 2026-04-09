import { useState, useEffect } from "react";
import {
  FiSettings, FiShield, FiTag, FiPlus,
  FiEdit2, FiTrash2, FiSave, FiX, FiCheck,
} from "react-icons/fi";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeTab,    setActiveTab]    = useState("hsn");
  const [hsnCodes,     setHsnCodes]     = useState([]);
  const [roles,        setRoles]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-trade-navy text-white rounded-xl shadow-lg">
          <FiSettings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            System Settings
          </h1>
          <p className="text-gray-500">Manage dynamic roles and product HSN codes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-100 pb-px">
        <button
          onClick={() => { setActiveTab("hsn"); setEditingId(null); }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "hsn"
              ? "border-trade-gold text-trade-gold bg-amber-50/50 rounded-t-xl"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <FiTag /> HSN Codes
        </button>
        <button
          onClick={() => { setActiveTab("roles"); setEditingId(null); }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "roles"
              ? "border-trade-gold text-trade-gold bg-amber-50/50 rounded-t-xl"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <FiShield /> Dynamic Roles
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              {editingId ? <FiEdit2 className="text-trade-gold" /> : <FiPlus className="text-trade-navy" />}
              {editingId ? "Edit" : "Add New"} {activeTab === "hsn" ? "HSN Code" : "Role"}
            </h3>

            {activeTab === "hsn" ? (
              <form onSubmit={handleHsnSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    required
                    value={hsnForm.code}
                    onChange={(e) => setHsnForm({ ...hsnForm, code: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 1006.30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={hsnForm.description}
                    onChange={(e) => setHsnForm({ ...hsnForm, description: e.target.value })}
                    className="input-field"
                    placeholder="Brief description..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={hsnForm.gstRate}
                    onChange={(e) => setHsnForm({ ...hsnForm, gstRate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <FiSave /> {editingId ? "Update HSN" : "Create HSN"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setHsnForm({ code: "", description: "", gstRate: 18 }); }} className="btn-secondary w-full py-3 mt-2">
                    Cancel
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Role ID (e.g. staff)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingId && ["admin", "manager", "user"].includes(roleForm.name)}
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="input-field"
                    placeholder="lowercase-no-spaces"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.displayName}
                    onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Staff Member"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                   <FiSave /> {editingId ? "Update Role" : "Create Role"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setRoleForm({ name: "", displayName: "", description: "" }); }} className="btn-secondary w-full py-3 mt-2">
                    Cancel
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {activeTab === "hsn" ? (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">GST</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Desc</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeTab === "hsn" ? (
                    hsnCodes.map((hsn) => (
                      <tr key={hsn._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-trade-navy">{hsn.code}</td>
                        <td className="px-6 py-4 text-sm"><span className="badge bg-green-50 text-green-700">{hsn.gstRate}%</span></td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{hsn.description}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingId(hsn._id); setHsnForm(hsn); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-gray-400 hover:text-trade-gold transition-colors"><FiEdit2 size={16} /></button>
                            <button onClick={() => deleteHsn(hsn._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    roles.map((role) => (
                      <tr key={role._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-trade-navy">{role.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{role.displayName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{role.description}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => { setEditingId(role._id); setRoleForm(role); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-gray-400 hover:text-trade-gold transition-colors"><FiEdit2 size={16} /></button>
                             {!["admin", "manager", "user"].includes(role.name) && (
                               <button onClick={() => deleteRole(role._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={16} /></button>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {!loading && (activeTab === "hsn" ? hsnCodes.length : roles.length) === 0 && (
              <div className="py-20 text-center text-gray-400">No records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
