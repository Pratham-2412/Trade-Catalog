import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail, FiLock, FiPackage,
  FiEye, FiEyeOff, FiCheck, FiX,
  FiAlertTriangle, FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../utils/validators";
import toast from "react-hot-toast";

/* ── Floating particle dots ── */
const PARTICLE_COUNT = 28;

const FieldError = ({ errors }) => {
  if (!errors?.length) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      {errors.map((e, i) => (
        <p key={i} className="text-xs text-red-400 flex items-center gap-1">
          <FiX size={10} /> {e}
        </p>
      ))}
    </div>
  );
};

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState({});
  const [lockInfo, setLockInfo] = useState(null);
  const [form, setForm]         = useState({ email: "", password: "" });
  const particleRef             = useRef(null);

  const emailErrors = touched.email ? validateEmail(form.email) : [];
  const isFormValid =
    validateEmail(form.email).length === 0 && form.password.length > 0;

  /* ── Spawn particle dots ── */
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (lockInfo) setLockInfo(null);
  };

  const handleBlur = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }
    try {
      setLoading(true);
      setLockInfo(null);
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.name}! ✅`);
      navigate("/");
    } catch (error) {
      if (error.response?.status === 423) {
        setLockInfo(error.response.data);
      } else if (error.response?.data?.attemptsLeft !== undefined) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.error || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Keyframes injected once ── */}
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
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: "#0a1628" }}
      >
        {/* ── Animated orbs ── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width:420, height:420,
            background:"#f59e0b",
            filter:"blur(72px)",
            opacity:0.14,
            top:"-130px", right:"-90px",
            animation:"orbFloat 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width:320, height:320,
            background:"#3b82f6",
            filter:"blur(72px)",
            opacity:0.16,
            bottom:"-90px", left:"-70px",
            animation:"orbFloat 8s ease-in-out infinite",
            animationDelay:"3s",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width:200, height:200,
            background:"#f59e0b",
            filter:"blur(60px)",
            opacity:0.10,
            bottom:"80px", right:"60px",
            animation:"orbFloat 8s ease-in-out infinite",
            animationDelay:"5s",
          }}
        />

        {/* ── Grid overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
            backgroundSize:"40px 40px",
          }}
        />

        {/* ── Rising gold particles ── */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        {/* ── Card ── */}
        <div
          className="relative z-10 w-full max-w-md"
          style={{ animation:"cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div
                className="p-2.5 rounded-xl flex items-center justify-center"
                style={{
                  background:"linear-gradient(135deg,#1a3c5e,#2563eb)",
                  animation:"iconPulse 3s ease-in-out infinite",
                }}
              >
                <FiPackage className="text-white text-2xl" />
              </div>
              <span
                className="font-bold text-2xl text-white"
                style={{ fontFamily:"Poppins,sans-serif" }}
              >
                Trade<span style={{ color:"#f59e0b" }}>Catalog</span>
              </span>
            </div>
            <h1
              className="font-bold text-2xl text-white"
              style={{ fontFamily:"Poppins,sans-serif" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>
              Sign in to your account
            </p>
          </div>

          {/* Glass card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 0 0 1px rgba(245,158,11,0.08)," +
                "0 30px 70px rgba(0,0,0,0.5)," +
                "inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter:"blur(20px)",
            }}
          >
            {/* Divider with gold glow */}
            <div
              className="mb-6"
              style={{
                height:1,
                background:"linear-gradient(to right,transparent,rgba(245,158,11,0.4),transparent)",
              }}
            />

            {/* Lock alert */}
            {lockInfo && (
              <div
                className="rounded-xl p-4 mb-5 flex items-start gap-3"
                style={{
                  background:"rgba(239,68,68,0.1)",
                  border:"1px solid rgba(239,68,68,0.3)",
                }}
              >
                <FiAlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Account Locked</p>
                  <p className="text-red-400 text-xs mt-1">{lockInfo.error}</p>
                  <p className="text-red-500 text-xs mt-1">
                    Try again at: {new Date(lockInfo.lockUntil).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: emailErrors.length
                        ? "rgba(239,68,68,0.7)"
                        : "rgba(255,255,255,0.35)",
                    }}
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    style={{
                      width:"100%",padding:"0.65rem 2.5rem",
                      background:"rgba(255,255,255,0.07)",
                      border: touched.email && emailErrors.length
                        ? "1px solid rgba(239,68,68,0.55)"
                        : touched.email && !emailErrors.length
                          ? "1px solid rgba(34,197,94,0.45)"
                          : "1px solid rgba(255,255,255,0.12)",
                      borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none",
                      transition:"border-color 0.25s,box-shadow 0.25s",
                    }}
                    onFocus={e => {
                      e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.15)";
                      e.target.style.borderColor="rgba(245,158,11,0.55)";
                    }}
                    onBlurCapture={e => { e.target.style.boxShadow="none"; }}
                  />
                  {touched.email && !emailErrors.length && (
                    <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" size={14} />
                  )}
                </div>
                <FieldError errors={emailErrors} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                  Password
                </label>
                <div className="relative">
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color:"rgba(255,255,255,0.35)" }}
                  />
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your password"
                    style={{
                      width:"100%",padding:"0.65rem 2.5rem",
                      background:"rgba(255,255,255,0.07)",
                      border:"1px solid rgba(255,255,255,0.12)",
                      borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none",
                      transition:"border-color 0.25s,box-shadow 0.25s",
                    }}
                    onFocus={e => {
                      e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.15)";
                      e.target.style.borderColor="rgba(245,158,11,0.55)";
                    }}
                    onBlurCapture={e => { e.target.style.boxShadow="none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer" }}
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium transition-colors"
                    style={{ color:"rgba(245,158,11,0.8)" }}
                    onMouseEnter={e => e.target.style.color="#f59e0b"}
                    onMouseLeave={e => e.target.style.color="rgba(245,158,11,0.8)"}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !!lockInfo}
                className="w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background:"linear-gradient(135deg,#f59e0b,#d97706)",
                  color:"#fff",
                  fontFamily:"Poppins,sans-serif",
                  fontSize:"0.95rem",
                  border:"none",
                  cursor: loading || lockInfo ? "not-allowed" : "pointer",
                  opacity: loading || lockInfo ? 0.55 : 1,
                  boxShadow:"0 4px 20px rgba(245,158,11,0.35)",
                  transition:"transform 0.15s,box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  if (!loading && !lockInfo) {
                    e.currentTarget.style.transform="translateY(-1px)";
                    e.currentTarget.style.boxShadow="0 6px 28px rgba(245,158,11,0.5)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="0 4px 20px rgba(245,158,11,0.35)";
                }}
              >
                {/* shimmer sweep */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)",
                    animation:"btnShimmer 3s ease-in-out infinite",
                  }}
                />
                {loading ? (
                  <>
                    <div
                      className="h-5 w-5 rounded-full border-2 animate-spin"
                      style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"#fff" }}
                    />
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            {/* Security note */}
            <div
              className="mt-4 p-3 rounded-lg flex items-center justify-center gap-2"
              style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",
              }}
            >
              <FiShield size={12} style={{ color:"rgba(255,255,255,0.3)" }} />
              <p className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>
                Account locks after 5 failed attempts for 15 minutes
              </p>
            </div>

            <p className="text-center text-sm mt-4" style={{ color:"rgba(255,255,255,0.4)" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold transition-colors"
                style={{ color:"#f59e0b" }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;