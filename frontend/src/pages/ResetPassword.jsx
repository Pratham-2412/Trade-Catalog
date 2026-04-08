import { useState } from "react";
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

const RuleItem = ({ valid, label }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${
    valid ? "text-green-600" : "text-gray-400"
  }`}>
    {valid
      ? <FiCheck className="text-green-500 flex-shrink-0" size={11} />
      : <FiX    className="text-gray-300  flex-shrink-0" size={11} />
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

  const passRules    = validatePassword(form.password);
  const passStrength = getPasswordStrength(form.password);
  const confError    = form.confirmPassword &&
    form.password !== form.confirmPassword;

  const isFormValid  =
    isPasswordValid(form.password) &&
    form.password === form.confirmPassword;

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
    <div className="min-h-screen bg-trade-light flex items-center
                    justify-center px-4">
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
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2
                                   -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Min 8 characters"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  {showPass
                    ? <FiEyeOff size={16} />
                    : <FiEye    size={16} />
                  }
                </button>
              </div>

              {/* Strength Bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Strength</span>
                    <span className={`text-xs font-medium ${
                      passStrength.label === "Very Strong"
                        ? "text-green-600"
                        : passStrength.label === "Strong"
                          ? "text-blue-600"
                          : "text-red-500"
                    }`}>
                      {passStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all
                                  ${passStrength.color}`}
                      style={{ width: `${passStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rules */}
              {form.password && (
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

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2
                                   -translate-y-1/2 text-gray-400" />
                <input
                  type={showConf ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p, confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repeat password"
                  className={`input-field pl-10 pr-10 ${
                    confError
                      ? "border-red-300 focus:ring-red-300"
                      : form.confirmPassword && !confError
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
                  {showConf
                    ? <FiEyeOff size={16} />
                    : <FiEye    size={16} />
                  }
                </button>
              </div>
              {confError && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
              {form.confirmPassword && !confError && (
                <p className="text-xs text-green-600 mt-1
                              flex items-center gap-1">
                  <FiCheck size={10} /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 bg-trade-navy text-white font-medium
                         rounded-xl hover:bg-blue-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2
                                  border-white/30 border-t-white
                                  animate-spin" />
                  Resetting...
                </>
              ) : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login"
              className="text-sm text-gray-500 hover:text-trade-navy
                         transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;