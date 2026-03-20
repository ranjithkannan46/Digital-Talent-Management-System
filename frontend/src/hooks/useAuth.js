import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const TOKEN_KEY = "talent_token";
const USER_KEY = "talent_user";

export const useAuth = () => {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveSession = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return { user, loading, error, register, login, logout };
};
