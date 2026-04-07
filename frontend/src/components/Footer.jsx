import { Link } from "react-router-dom";
import { FiPackage, FiGlobe, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-trade-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Brand ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-trade-gold p-1.5 rounded-lg">
                <FiPackage className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-lg">
                Trade<span className="text-trade-gold">Catalog</span>
              </span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">
              Your trusted platform for managing import-export 
              product catalogs with ease.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="font-display font-semibold text-white mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { path: "/",            label: "Product Catalog" },
                { path: "/add-product", label: "Add Product"     },
                { path: "/bulk-upload", label: "Bulk Upload"     },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-blue-300 text-sm hover:text-trade-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="font-display font-semibold text-white mb-3">
              Contact
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-blue-300 text-sm">
                <FiGlobe className="text-trade-gold flex-shrink-0" />
                www.tradecatalog.com
              </li>
              <li className="flex items-center gap-2 text-blue-300 text-sm">
                <FiMail className="text-trade-gold flex-shrink-0" />
                info@tradecatalog.com
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-blue-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-400 text-sm">
            © {new Date().getFullYear()} TradeCatalog. All rights reserved.
          </p>
          <p className="text-blue-400 text-sm">
            Import · Export · Trade
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;