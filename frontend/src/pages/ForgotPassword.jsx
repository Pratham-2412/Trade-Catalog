import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiPackage,
  FiArrowLeft,
  FiCheckCircle,
  FiX,
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

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const emailErrors = touched ? validateEmail(email) : [];
  const isValid = validateEmail(email).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email);
      setSuccessMessage(data.message || "Password reset link sent to your email");
      toast.success(data.message || "Password reset link sent");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
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
            Forgot Password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {successMessage ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {successMessage}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-trade-navy font-medium hover:text-trade-gold transition-colors"
              >
                <FiArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      emailErrors.length ? "text-red-400" : "text-gray-400"
                    }`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder="you@example.com"
                      className={`input-field pl-10 ${
                        touched && emailErrors.length
                          ? "border-red-300 focus:ring-red-300"
                          : ""
                      }`}
                    />
                  </div>
                  <FieldError errors={emailErrors} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-trade-navy text-white font-medium
                             rounded-xl hover:bg-blue-800 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Sending reset link...
                    </>
                  ) : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-trade-navy font-medium hover:text-trade-gold transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;