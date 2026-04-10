import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail, FiLock, FiUser, FiPackage,
  FiEye, FiEyeOff, FiCheck, FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail, validatePassword,
  validateName, getPasswordStrength,
  isPasswordValid,
} from "../utils/validators";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 28;

// ── Password Rule Item ──
const RuleItem = ({ valid, label }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${
    valid ? "text-green-400" : "text-[rgba(255,255,255,0.4)]"
  }`}>
    {valid
      ? <FiCheck className="text-green-400 flex-shrink-0" />
      : <FiX    className="text-[rgba(255,255,255,0.2)] flex-shrink-0" />
    }
    {label}
  </div>
);

// ── Field Error ──
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

const Register = () => {
  const navigate    = useNavigate();
  const { register, sendOTP, verifyOTP } = useAuth();
  
  // ── States ──
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Password
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    name: "", email: "", otp: "", password: "", confirmPassword: "",
  });
  const particleRef = useRef(null);

  // ── Validations ──
  const nameErrors  = touched.name  ? validateName(form.name) : [];
  const emailErrors = touched.email ? validateEmail(form.email) : [];
  const passRules   = validatePassword(form.password);
  const passStrength = getPasswordStrength(form.password);
  const confError   = (touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword)
    ? ["Passwords do not match"] : [];

  const isStep1Valid = form.name.trim().length >= 2 && validateEmail(form.email).length === 0;
  const isStep2Valid = form.otp.length === 6;
  const isStep3Valid = isPasswordValid(form.password) && form.password === form.confirmPassword;

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

  const handleUpdate = (name, val) => setForm(f => ({ ...f, [name]: val }));

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!isStep1Valid) return;
    
    setOtpLoading(true);
    try {
      await sendOTP(form.email);
      toast.success("Verification code sent to your email! ✅");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isStep2Valid) return;
    
    setOtpLoading(true);
    try {
      await verifyOTP(form.email, form.otp);
      toast.success("Email verified successfully! ✅");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setTouched({ ...touched, password: true, confirmPassword: true });
    if (!isStep3Valid) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.otp);
      toast.success("Welcome aboard! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes dotRise { 0% { opacity:0; transform:translateY(0); } 20% { opacity:0.6; } 80% { opacity:0.3; } 100% { opacity:0; transform:translateY(-80px); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(32px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes btnShimmer { 0%,100% { transform:translateX(-100%); } 60% { transform:translateX(100%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="min-h-screen py-10 flex items-center justify-center px-4 relative overflow-hidden" 
           style={{ background: "#0a1628" }}>
        {/* Orbs & Background */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:420, height:420, background:"#f59e0b", filter:"blur(72px)", opacity:0.14, top:"-130px", right:"-90px", animation:"orbFloat 8s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:320, height:320, background:"#3b82f6", filter:"blur(72px)", opacity:0.16, bottom:"-90px", left:"-70px", animation:"orbFloat 8s ease-in-out infinite", animationDelay:"3s" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md" style={{ animation:"cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#1a3c5e,#2563eb)" }}>
                <FiPackage className="text-white text-2xl" />
              </div>
              <span className="font-bold text-2xl text-white">Trade<span style={{ color:"#f59e0b" }}>Catalog</span></span>
            </div>
            <h1 className="font-bold text-2xl text-white">Create Account</h1>
            
            {/* Steps Visual */}
            <div className="flex items-center justify-center gap-3 mt-6 mb-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                    {step > s ? <FiCheck /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-[1px] ${step > s ? "bg-amber-500" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">
              {step === 1 ? "User Information" : step === 2 ? "Email Verification" : "Secure Password"}
            </p>
          </div>

          <div className="rounded-2xl p-8" style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
            
            <form onSubmit={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleFinalRegister} className="space-y-4">
              
              {/* STEP 1: Info */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/60">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        name="name" value={form.name}
                        onChange={(e) => handleUpdate("name", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <FieldError errors={nameErrors} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/60">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        name="email" type="email" value={form.email}
                        onChange={(e) => handleUpdate("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <FieldError errors={emailErrors} />
                  </div>
                  <button type="submit" disabled={!isStep1Valid || otpLoading} className="w-full py-3 font-bold rounded-xl text-white relative overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50" style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)" }}>
                     <span className="absolute inset-0" style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)", animation:"btnShimmer 3s infinite" }} />
                     {otpLoading ? "Sending..." : "Continue"}
                  </button>
                </div>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center">
                    <p className="text-sm text-white/50 mb-4">Verification code sent to <br/><span className="text-white font-bold">{form.email}</span></p>
                    <input
                      maxLength={6} value={form.otp}
                      onChange={(e) => handleUpdate("otp", e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full h-14 text-center text-3xl font-bold tracking-[0.4em] rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <button type="submit" disabled={!isStep2Valid || otpLoading} className="w-full py-3 font-bold rounded-xl text-white transition-all active:scale-[0.98] disabled:opacity-50" style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)" }}>
                       {otpLoading ? "Verifying..." : "Verify Code"}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-white/30 hover:text-white transition-colors">Change email</button>
                  </div>
                </div>
              )}

              {/* STEP 3: Password */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/60">Create Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        type={showPass ? "text" : "password"} value={form.password}
                        onChange={(e) => handleUpdate("password", e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">{showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-white/60">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        type={showConf ? "text" : "password"} value={form.confirmPassword}
                        onChange={(e) => handleUpdate("confirmPassword", e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">{showConf ? <FiEyeOff size={16}/> : <FiEye size={16}/>}</button>
                    </div>
                    <FieldError errors={confError} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white/5">
                    <RuleItem valid={form.password.length >= 8} label="8+ chars" />
                    <RuleItem valid={/[A-Z]/.test(form.password)} label="Uppercase" />
                    <RuleItem valid={/[0-9]/.test(form.password)} label="Number" />
                    <RuleItem valid={/[!@#$%^&*]/.test(form.password)} label="Symbol" />
                  </div>

                  <button type="submit" disabled={!isStep3Valid || loading} className="w-full py-3 font-bold rounded-xl text-white relative overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50" style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)" }}>
                     <span className="absolute inset-0" style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)", animation:"btnShimmer 3s infinite" }} />
                     {loading ? "Creating Account..." : "Complete Registration"}
                  </button>
                </div>
              )}

            </form>

            <p className="text-center text-sm mt-6 text-white/30">
              Already have an account? <Link to="/login" className="text-amber-500 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;