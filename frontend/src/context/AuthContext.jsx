import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("tradecatalog_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      API.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password, otp) => {
    const { data } = await API.post("/auth/register", {
      name, email, password, otp
    });
    setUser(data);
    localStorage.setItem("tradecatalog_user", JSON.stringify(data));
    API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    return data;
  };

  const sendOTP = async (email) => {
    const { data } = await API.post("/auth/send-otp", { email });
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await API.post("/auth/verify-otp", { email, otp });
    return data;
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("tradecatalog_user", JSON.stringify(data));
      API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    const { data } = await API.post("/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await API.post(`/auth/reset-password/${token}`, {
      password,
    });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tradecatalog_user");
    delete API.defaults.headers.common["Authorization"];
  };

  const isAdmin   = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isUser    = user?.role === "user";
  const canEdit   = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      user, loading,
      register, login, logout,
      forgotPassword, resetPassword,
      sendOTP, verifyOTP,
      isAdmin, isManager, isUser, canEdit,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);