import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPackage, FiArrowLeft, FiCheck } from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 28;

const ForgotPassword = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const particleRef = useRef(null);

  useEffect(() => {
    const wrap = particleRef.current;
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const d = document.createElement("div");
      d.style.cssText = `
        position:absolute;
        width:3px;height:3px;border-radius:50%;
        background:#f59e0b;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 40}%;
        animation:dotRise ${4 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 6}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent! Check your email ✅");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
        @keyframes iconPulse {
          0%,100% { box-shadow:0 0 18px rgba(37,99,235,0.45),0 4px 14px rgba(0,0,0,0.3); }
          50%     { box-shadow:0 0 32px rgba(37,99,235,0.75),0 4px 20px rgba(0,0,0,0.4); }
        }
        @keyframes btnShimmer {
          0%,100% { transform:translateX(-100%); }
          60%     { transform:translateX(100%); }
        }
      `}</style>
      
      <div
        className="min-h-screen py-10 flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: "#0a1628" }}
      >
        {/* Animated orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:420, height:420, background:"#f59e0b", filter:"blur(72px)", opacity:0.14, top:"-130px", right:"-90px", animation:"orbFloat 8s ease-in-out infinite" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:320, height:320, background:"#3b82f6", filter:"blur(72px)", opacity:0.16, bottom:"-90px", left:"-70px", animation:"orbFloat 8s ease-in-out infinite", animationDelay:"3s" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:200, height:200, background:"#f59e0b", filter:"blur(60px)", opacity:0.10, bottom:"80px", right:"60px", animation:"orbFloat 8s ease-in-out infinite", animationDelay:"5s" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }}
        />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md" style={{ animation:"cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div
                className="p-2.5 rounded-xl flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#1a3c5e,#2563eb)", animation:"iconPulse 3s ease-in-out infinite" }}
              >
                <FiPackage className="text-white text-2xl" />
              </div>
              <span className="font-bold text-2xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                Trade<span style={{ color:"#f59e0b" }}>Catalog</span>
              </span>
            </div>
            <h1 className="font-bold text-2xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
              Forgot Password?
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>
              Enter your email and we'll send a reset link
            </p>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(245,158,11,0.08),0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter:"blur(20px)",
            }}
          >
            <div
              className="mb-6"
              style={{ height:1, background:"linear-gradient(to right,transparent,rgba(245,158,11,0.4),transparent)" }}
            />

            {sent ? (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <FiCheck className="text-green-400 text-2xl" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Email Sent!
                </h3>
                <p className="text-sm mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
                  We've sent a password reset link to{" "}
                  <strong className="text-white">{email}</strong>
                </p>
                <p className="text-xs mb-6" style={{ color:"rgba(255,255,255,0.4)" }}>
                  ⏱️ Link expires in 15 minutes
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm font-medium transition-colors"
                  style={{ color:"rgba(245,158,11,0.8)" }}
                  onMouseEnter={e => e.target.style.color="#f59e0b"}
                  onMouseLeave={e => e.target.style.color="rgba(245,158,11,0.8)"}
                >
                  Didn't receive? Resend
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.35)" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      style={{
                        width:"100%",padding:"0.65rem 2.5rem", background:"rgba(255,255,255,0.07)",
                        border:"1px solid rgba(255,255,255,0.12)",
                        borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none", transition:"border-color 0.25s,box-shadow 0.25s",
                      }}
                      onFocus={e => { e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.15)"; e.target.style.borderColor="rgba(245,158,11,0.55)"; }}
                      onBlurCapture={e => { e.target.style.boxShadow="none"; }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{
                    background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontFamily:"Poppins,sans-serif", fontSize:"0.95rem", border:"none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.55 : 1,
                    boxShadow:"0 4px 20px rgba(245,158,11,0.35)", transition:"transform 0.15s,box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform="translateY(-1px)";
                      e.currentTarget.style.boxShadow="0 6px 28px rgba(245,158,11,0.5)";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform="translateY(0)";
                    e.currentTarget.style.boxShadow="0 4px 20px rgba(245,158,11,0.35)";
                  }}
                >
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }}
                  />
                  {loading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 animate-spin" style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"#fff" }} />
                      Sending...
                    </>
                  ) : "Send Reset Link"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login"
                className="flex items-center justify-center gap-2 text-sm transition-colors"
                style={{ color:"rgba(255,255,255,0.5)" }}
                onMouseEnter={e => e.target.style.color="#fff"}
                onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.5)"}
              >
                <FiArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;