import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiLock, FiPackage, FiEye, FiEyeOff,
  FiCheck, FiX,
} from "react-icons/fi";
import API from "../api/axios";
import {
  validatePassword, getPasswordStrength,
  isPasswordValid,
} from "../utils/validators";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 28;

const RuleItem = ({ valid, label }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${
    valid ? "text-green-400" : "text-[rgba(255,255,255,0.4)]"
  }`}>
    {valid
      ? <FiCheck className="text-green-400 flex-shrink-0" size={11} />
      : <FiX    className="text-[rgba(255,255,255,0.2)] flex-shrink-0" size={11} />
    }
    {label}
  </div>
);

const ResetPassword = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [form, setForm] = useState({
    password: "", confirmPassword: "",
  });
  const particleRef = useRef(null);

  const passRules    = validatePassword(form.password);
  const passStrength = getPasswordStrength(form.password);
  const confError    = form.confirmPassword &&
    form.password !== form.confirmPassword;

  const isFormValid  =
    isPasswordValid(form.password) &&
    form.password === form.confirmPassword;

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
    if (!isFormValid) {
      return toast.error("Please fix all errors");
    }
    try {
      setLoading(true);
      const { data } = await API.post(
        `/auth/reset-password/${token}`,
        { password: form.password }
      );
      toast.success("Password reset successfully! ✅");
      navigate("/login");
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
              Reset Password
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>
              Enter your new password below
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

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.35)" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Min 8 characters"
                    style={{
                      width:"100%",padding:"0.65rem 2.5rem", background:"rgba(255,255,255,0.07)",
                      border:"1px solid rgba(255,255,255,0.12)",
                      borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none", transition:"border-color 0.25s,box-shadow 0.25s",
                    }}
                    onFocus={e => { e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.15)"; e.target.style.borderColor="rgba(245,158,11,0.55)"; }}
                    onBlurCapture={e => { e.target.style.boxShadow="none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer" }}
                  >
                    {showPass
                      ? <FiEyeOff size={15} />
                      : <FiEye    size={15} />
                    }
                  </button>
                </div>

                {/* Strength Bar */}
                {form.password && (
                  <div className="mt-2 text-[10px]">
                    <div className="flex justify-between mb-1">
                      <span style={{ color:"rgba(255,255,255,0.5)" }}>Strength</span>
                      <span className={`font-medium ${
                        passStrength.label === "Very Strong"
                          ? "text-green-400"
                          : passStrength.label === "Strong"
                            ? "text-blue-400"
                            : "text-red-400"
                      }`}>
                        {passStrength.label}
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.1)" }}>
                      <div
                        className={`h-full rounded-full transition-all ${passStrength.color}`}
                        style={{ width: `${passStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rules */}
                {form.password && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5 p-2 rounded-lg" style={{ background:"rgba(255,255,255,0.04)" }}>
                    {passRules.map((rule) => (
                      <RuleItem
                        key={rule.id}
                        valid={rule.valid}
                        label={rule.label}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.35)" }} />
                  <input
                    type={showConf ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p, confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Repeat password"
                    style={{
                      width:"100%",padding:"0.65rem 2.5rem", background:"rgba(255,255,255,0.07)",
                      border: confError ? "1px solid rgba(239,68,68,0.55)" : form.confirmPassword && !confError ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none", transition:"border-color 0.25s,box-shadow 0.25s",
                    }}
                    onFocus={e => { e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.15)"; e.target.style.borderColor="rgba(245,158,11,0.55)"; }}
                    onBlurCapture={e => { e.target.style.boxShadow="none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer" }}
                  >
                    {showConf
                      ? <FiEyeOff size={15} />
                      : <FiEye    size={15} />
                    }
                  </button>
                </div>
                {confError && (
                  <p className="text-[10px] text-red-400 mt-1">
                    Passwords do not match
                  </p>
                )}
                {form.confirmPassword && !confError && (
                  <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                    <FiCheck size={10} /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full mt-2 py-3 font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontFamily:"Poppins,sans-serif", fontSize:"0.95rem", border:"none",
                  cursor: loading || !isFormValid ? "not-allowed" : "pointer",
                  opacity: loading || !isFormValid ? 0.55 : 1,
                  boxShadow:"0 4px 20px rgba(245,158,11,0.35)", transition:"transform 0.15s,box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  if (!loading && isFormValid) {
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
                    Resetting...
                  </>
                ) : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login"
                className="text-sm transition-colors"
                style={{ color:"rgba(255,255,255,0.5)" }}
                onMouseEnter={e => e.target.style.color="#fff"}
                onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.5)"}
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;