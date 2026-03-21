import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const saveSession = (token, user) => {
    localStorage.setItem("dtms_token", token);
    localStorage.setItem("dtms_user", JSON.stringify(user));
  };

  const register = useCallback(async (name, email, password) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("dtms_token");
    localStorage.removeItem("dtms_user");
    navigate("/", { replace: true });
  }, [navigate]);

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("dtms_user")); }
    catch { return null; }
  };

  return { loading, error, register, login, logout, getUser };
};