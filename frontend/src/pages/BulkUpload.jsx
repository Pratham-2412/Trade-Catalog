import { useState, useRef, useEffect } from "react";
import {
  FiUploadCloud, FiFile, FiX, FiDownload,
  FiCheckCircle, FiAlertCircle, FiInfo,
} from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 30;

const BulkUpload = () => {
  const [csvFile,  setCsvFile]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const particleRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return;
    }
    setCsvFile(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
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
        background:#fbbf24;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  const handleSubmit = async () => {
    if (!csvFile) return toast.error("Please select a CSV file");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("csv", csvFile);
      const { data } = await API.post("/products/bulk-upload", formData);
      setResult(data);
      setCsvFile(null);
      toast.success(`${data.inserted} products uploaded! ✅`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = [
      "name,description,shortDescription,category,price,currency,unit," +
      "minOrderQuantity,maxOrderQuantity,origin,hsCode,leadTime," +
      "paymentTerms,certifications,stockStatus,isFeatured,tags," +
      "specifications,imageUrl",

      '"Basmati Rice","Premium long grain basmati rice exported from India",' +
      '"Premium Grade A Basmati Rice","Food & Agriculture",45.00,USD,kg,' +
      '100,10000,India,1006.30,"7-10 days",T/T,"ISO 9001|FSSAI",' +
      'in_stock,true,"rice|basmati|organic",' +
      '"Moisture:14% max|Grade:Premium|Purity:99.5%",' +
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/' +
      'Oryza_sativa_-_Gaussian_Blur.jpg/320px-Oryza_sativa_-_Gaussian_Blur.jpg',

      '"Olive Oil","Extra virgin cold pressed olive oil","Cold Pressed EVOO",' +
      '"Oils & Lubricants",120.00,EUR,liter,50,5000,Spain,1509.10,' +
      '"5-7 days",L/C,"EU Organic|ISO 22000",in_stock,false,' +
      '"oil|olive|organic","Acidity:≤0.8%|Polyphenols:High",' +
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/' +
      'Olive_oil_from_Oneglia.jpg/320px-Olive_oil_from_Oneglia.jpg',
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "tradecatalog_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded! ✅");
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
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated Orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#f59e0b", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#8b5cf6", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-white tracking-tight" style={{ fontFamily:"Poppins,sans-serif" }}>
              Bulk Upload
            </h1>
            <p className="mt-1 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>
              Upload multiple products at once using a CSV file
            </p>
          </div>

          {/* Template Download */}
          <div className="rounded-2xl p-6 mb-6 text-white flex items-center justify-between gap-4 flex-wrap relative overflow-hidden shadow-lg border"
               style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.15),rgba(30,64,175,0.15))", borderColor:"rgba(59,130,246,0.3)", backdropFilter:"blur(15px)" }}>
            <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 5s ease-in-out infinite" }} />
            <div className="relative z-10">
              <p className="font-bold text-lg mb-1 tracking-wide" style={{ color:"#60a5fa" }}>
                📥 Download CSV Template
              </p>
              <p className="font-medium text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
                Use our template with all fields including image URLs,
                specifications, and certifications
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold transition-all relative z-10"
              style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", boxShadow:"0 4px 15px rgba(245,158,11,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            >
              <FiDownload size={16} />
              DOWNLOAD TEMPLATE
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6 backdrop-blur-md"
            style={{
              borderColor: dragging ? "#3b82f6" : csvFile ? "#10b981" : "rgba(255,255,255,0.15)",
              background: dragging ? "rgba(59,130,246,0.05)" : csvFile ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
              transform: dragging ? "scale(1.01)" : "scale(1)"
            }}
            onMouseEnter={e => {if(!dragging && !csvFile) e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
            onMouseLeave={e => {if(!dragging && !csvFile) e.currentTarget.style.background="rgba(255,255,255,0.02)"}}
          >
            {csvFile ? (
              <div className="flex flex-col items-center" style={{ animation:"cardIn 0.3s both" }}>
                <div className="p-4 rounded-full mb-3 flex items-center justify-center border"
                     style={{ background:"rgba(16,185,129,0.1)", borderColor:"rgba(16,185,129,0.2)" }}>
                  <FiFile className="text-3xl" style={{ color:"#34d399" }} />
                </div>
                <p className="font-bold text-white tracking-wide">{csvFile.name}</p>
                <p className="text-sm font-medium mt-1" style={{ color:"#34d399" }}>
                  {(csvFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCsvFile(null); }}
                  className="mt-4 flex items-center gap-1 text-sm font-bold transition-colors uppercase tracking-wider"
                  style={{ color:"#f87171" }}
                >
                  <FiX size={14} /> Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-3 flex items-center justify-center border" style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)" }}>
                  <FiUploadCloud className="text-3xl" style={{ color:"#60a5fa" }} />
                </div>
                <p className="font-bold text-white tracking-wide">
                  Drop your CSV file here
                </p>
                <p className="text-sm font-medium mt-1" style={{ color:"rgba(255,255,255,0.5)" }}>
                  or click to browse files
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-3" style={{ color:"rgba(255,255,255,0.3)" }}>
                  CSV only · Max 5MB
                </p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleSubmit}
            disabled={!csvFile || loading}
            className="w-full py-3.5 text-white font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mb-6 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", boxShadow:(!csvFile||loading)?"none":"0 4px 15px rgba(59,130,246,0.3)" }}
          >
            {(!csvFile||loading) ? null : <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />}
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                UPLOADING...
              </>
            ) : (
              <>
                <FiUploadCloud size={18} />
                UPLOAD CSV
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="rounded-xl shadow-sm p-6 mb-6" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)", animation:"cardIn 0.4s both" }}>
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider">
                Upload Results
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "TOTAL ROWS", value: result.totalRows, color: "blue", text:"#60a5fa", bg:"rgba(59,130,246,0.15)", border:"rgba(59,130,246,0.3)"  },
                  { label: "INSERTED",   value: result.inserted,  color: "green", text:"#4ade80", bg:"rgba(34,197,94,0.15)", border:"rgba(34,197,94,0.3)" },
                  { label: "SKIPPED",    value: result.skipped,   color: "red", text:"#f87171", bg:"rgba(239,68,68,0.15)", border:"rgba(239,68,68,0.3)"   },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-4 text-center border" style={{ background: s.bg, borderColor: s.border }}>
                    <p className="text-3xl font-bold" style={{ color: s.text }}>
                      {s.value}
                    </p>
                    <p className="text-[10px] font-bold mt-1 tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {result.errors?.length > 0 && (
                <div className="mt-4">
                  <p className="font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-1" style={{ color:"#f87171" }}>
                    <FiAlertCircle /> SKIPPED ROWS:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {result.errors.map((err, i) => (
                      <div key={i} className="rounded-lg p-3 text-sm border flex flex-col md:flex-row md:items-center gap-1" style={{ background:"rgba(239,68,68,0.05)", borderColor:"rgba(239,68,68,0.1)" }}>
                        <span className="font-bold flex-shrink-0" style={{ color:"#fca5a5" }}>
                          Row {err.row}:
                        </span>
                        <span className="font-medium" style={{ color:"rgba(255,255,255,0.7)" }}>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.inserted > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm font-bold tracking-wide" style={{ color:"#34d399" }}>
                  <FiCheckCircle />
                  {result.inserted} products added successfully!
                </div>
              )}
            </div>
          )}

          {/* CSV Guide */}
          <div className="rounded-xl shadow-sm p-6" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", backdropFilter:"blur(15px)" }}>
            <h4 className="font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
              <FiInfo style={{ color:"#60a5fa" }} />
              CSV Column Guide
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  <tr>
                    <th className="pb-3 px-2 font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Column</th>
                    <th className="pb-3 px-2 font-bold uppercase tracking-wider text-center" style={{ color:"rgba(255,255,255,0.4)" }}>Required</th>
                    <th className="pb-3 px-2 font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Example</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["name",             "✅", "Basmati Rice"],
                    ["description",      "✅", "Premium long grain..."],
                    ["shortDescription", "❌", "Premium Grade A"],
                    ["category",         "✅", "Food & Agriculture"],
                    ["price",            "✅", "45.00"],
                    ["currency",         "❌", "USD (default)"],
                    ["unit",             "❌", "kg"],
                    ["minOrderQuantity", "❌", "100"],
                    ["maxOrderQuantity", "❌", "10000 (0=unlimited)"],
                    ["origin",           "❌", "India"],
                    ["hsCode",           "❌", "1006.30"],
                    ["leadTime",         "❌", "7-10 days"],
                    ["paymentTerms",     "❌", "T/T"],
                    ["certifications",   "❌", "ISO 9001|FSSAI (pipe)"],
                    ["stockStatus",      "❌", "in_stock/limited/out_of_stock"],
                    ["isFeatured",       "❌", "true/false"],
                    ["tags",             "❌", "rice|organic (pipe)"],
                    ["specifications",   "❌", "Moisture:14%|Grade:A (pipe)"],
                    ["imageUrl",         "❌", "https://... (image URL)"],
                  ].map(([col, req, ex]) => (
                    <tr key={col} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                      <td className="py-2.5 px-2 font-mono font-medium" style={{ color:"#93c5fd" }}>
                        {col}
                      </td>
                      <td className="py-2.5 px-2 text-center text-sm">{req}</td>
                      <td className="py-2.5 px-2 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Custom scrollbar styles if needed for the errors list */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkUpload;