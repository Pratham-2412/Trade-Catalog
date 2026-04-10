import { Link } from "react-router-dom";
import { FiPackage, FiGlobe, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="mt-auto relative overflow-hidden" style={{ background:"linear-gradient(135deg,#0f2540 0%,#1a3c5e 60%,#0f2540 100%)", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
      {/* Gold top accent line */}
      <div style={{ height: 2, background: "linear-gradient(to right,transparent,#f59e0b,#d97706,transparent)" }} />
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Brand ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4 group cursor-pointer">
              <div
                className="p-2 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  boxShadow: "0 0 16px rgba(245,158,11,0.4)"
                }}
              >
                <FiPackage className="text-white text-xl" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-wide">
                Trade<span style={{ color: "#f59e0b" }}>Catalog</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(147,197,253,0.7)" }}>
              Your trusted platform for managing import-export 
              product catalogs with ease.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="font-display font-bold text-white tracking-wider uppercase text-sm mb-4" style={{ color:"rgba(255,255,255,0.9)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { path: "/products",    label: "Product Catalog" },
                { path: "/add-product", label: "Add Product"     },
                { path: "/bulk-upload", label: "Bulk Upload"     },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm transition-all duration-200 inline-flex items-center gap-2"
                    style={{ color: "rgba(147,197,253,0.7)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f59e0b"; e.currentTarget.style.transform = "translateX(5px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(147,197,253,0.7)"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.2)" }} /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="font-display font-bold text-white tracking-wider uppercase text-sm mb-4" style={{ color:"rgba(255,255,255,0.9)" }}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm transition-colors" style={{ color: "rgba(147,197,253,0.7)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <FiGlobe style={{ color:"#f59e0b" }} />
                </div>
                www.tradecatalog.com
              </li>
              <li className="flex items-center gap-3 text-sm transition-colors" style={{ color: "rgba(147,197,253,0.7)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <FiMail style={{ color:"#f59e0b" }} />
                </div>
                info@tradecatalog.com
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-medium tracking-wide" style={{ color: "rgba(147,197,253,0.5)" }}>
            © {new Date().getFullYear()} TradeCatalog. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.4)" }}>
              Import
            </p>
            <span className="w-1 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.2)" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.4)" }}>
              Export
            </p>
            <span className="w-1 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.2)" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.4)" }}>
              Trade
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;