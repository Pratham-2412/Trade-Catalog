import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPackage, FiArrowLeft, FiCheck } from "react-icons/fi";
import API from "../api/axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

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
            Forgot Password?
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full
                              flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-green-500 text-2xl" />
              </div>
              <h3 className="font-display font-semibold text-gray-900
                             text-lg mb-2">
                Email Sent!
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                We've sent a password reset link to{" "}
                <strong>{email}</strong>
              </p>
              <p className="text-gray-400 text-xs mb-6">
                ⏱️ Link expires in 15 minutes
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-trade-navy font-medium
                           hover:text-trade-gold transition-colors"
              >
                Didn't receive? Resend
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2
                                     -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-trade-navy text-white
                           font-medium rounded-xl hover:bg-blue-800
                           transition-colors disabled:opacity-60
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2
                                    border-white/30 border-t-white
                                    animate-spin" />
                    Sending...
                  </>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login"
              className="flex items-center justify-center gap-2
                         text-sm text-gray-500 hover:text-trade-navy
                         transition-colors">
              <FiArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;