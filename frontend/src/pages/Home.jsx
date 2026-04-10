import { Link } from "react-router-dom";
import { FiArrowRight, FiPackage, FiShield, FiGlobe, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden" 
         style={{ background: "#050b14" }}>
         
      <style>{`
        @keyframes floatHome {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shimmerHome {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        .orb-home {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: floatHome 10s ease-in-out infinite;
        }
        .shimmer-btn-home::after {
          content: "";
          position: absolute;
          top: 0; 
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 60%);
          animation: shimmerHome 3s infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Background Animated Orbs */}
      <div className="orb-home" style={{ top: '10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(59,130,246,0.15)', animationDelay: '0s' }} />
      <div className="orb-home" style={{ top: '40%', right: '-10%', width: '500px', height: '500px', background: 'rgba(245,158,11,0.12)', animationDelay: '-5s' }} />
      <div className="orb-home" style={{ bottom: '-10%', left: '20%', width: '300px', height: '300px', background: 'rgba(16,185,129,0.1)', animationDelay: '-2s' }} />
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none", zIndex:0 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050b14]/50 to-[#050b14] z-0 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8"
             style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(245,158,11,0.3)", backdropFilter: "blur(10px)" }}>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            TradeCatalog 2.0 Live
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          Elevate Your Global <br className="hidden md:block" /> 
          <span style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            B2B Trade Experience
          </span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl text-gray-400 mb-10 leading-relaxed font-medium">
          The ultimate platform for discovering premium import-export products, sending unified inquiries, and managing your global B2B catalog securely.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/products"
            className="shimmer-btn-home relative overflow-hidden flex items-center gap-2 px-8 py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all shadow-xl"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", boxShadow: "0 10px 30px -10px rgba(245,158,11,0.6)" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Explore Catalog <FiArrowRight size={16} />
          </Link>
          
          {!user && (
            <Link 
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all border"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(10px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              Partner With Us
            </Link>
          )}
        </div>
      </div>

      {/* Features Showcase */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FiPackage, 
              title: "Bulk Ordering", 
              desc: "Effortlessly place high-volume demands with dynamic pricing models and quick invoice handling.",
              color: "#3b82f6",
              stagger: "stagger-1"
            },
            {
              icon: FiGlobe, 
              title: "Global Reach", 
              desc: "Connecting manufacturers and global importers natively without unnecessary intermediary barriers.",
              color: "#f59e0b",
              stagger: "stagger-2"
            },
            {
              icon: FiShield, 
              title: "Secure Verification", 
              desc: "Trusted by verified enterprise companies featuring robust role-based access controls and tracing.",
              color: "#10b981",
              stagger: "stagger-3"
            }
          ].map((feat, i) => (
            <div key={i} className={`reveal ${feat.stagger} group p-8 rounded-2xl border transition-all duration-500 overflow-hidden relative backdrop-blur-md`}
                 style={{ background: "rgba(10,22,40,0.6)", borderColor: "rgba(255,255,255,0.05)" }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = feat.color; e.currentTarget.style.transform = "translateY(-5px)"; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-3xl" style={{ background: feat.color }} />
              
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}>
                <feat.icon size={24} style={{ color: feat.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
