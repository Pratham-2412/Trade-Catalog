import { useState } from "react";
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

// ── Password Rule Item ──
const RuleItem = ({ valid, label }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${
    valid ? "text-green-600" : "text-gray-400"
  }`}>
    {valid
      ? <FiCheck className="text-green-500 flex-shrink-0" />
      : <FiX    className="text-gray-300  flex-shrink-0" />
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
        <p key={i} className="text-xs text-red-500 flex items-center gap-1">
          <FiX size={10} /> {e}
        </p>
      ))}
    </div>
  );
};

const Register = () => {
  const navigate    = useNavigate();
  const { register} = useAuth();
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [touched,   setTouched]   = useState({});
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });

  // ── Real-time validation ──
  const nameErrors  = touched.name     ? validateName(form.name)   : [];
  const emailErrors = touched.email    ? validateEmail(form.email)  : [];
  const passRules   = validatePassword(form.password);
  const passStrength= getPasswordStrength(form.password);
  const confError   = touched.confirmPassword && form.confirmPassword
    && form.password !== form.confirmPassword
    ? ["Passwords do not match"] : [];

  const isFormValid =
    validateName(form.name).length    === 0 &&
    validateEmail(form.email).length  === 0 &&
    isPasswordValid(form.password)         &&
    form.password === form.confirmPassword;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      setLoading(true);
      const data = await register(form.name, form.email, form.password);
      toast.success(data.message || "Account created successfully! ✅");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-trade-light flex items-center
                    justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="bg-trade-navy p-2.5 rounded-xl">
              <FiPackage className="text-white text-2xl" />
            </div>
            <span className="font-display font-bold text-2xl text-trade-navy">
              Trade<span className="text-trade-gold">Catalog</span>
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Join TradeCatalog today
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Name ── */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 
                  ${nameErrors.length ? "text-red-400" : "text-gray-400"}`} />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Pratham Shah"
                  className={`input-field pl-10 ${
                    touched.name && nameErrors.length
                      ? "border-red-300 focus:ring-red-300"
                      : touched.name && !nameErrors.length
                        ? "border-green-300 focus:ring-green-300"
                        : ""
                  }`}
                />
                {touched.name && !nameErrors.length && (
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2
                                      text-green-500" />
                )}
              </div>
              <FieldError errors={nameErrors} />
            </div>

            {/* ── Email ── */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2
                  ${emailErrors.length ? "text-red-400" : "text-gray-400"}`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${
                    touched.email && emailErrors.length
                      ? "border-red-300 focus:ring-red-300"
                      : touched.email && !emailErrors.length
                        ? "border-green-300 focus:ring-green-300"
                        : ""
                  }`}
                />
                {touched.email && !emailErrors.length && (
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2
                                      text-green-500" />
                )}
              </div>
              <FieldError errors={emailErrors} />
            </div>

            {/* ── Password ── */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-gray-400" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Min 8 characters"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Strength Bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      Password strength
                    </span>
                    <span className={`text-xs font-medium ${
                      passStrength.label === "Very Strong" ? "text-green-600" :
                      passStrength.label === "Strong"      ? "text-blue-600"  :
                      passStrength.label === "Medium"      ? "text-yellow-600":
                      "text-red-600"
                    }`}>
                      {passStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300
                                  ${passStrength.color}`}
                      style={{ width: `${passStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Rules */}
              {(touched.password || form.password) && (
                <div className="mt-3 grid grid-cols-2 gap-1.5 p-3
                                bg-gray-50 rounded-lg">
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

            {/* ── Confirm Password ── */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConf ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repeat password"
                  className={`input-field pl-10 pr-10 ${
                    confError.length
                      ? "border-red-300 focus:ring-red-300"
                      : form.confirmPassword && !confError.length
                        ? "border-green-300 focus:ring-green-300"
                        : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(!showConf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  {showConf ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <FieldError errors={confError} />
              {form.confirmPassword && !confError.length && (
                <p className="text-xs text-green-600 flex items-center
                              gap-1 mt-1">
                  <FiCheck size={10} /> Passwords match
                </p>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 bg-trade-navy text-white font-medium
                         rounded-xl hover:bg-blue-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2
                                  border-white/30 border-t-white animate-spin" />
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login"
              className="text-trade-navy font-medium hover:text-trade-gold
                         transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;