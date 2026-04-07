import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail, FiLock, FiPackage,
  FiEye, FiEyeOff, FiCheck, FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../utils/validators";
import toast from "react-hot-toast";

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

const Login = () => {
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState({});
  const [lockInfo, setLockInfo] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const emailErrors = touched.email ? validateEmail(form.email) : [];

  const isFormValid =
    validateEmail(form.email).length === 0 &&
    form.password.length > 0;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (lockInfo) setLockInfo(null);
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

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
    <div className="min-h-screen bg-trade-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">

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
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {lockInfo && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium text-sm">
                    Account Locked
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    {lockInfo.error}
                  </p>
                  <p className="text-red-500 text-xs mt-1">
                    Try again at:{" "}
                    {new Date(lockInfo.lockUntil).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              <FieldError errors={emailErrors} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-trade-navy hover:text-trade-gold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockInfo}
              className="w-full py-3 bg-trade-navy text-white font-medium
                         rounded-xl hover:bg-blue-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              🔒 Account locks after 5 failed attempts for 15 minutes
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-trade-navy font-medium hover:text-trade-gold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;