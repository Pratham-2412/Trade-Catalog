import { useState, useRef } from "react";
import {
  FiUploadCloud, FiFile, FiX, FiDownload,
  FiCheckCircle, FiAlertCircle, FiInfo,
} from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";

const BulkUpload = () => {
  const [csvFile,  setCsvFile]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-trade-navy">
          Bulk Upload
        </h1>
        <p className="text-gray-500 mt-1">
          Upload multiple products at once using a CSV file
        </p>
      </div>

      {/* Template Download */}
      <div className="bg-gradient-to-r from-trade-navy to-blue-800
                      rounded-2xl p-6 mb-6 text-white flex items-center
                      justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-semibold text-lg mb-1">
            📥 Download CSV Template
          </p>
          <p className="text-blue-200 text-sm">
            Use our template with all fields including image URLs,
            specifications, and certifications
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-trade-gold text-white
                     px-5 py-2.5 rounded-xl font-medium
                     hover:bg-amber-600 transition-colors whitespace-nowrap"
        >
          <FiDownload size={16} />
          Download Template
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center
                    cursor-pointer transition-all duration-200 mb-6 ${
          dragging
            ? "border-trade-navy bg-trade-light scale-[1.01]"
            : csvFile
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-trade-navy hover:bg-gray-50"
        }`}
      >
        {csvFile ? (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-3">
              <FiFile className="text-green-600 text-3xl" />
            </div>
            <p className="font-medium text-green-700">{csvFile.name}</p>
            <p className="text-sm text-green-500 mt-1">
              {(csvFile.size / 1024).toFixed(1)} KB
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCsvFile(null); }}
              className="mt-3 flex items-center gap-1 text-red-400
                         hover:text-red-600 text-sm"
            >
              <FiX size={14} /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <FiUploadCloud className="text-gray-400 text-3xl" />
            </div>
            <p className="font-medium text-gray-700">
              Drop your CSV file here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-gray-300 mt-2">
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
        className="w-full py-3.5 bg-trade-navy text-white font-medium
                   rounded-xl hover:bg-blue-800 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 mb-6"
      >
        {loading ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30
                            border-t-white animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <FiUploadCloud size={18} />
            Upload CSV
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-100
                        shadow-sm p-6 mb-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">
            Upload Results
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Total Rows", value: result.totalRows, color: "blue"  },
              { label: "Inserted",   value: result.inserted,  color: "green" },
              { label: "Skipped",    value: result.skipped,   color: "red"   },
            ].map((s) => (
              <div key={s.label}
                className={`bg-${s.color}-50 rounded-xl p-4 text-center`}>
                <p className={`text-3xl font-bold text-${s.color}-600`}>
                  {s.value}
                </p>
                <p className={`text-xs text-${s.color}-500 mt-1`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {result.errors?.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-red-600 text-sm mb-2
                            flex items-center gap-1">
                <FiAlertCircle /> Skipped Rows:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <div key={i}
                    className="bg-red-50 border border-red-100 rounded-lg
                               p-3 text-sm">
                    <span className="font-medium text-red-600">
                      Row {err.row}:
                    </span>
                    <span className="text-red-500 ml-1">{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.inserted > 0 && (
            <div className="mt-4 flex items-center gap-2
                            text-green-600 text-sm">
              <FiCheckCircle />
              {result.inserted} products added successfully!
            </div>
          )}
        </div>
      )}

      {/* CSV Guide */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-6">
        <h4 className="font-display font-semibold text-gray-700 mb-4
                       flex items-center gap-2">
          <FiInfo className="text-trade-navy" />
          CSV Column Guide
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-gray-500 font-medium pr-4">Column</th>
                <th className="pb-2 text-gray-500 font-medium pr-4">Required</th>
                <th className="pb-2 text-gray-500 font-medium">Example</th>
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
                <tr key={col} className="border-b border-gray-50">
                  <td className="py-1.5 font-mono text-trade-navy pr-4">
                    {col}
                  </td>
                  <td className="py-1.5 text-center pr-4">{req}</td>
                  <td className="py-1.5 text-gray-500">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;